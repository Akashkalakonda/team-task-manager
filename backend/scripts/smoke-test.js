const baseUrl = process.env.API_URL || "http://localhost:5000/api";
const stamp = Date.now();

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    }
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(`${options.label || path}: ${response.status} ${data.message || text}`);
  }

  return data;
};

const expectBlocked = async (label, action) => {
  try {
    await action();
  } catch {
    return;
  }

  throw new Error(`${label}: expected request to be blocked`);
};

const run = async () => {
  const admin = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: `Admin Test ${stamp}`,
      email: `admin${stamp}@example.com`,
      password: "password123",
      role: "ADMIN"
    }),
    label: "admin signup"
  });

  const member = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: `Member Test ${stamp}`,
      email: `member${stamp}@example.com`,
      password: "password123",
      role: "MEMBER"
    }),
    label: "member signup"
  });

  await request("/auth/me", { token: admin.token, label: "protected /auth/me" });

  await expectBlocked("member project create", () =>
    request("/projects", {
      method: "POST",
      token: member.token,
      body: JSON.stringify({ name: "Blocked Project" })
    })
  );

  const { project } = await request("/projects", {
    method: "POST",
    token: admin.token,
    body: JSON.stringify({ name: `QA Project ${stamp}`, description: "E2E verification" }),
    label: "admin project create"
  });

  await request(`/projects/${project.id}/members`, {
    method: "POST",
    token: admin.token,
    body: JSON.stringify({ userId: member.user.id, role: "MEMBER" }),
    label: "add member"
  });

  const { task } = await request("/tasks", {
    method: "POST",
    token: admin.token,
    body: JSON.stringify({
      title: `QA Task ${stamp}`,
      description: "Verify flow",
      projectId: project.id,
      assignedToId: member.user.id,
      priority: "HIGH",
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }),
    label: "admin task create"
  });

  await request(`/tasks/${task.id}/status`, {
    method: "PATCH",
    token: member.token,
    body: JSON.stringify({ status: "IN_PROGRESS" }),
    label: "member status update"
  });

  const dashboard = await request("/dashboard", { token: admin.token, label: "dashboard" });

  if (!dashboard.summary || dashboard.summary.totalTasks < 1) {
    throw new Error("dashboard: expected task counts");
  }

  await expectBlocked("member project delete", () =>
    request(`/projects/${project.id}`, {
      method: "DELETE",
      token: member.token
    })
  );

  await request(`/tasks/${task.id}`, {
    method: "DELETE",
    token: admin.token,
    label: "admin task cleanup"
  });

  await request(`/projects/${project.id}`, {
    method: "DELETE",
    token: admin.token,
    label: "admin project cleanup"
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "signup/login token",
          "protected route",
          "admin project create",
          "member project create blocked",
          "member add",
          "admin task create",
          "member task status update",
          "dashboard counts",
          "member project delete blocked",
          "admin cleanup"
        ]
      },
      null,
      2
    )
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
