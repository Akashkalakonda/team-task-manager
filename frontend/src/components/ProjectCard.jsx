import React from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const completedTasks = project.tasks?.filter((task) => task.status === "DONE").length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <article className="project-card">
      <div>
        <Link to={`/projects/${project.id}`} className="project-title">
          {project.name}
        </Link>
        <p>{project.description || "No description added."}</p>
      </div>

      <div className="progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="project-stats">
        <span>{totalTasks} tasks</span>
        <span>{project.members?.length || 0} members</span>
        <span>{progress}% done</span>
      </div>
    </article>
  );
}
