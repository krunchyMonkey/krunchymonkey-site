import { useState } from "react";
import { BitButton } from "../../vendor/8bitcn/Button";
import {
  BitCard,
  BitCardContent,
  BitCardDescription,
  BitCardHeader,
  BitCardTitle,
} from "../../vendor/8bitcn/Card";
import monkeyLogo from "../../../../assets/krunchymonkey-logo.webp";
import "./PixelStudy.css";

type Section = "workbench" | "research" | "open-bench";

interface StudioProject {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly kind: "PROJECT" | "EXPERIMENT";
  readonly description: string;
  readonly status: string;
}

const projects: readonly StudioProject[] = [
  {
    id: "tracing-guatemala",
    title: "Tracing Guatemala",
    icon: "▣",
    kind: "PROJECT",
    description: "A people-centered research workspace for Guatemala family history.",
    status: "Public product overview",
  },
  {
    id: "krunchos",
    title: "KrunchOS",
    icon: "▤",
    kind: "PROJECT",
    description: "A playful personal workshop built on thoughtful engineering.",
    status: "v0.1 foundation",
  },
  {
    id: "field-notes",
    title: "Field Notes",
    icon: "▥",
    kind: "EXPERIMENT",
    description: "An exploration of flexible notebooks and research workflows.",
    status: "Concept",
  },
  {
    id: "mapping-threads",
    title: "Mapping Threads",
    icon: "⌘",
    kind: "EXPERIMENT",
    description: "An idea for seeing connections between places and discoveries.",
    status: "Concept",
  },
];

function PixelLandscape() {
  return (
    <div className="pixel-landscape" aria-hidden="true">
      <div className="pixel-sun" />
      <div className="pixel-cloud cloud-one" />
      <div className="pixel-cloud cloud-two" />
      <div className="pixel-volcano" />
      <div className="pixel-volcano-snow" />
      <div className="pixel-arch">
        <span className="pixel-arch-door" />
      </div>
      <div className="pixel-landscape-ground" />
    </div>
  );
}

function Workbench() {
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const selected = projects.find((item) => item.id === selectedId) ?? projects[0];

  return (
    <section className="pixel-study-section" aria-label="Workbench design study">
      <div className="pixel-section-heading">
        <div>
          <span className="pixel-eyebrow">▣ /WORKBENCH/PROJECTS</span>
          <h2>Good things take work.</h2>
          <p>Real projects and small experiments from a curious corner of the internet.</p>
        </div>
        <span className="pixel-file-count">{projects.length.toString().padStart(2, "0")} FILES</span>
      </div>
      <div className="pixel-project-grid">
        {projects.map((project) => (
          <BitCard
            font="normal"
            className={project.id === selectedId ? "pixel-project-card is-active" : "pixel-project-card"}
            key={project.id}
          >
            <BitCardHeader>
              <div className="pixel-card-top">
                <span className="pixel-card-glyph" aria-hidden="true">{project.icon}</span>
                <span className="pixel-card-type">{project.kind}</span>
              </div>
              <BitCardTitle>{project.title}</BitCardTitle>
              <BitCardDescription>{project.description}</BitCardDescription>
            </BitCardHeader>
            <BitCardContent>
              <BitButton
                type="button"
                font="normal"
                variant={project.id === selectedId ? "secondary" : "outline"}
                className="pixel-action pixel-select"
                onClick={() => setSelectedId(project.id)}
                aria-pressed={project.id === selectedId}
              >
                {project.id === selectedId ? "✓ Selected" : "▸ Inspect project"}
              </BitButton>
            </BitCardContent>
          </BitCard>
        ))}
      </div>
      <div className="pixel-inspector" aria-live="polite">
        <div className="pixel-inspector-tab">✦ FILE INSPECTOR</div>
        <div className="pixel-inspector-content">
          <strong>{selected.title}</strong>
          <p>{selected.description}</p>
          <span>STATUS: {selected.status}</span>
        </div>
      </div>
    </section>
  );
}

function Research() {
  return (
    <section className="pixel-study-section" aria-label="Research project design study">
      <span className="pixel-eyebrow">▣ /PROJECTS/TRACING-GUATEMALA</span>
      <h2>Research, with heart.</h2>
      <p className="pixel-section-lead">
        Tracing Guatemala is a real software project designed for the people doing the research.
        This preview shows only public project information and no client records.
      </p>
      <div className="pixel-research-features">
        <BitCard className="pixel-feature-card" font="normal">
          <BitCardHeader>
            <BitCardTitle>▤ Research notebook</BitCardTitle>
            <BitCardDescription>Capture sources, reasoning and research progress.</BitCardDescription>
          </BitCardHeader>
        </BitCard>
        <BitCard className="pixel-feature-card" font="normal">
          <BitCardHeader>
            <BitCardTitle>⌘ Family connections</BitCardTitle>
            <BitCardDescription>Keep people, places and evidence understandable.</BitCardDescription>
          </BitCardHeader>
        </BitCard>
        <BitCard className="pixel-feature-card" font="normal">
          <BitCardHeader>
            <BitCardTitle>▣ A public demo</BitCardTitle>
            <BitCardDescription>A separately hosted, fictional-data demo is planned for v0.5.</BitCardDescription>
          </BitCardHeader>
        </BitCard>
      </div>
      <p className="pixel-research-footnote">↳ No private app embedding. No fictitious production statistics.</p>
    </section>
  );
}

function OpenBench() {
  return (
    <section className="pixel-study-section" aria-label="Open Bench design study">
      <span className="pixel-eyebrow">✦ /OPEN-BENCH</span>
      <h2>Pull up a chair.</h2>
      <p className="pixel-section-lead">
        A future place to share engineering craft, experiments, and ideas. AI-assisted work is
        welcome when it is owned, understood, and tested.
      </p>
      <BitCard className="pixel-open-card" font="normal">
        <BitCardHeader>
          <BitCardTitle>Built in the open.</BitCardTitle>
          <BitCardDescription>
            Open Bench contributions are planned for a later release. The GitHub repository already
            documents the decisions and progress behind KrunchOS.
          </BitCardDescription>
        </BitCardHeader>
        <BitCardContent>
          <BitButton asChild font="normal" className="pixel-action">
            <a href="https://github.com/krunchyMonkey/krunchymonkey-site" target="_blank" rel="noopener noreferrer">
              View the repository ↗
            </a>
          </BitButton>
        </BitCardContent>
      </BitCard>
    </section>
  );
}

const navigation: readonly { id: Section; name: string; icon: string }[] = [
  { id: "workbench", name: "Workbench", icon: "▤" },
  { id: "research", name: "Research", icon: "⌕" },
  { id: "open-bench", name: "Open Bench", icon: "✦" },
];

export function PixelStudy() {
  const [section, setSection] = useState<Section>("workbench");

  return (
    <div className="pixel-study">
      <header className="pixel-topbar">
        <a href="?preview=8bitcn" className="pixel-brand" aria-label="KrunchOS pixel preview home">
          <img src={monkeyLogo} alt="" />
          <span>KrunchOS<span className="pixel-brand-cursor">_</span></span>
        </a>
        <nav aria-label="Pixel study navigation" className="pixel-topnav">
          {navigation.map((item) => (
            <button key={item.id} type="button" onClick={() => setSection(item.id)} aria-current={section === item.id ? "page" : undefined}>
              {item.name}
            </button>
          ))}
        </nav>
        <span className="pixel-topbar-status">◆ v0.1 · LOCAL DESIGN SPIKE</span>
      </header>
      <div className="pixel-layout">
        <aside className="pixel-sidebar" aria-label="Study shortcuts">
          <div className="pixel-sidebar-label">APPS</div>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? "pixel-sidebar-item is-active" : "pixel-sidebar-item"}
              onClick={() => setSection(item.id)}
              aria-pressed={section === item.id}
            >
              <span aria-hidden="true">{item.icon}</span>
              <small>{item.name}</small>
            </button>
          ))}
          <div className="pixel-sidebar-footer">PIXEL LAB<br />BUILD 001</div>
        </aside>
        <main className="pixel-page">
          <div className="pixel-hero">
            <div className="pixel-hero-copy">
              <span className="pixel-eyebrow">★ A LITTLE PLAYFUL. A LOT OF PURPOSE.</span>
              <h1>Welcome to<br /><em>the workshop.</em></h1>
              <p>Old-school care. Modern tools. Real projects wearing their pixel best.</p>
              <div className="pixel-hero-actions">
                <BitButton type="button" font="normal" className="pixel-action pixel-primary-action" onClick={() => setSection("workbench")}>
                  ▸ Explore the work
                </BitButton>
                <BitButton type="button" variant="outline" font="normal" className="pixel-action pixel-secondary-action" onClick={() => setSection("open-bench")}>
                  Open Bench
                </BitButton>
              </div>
            </div>
            <PixelLandscape />
          </div>
          <div className="pixel-content-window">
            <div className="pixel-window-titlebar">
              <span>▣ {section === "workbench" ? "WORKBENCH.EXE" : section === "research" ? "RESEARCH.EXE" : "OPENBENCH.EXE"}</span>
              <span aria-hidden="true">▢ ×</span>
            </div>
            {section === "workbench" && <Workbench />}
            {section === "research" && <Research />}
            {section === "open-bench" && <OpenBench />}
          </div>
          <footer className="pixel-footer">
            <span>THIS IS A LOCAL VISUAL EXPERIMENT · NOT DEPLOYED</span>
            <a href="./">↶ Original v0.1 preview</a>
          </footer>
        </main>
      </div>
      <nav className="pixel-bottom-nav" aria-label="Mobile pixel navigation">
        {navigation.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={section === item.id}
            className={section === item.id ? "is-active" : ""}
            onClick={() => setSection(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.name}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
