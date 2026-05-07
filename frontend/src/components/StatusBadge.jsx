import { isOverdue, priorityLabel, statusLabel } from "../utils/format.js";

export default function StatusBadge({ type = "status", value, task }) {
  const className =
    type === "priority"
      ? `badge priority-${value?.toLowerCase()}`
      : isOverdue(task)
        ? "badge overdue"
        : `badge status-${value?.toLowerCase()}`;

  const label = type === "priority" ? priorityLabel[value] : isOverdue(task) ? "Overdue" : statusLabel[value];

  return <span className={className}>{label || value}</span>;
}
