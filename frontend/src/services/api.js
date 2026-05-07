const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const request = async (path, options = {}, token) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const jsonOptions = (method, body) => ({
  method,
  body: JSON.stringify(body)
});

export const authApi = {
  signup: (payload) => request("/auth/signup", jsonOptions("POST", payload)),
  login: (payload) => request("/auth/login", jsonOptions("POST", payload)),
  me: (token) => request("/auth/me", {}, token)
};

export const userApi = {
  list: (token) => request("/users", {}, token)
};

export const projectApi = {
  list: (token) => request("/projects", {}, token),
  get: (id, token) => request(`/projects/${id}`, {}, token),
  create: (payload, token) => request("/projects", jsonOptions("POST", payload), token),
  update: (id, payload, token) => request(`/projects/${id}`, jsonOptions("PUT", payload), token),
  remove: (id, token) => request(`/projects/${id}`, { method: "DELETE" }, token),
  addMember: (id, payload, token) =>
    request(`/projects/${id}/members`, jsonOptions("POST", payload), token),
  removeMember: (id, userId, token) =>
    request(`/projects/${id}/members/${userId}`, { method: "DELETE" }, token)
};

export const taskApi = {
  list: (token) => request("/tasks", {}, token),
  get: (id, token) => request(`/tasks/${id}`, {}, token),
  create: (payload, token) => request("/tasks", jsonOptions("POST", payload), token),
  update: (id, payload, token) => request(`/tasks/${id}`, jsonOptions("PUT", payload), token),
  updateStatus: (id, status, token) =>
    request(`/tasks/${id}/status`, jsonOptions("PATCH", { status }), token),
  remove: (id, token) => request(`/tasks/${id}`, { method: "DELETE" }, token)
};

export const dashboardApi = {
  get: (token) => request("/dashboard", {}, token)
};
