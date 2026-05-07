import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";
import StatusBadge from "./StatusBadge.jsx";

export default function TaskCard({ task, onStatusChange, canEditStatus = true }) {
  return (
    <article className="task-card">
      <div className="task-card-top">
        <div>
          <Link to={`/tasks/${task.id}`} className="task-title">
            {task.title}
          </Link>
          <p>{task.description || "No description added."}</p>
        </div>
        <StatusBadge value={task.status} task={task} />
      </div>

      <div className="meta-grid">
        <span>Project: {task.project?.name || "Unknown"}</span>
        <span>Assignee: {task.assignedTo?.name || "Unassigned"}</span>
        <span>Due: {formatDate(task.dueDate)}</span>
        <StatusBadge type="priority" value={task.priority} />
      </div>

      {canEditStatus && (
        <select value={task.status} onChange={(event) => onStatusChange?.(task.id, event.target.value)}>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
      )}
    </article>
  );
}
