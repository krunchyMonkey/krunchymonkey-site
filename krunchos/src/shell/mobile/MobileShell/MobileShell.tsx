import { useState } from "react";
import { apps, getApp, type AppId } from "../../../apps/registry";
import type { Appearance } from "../../../app/App/App";
import { ProjectExplorer } from "../../../features/workbench/components/ProjectExplorer";
import { OpenBench } from "../../../features/open-bench/components/OpenBench";
import { PixelWorkbench } from "../../../features/pixel-study/PixelWorkbench";
import { PixelOpenBench } from "../../../features/pixel-study/PixelOpenBench";
import monkeyLogo from "../../../../../assets/krunchymonkey-logo.webp";

interface MobileShellProps {
  readonly appearance?: Appearance;
  readonly activeApp: AppId | null;
  readonly onLaunch: (id: AppId) => void;
  readonly onHome: () => void;
}

export function MobileShell({
  appearance = "classic",
  activeApp,
  onLaunch,
  onHome,
}: MobileShellProps) {
  const [notice, setNotice] = useState("");

  function open(id: AppId) {
    const app = getApp(id);
    if (app?.available) {
      setNotice("");
      onLaunch(id);
    } else {
      setNotice(
        (app?.title ?? "This app") + " arrives in " + (app?.release ?? "a future release") + ".",
      );
    }
  }

  return (
    <div className="mobile-shell">
      <div className="mobile-statusbar">
        <span>KrunchOS</span>
        <span>{appearance === "pixel" ? "PIXEL EDITION · v0.1" : "LOCAL PREVIEW · 0.1"}</span>
      </div>
      {activeApp ? (
        <>
          <header className="mobile-titlebar">
            <button type="button" onClick={onHome} aria-label="Back to home">
              ‹
            </button>
            <strong>
              {getApp(activeApp)?.icon} {getApp(activeApp)?.title}
            </strong>
            <span aria-hidden="true">▣</span>
          </header>
          <main className="mobile-app-content">
            {activeApp === "workbench" ? (
              appearance === "pixel" ? (
                <PixelWorkbench />
              ) : (
                <ProjectExplorer />
              )
            ) : appearance === "pixel" ? (
              <PixelOpenBench />
            ) : (
              <OpenBench />
            )}
          </main>
        </>
      ) : (
        <main className="mobile-home">
          <img className="mobile-brand-mark" src={monkeyLogo} alt="" />
          <h1>KrunchOS</h1>
          <p>A personal workshop for research, creation, and good old-fashioned tinkering.</p>
          <div className="mobile-rule" />
          <nav className="mobile-icons" aria-label="Mobile applications">
            {apps.map((app) => (
              <button type="button" key={app.id} onClick={() => open(app.id)}>
                <span className="mobile-app-icon" aria-hidden="true">
                  {app.icon}
                </span>
                <span>{app.title}</span>
              </button>
            ))}
          </nav>
          <div className="mobile-landscape" aria-hidden="true">
            <div className="mobile-horizon" />
          </div>
        </main>
      )}
      <div className="mobile-notice" role="status">
        {notice}
      </div>
      <nav className="mobile-dock" aria-label="Mobile dock">
        <button type="button" onClick={onHome} aria-label="Home">
          ⌂
        </button>
        <button type="button" onClick={() => open("workbench")} aria-label="Open Workbench">
          ▤
        </button>
        <button type="button" onClick={() => open("open-bench")} aria-label="Open Bench">
          ✦
        </button>
      </nav>
      <div className="mobile-home-indicator" aria-hidden="true" />
    </div>
  );
}
