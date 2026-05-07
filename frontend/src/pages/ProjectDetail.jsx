import React from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TaskCard from "../components/TaskCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { projectApi, taskApi, userApi } from "../services/api.js";

const emptyTask = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assignedToId: ""
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [memberForm, setMemberForm] = useState({ userId: "", role: "MEMBER" });
  const [error, setError] = useState("");

  const loadProject = async () => {
    try {
      const data = await projectApi.get(projectId, token);
      setProject(data.project);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProject();
    if (isAdmin) {
      userApi.list(token).then((data) => setUsers(data.users)).catch(() => setUsers([]));
    }
  }, [projectId, token, isAdmin]);

  const memberIds = useMemo(() => new Set(project?.members?.map((member) => member.userId) || []), [project]);
  const assignableUsers = users.filter((user) => memberIds.has(user.id));
  const availableUsers = users.filter((user) => !memberIds.has(user.id));

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await taskApi.create(
        {
          ...taskForm,
          projectId,
          assignedToId: taskForm.assignedToId || null,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null
        },
        token
      );
      setTaskForm(emptyTask);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await projectApi.addMember(projectId, memberForm, token);
      setMemberForm({ userId: "", role: "MEMBER" });
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async () => {
    setError("");

    try {
      await projectApi.remove(projectId, token);
      navigate("/projects");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError("");

    try {
      await taskApi.updateStatus(taskId, status, token);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!project) {
    return <div className="center-screen">Loading project...</div>;
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Project</span>
          <h1>{project.name}</h1>
          <p>{project.description || "No description added."}</p>
        </div>
        {isAdmin && (
          <button className="danger-button" onClick={handleDeleteProject}>
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="split-layout">
        <section>
          <div className="section-heading">
            <h2>Tasks</h2>
          </div>

          {isAdmin && (
            <form className="stack-form" onSubmit={handleCreateTask}>
              <input
                placeholder="Task title"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={taskForm.description}
                onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
              />
              <div className="form-row">
                <select
                  value={taskForm.assignedToId}
                  onChange={(event) => setTaskForm({ ...taskForm, assignedToId: event.target.value })}
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                />
              </div>
              <button type="submit">
                <Plus size={16} />
                Add task
              </button>
            </form>
          )}

          <div className="task-list">
            {project.tasks?.length ? (
              project.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))
            ) : (
              <div className="empty-state">No tasks in this project yet.</div>
            )}
          </div>
        </section>

        <aside className="side-panel">
          <div className="section-heading">
            <h2>Team</h2>
          </div>

          {isAdmin && (
            <form className="member-form" onSubmit={handleAddMember}>
              <select
                value={memberForm.userId}
                onChange={(event) => setMemberForm({ ...memberForm, userId: event.target.value })}
                required
              >
                <option value="">Select user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <select
                value={memberForm.role}
                onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit">
                <UserPlus size={16} />
                Add
              </button>
            </form>
          )}

          <div className="member-list">
            {project.members?.map((member) => (
              <div className="member-row" key={member.id}>
                <div>
                  <strong>{member.user.name}</strong>
                  <span>{member.user.email}</span>
                </div>
                <small>{member.role}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
