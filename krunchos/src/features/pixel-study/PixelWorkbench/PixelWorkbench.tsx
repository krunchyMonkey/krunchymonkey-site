import { useState } from "react";
import { publicProjects } from "../../workbench";
import { PixelIcon } from "../../../components/PixelIcon";
import {
  BitButton,
  BitCard,
  BitCardContent,
  BitCardDescription,
  BitCardHeader,
  BitCardTitle,
} from "../../../vendor/8bitcn";

export function PixelWorkbench() {
  const [selectedId, setSelectedId] = useState(publicProjects[0].id);
  const selected = publicProjects.find((item) => item.id === selectedId) ?? publicProjects[0];

  return (
    <div className="pixel-workbench">
      <div className="pixel-app-toolbar">
        <strong>
          <PixelIcon name="projects" /> WORKBENCH / PROJECT FILES
        </strong>
        <span>{publicProjects.length} FILES</span>
      </div>
      <div className="pixel-directory">
        <nav className="pixel-directory-sidebar" aria-label="Project folders">
          <span className="pixel-folder-heading">DRIVE C:</span>
          <strong>▾ /projects</strong>
          <span>
            <PixelIcon name="projects" /> Featured
          </span>
          <span>
            <PixelIcon name="journal" /> Experiments
          </span>
          <span className="pixel-directory-divider">───</span>
          <small>SELECT A FILE TO INSPECT</small>
        </nav>
        <section className="pixel-directory-main" aria-label="Project files">
          <div className="pixel-directory-heading">
            <h2>PROJECTS</h2>
            <span>
              <PixelIcon name="projects" /> /WORKBENCH
            </span>
          </div>
          <div className="pixel-file-grid">
            {publicProjects.map((project) => (
              <BitCard
                key={project.id}
                font="normal"
                className={project.id === selectedId ? "pixel-file is-selected" : "pixel-file"}
              >
                <BitCardHeader>
                  <span className="pixel-file-icon" aria-hidden="true">
                    <PixelIcon
                      name={
                        project.id === "tracing-guatemala"
                          ? "journal"
                          : project.kind === "Experiment"
                            ? "experiment"
                            : "workbench"
                      }
                    />
                  </span>
                  <BitCardTitle>{project.name}</BitCardTitle>
                  <BitCardDescription>{project.kind}</BitCardDescription>
                </BitCardHeader>
                <BitCardContent>
                  <BitButton
                    type="button"
                    font="normal"
                    variant={project.id === selectedId ? "secondary" : "outline"}
                    className="pixel-file-action"
                    aria-pressed={selectedId === project.id}
                    aria-label={"Inspect " + project.name}
                    onClick={() => setSelectedId(project.id)}
                  >
                    {project.id === selectedId ? "✓ SELECTED" : "▸ INSPECT"}
                  </BitButton>
                </BitCardContent>
              </BitCard>
            ))}
          </div>
          <section
            className="pixel-inspector"
            aria-label="Selected project details"
            aria-live="polite"
          >
            <span className="pixel-inspector-title">
              <PixelIcon name="file" /> FILE DETAILS
            </span>
            <div>
              <strong>{selected.name}</strong>
              <p>{selected.summary}</p>
              <span className="pixel-file-status">STATUS: {selected.status}</span>
            </div>
          </section>
        </section>
      </div>
      <footer className="pixel-app-status">PUBLIC FILES ONLY · SELECT A PROJECT TO INSPECT</footer>
    </div>
  );
}
