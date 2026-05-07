import { useEffect, useState } from "react";
import TaskCard from "../components/TaskCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { taskApi } from "../services/api.js";

export default function Tasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const data = await taskApi.list(token);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [token]);

  const handleStatusChange = async (taskId, status) => {
    await taskApi.updateStatus(taskId, status, token);
    loadTasks();
  };

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter((task) => task.status === filter);

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Track work</span>
          <h1>Tasks</h1>
        </div>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
      </header>

      {error && <div className="alert">{error}</div>}

      <div className="task-list">
        {filteredTasks.length ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
          ))
        ) : (
          <div className="empty-state">No tasks match this view.</div>
        )}
      </div>
    </section>
  );
}
