export const statusLabel = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

export const priorityLabel = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

export const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
};

export const isOverdue = (task) =>
  task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();
