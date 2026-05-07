import React from "react";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { projectApi } from "../services/api.js";

export default function Projects() {
  const { token, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const data = await projectApi.list(token);
      setProjects(data.projects);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await projectApi.create(form, token);
      setForm({ name: "", description: "" });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>Projects</h1>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {isAdmin && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <button type="submit">
            <Plus size={16} />
            Add project
          </button>
        </form>
      )}

      <div className="project-grid">
        {projects.length ? (
          projects.map((project) => <ProjectCard key={project.id} project={project} />)
        ) : (
          <div className="empty-state">No projects available yet.</div>
        )}
      </div>
    </section>
  );
}
