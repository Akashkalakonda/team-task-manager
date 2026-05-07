import React from "react";
import { CheckCircle2, Clock3, FolderKanban, ListTodo, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import TaskCard from "../components/TaskCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardApi, taskApi } from "../services/api.js";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.get(token);
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const handleStatusChange = async (taskId, status) => {
    await taskApi.updateStatus(taskId, status, token);
    loadDashboard();
  };

  const summary = dashboard?.summary || {};

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Welcome, {user?.name}</span>
          <h1>Dashboard</h1>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="summary-grid">
        <SummaryCard icon={<FolderKanban />} label="Projects" value={summary.projectCount || 0} />
        <SummaryCard icon={<ListTodo />} label="Tasks" value={summary.totalTasks || 0} />
        <SummaryCard icon={<Clock3 />} label="In progress" value={summary.inProgressTasks || 0} />
        <SummaryCard icon={<CheckCircle2 />} label="Done" value={summary.doneTasks || 0} />
        <SummaryCard icon={<TimerReset />} label="Overdue" value={summary.overdueTasks || 0} danger />
      </div>

      <div className="section-heading">
        <h2>Recent tasks</h2>
      </div>
      <div className="task-list">
        {dashboard?.recentTasks?.length ? (
          dashboard.recentTasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
          ))
        ) : (
          <div className="empty-state">No tasks yet. Create a project and add your first task.</div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ icon, label, value, danger = false }) {
  return (
    <article className={`summary-card ${danger ? "danger" : ""}`}>
      <div className="summary-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
