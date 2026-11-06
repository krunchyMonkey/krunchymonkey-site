import { useState } from "react";
import { publicProjects } from "../../model/projects";

export function ProjectExplorer() {
  const [selectedId, setSelectedId] = useState(publicProjects[0].id);
  const selected = publicProjects.find((project) => project.id === selectedId) ?? publicProjects[0];

  return (
    <div className="explorer">
      <div className="explorer-sidebar">
        <strong className="explorer-category is-selected">▸ All Projects ({publicProjects.length})</strong>
        <span className="explorer-category">▸ Featured</span>
        <span className="explorer-category">▸ Experiments</span>
        <span className="explorer-category">▸ Archive</span>
        <div className="explorer-side-note">GOOD THINGS ARE WORTH MAKING WELL.</div>
      </div>
      <div className="explorer-main">
        <h2>Projects /</h2>
        <div className="explorer-table">
          <div className="explorer-table-heading">
            <span>Name</span>
            <span>Type</span>
          </div>
          {publicProjects.map((project) => (
            <button
              className={project.id === selectedId ? "project-row is-selected" : "project-row"}
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              aria-pressed={project.id === selectedId}
            >
              <span>▣ {project.name}</span>
              <span>{project.kind}</span>
            </button>
          ))}
        </div>
        <section className="explorer-summary" aria-label="Selected project details">
          <div className="project-thumbnail" aria-hidden="true">▤</div>
          <div>
            <strong>{selected.name}</strong>
            <p>{selected.summary}</p>
            <span className="project-status">{selected.status}</span>
          </div>
        </section>
        <p className="workbench-note">
          This first workstation build explores public projects only. The interactive demo browser
          arrives in v0.5.
        </p>
      </div>
    </div>
  );
}
