import { useState, type Dispatch } from "react";
import { apps, getApp, type AppId } from "../../../apps";
import { PixelIcon } from "../../../components/PixelIcon";
import type { Appearance, DesktopWindow, WindowAction } from "../../model";
import { Window } from "../Window";
import { ProjectExplorer } from "../../../features/workbench";
import { OpenBench } from "../../../features/open-bench";
import { PixelOpenBench, PixelWorkbench } from "../../../features/pixel-study";
import monkeyLogo from "../../../../../assets/krunchymonkey-logo.webp";

interface DesktopShellProps {
  readonly appearance: Appearance;
  readonly windows: readonly DesktopWindow[];
  readonly dispatch: Dispatch<WindowAction>;
  readonly onLaunch: (id: AppId) => void;
}

function Content({ id, appearance }: { readonly id: AppId; readonly appearance: Appearance }) {
  if (id === "workbench") return appearance === "pixel" ? <PixelWorkbench /> : <ProjectExplorer />;
  if (id === "open-bench") return appearance === "pixel" ? <PixelOpenBench /> : <OpenBench />;
  return <p>This application is still being crafted.</p>;
}

export function DesktopShell({ appearance, windows, dispatch, onLaunch }: DesktopShellProps) {
  const [notice, setNotice] = useState("");

  function launch(id: AppId) {
    const app = getApp(id);
    if (!app?.available) {
      setNotice(
        (app?.title ?? "Application") +
          " is planned for " +
          (app?.release ?? "a future release") +
          ".",
      );
      return;
    }
    setNotice("");
    onLaunch(id);
  }

  return (
    <div className="desktop-shell">
      <header className="system-bar">
        <div className="system-brand">
          <img src={monkeyLogo} alt="" />
          <strong>KrunchOS</strong>
        </div>
        <nav className="system-menus" aria-label="Workstation menus">
          <button type="button" onClick={() => launch("workbench")}>
            Workbench
          </button>
          <button type="button" onClick={() => launch("open-bench")}>
            Open Bench
          </button>
        </nav>
        <span className="system-status">
          {appearance === "pixel" ? "PIXEL EDITION · LOCAL v0.1" : "LOCAL PREVIEW · v0.1"}
        </span>
      </header>
      <main className="desktop-workspace" aria-label="KrunchOS desktop">
        <div className="desktop-art" aria-hidden="true">
          <div className="pixel-scenery">
            <div className="scenery-sun" />
            <div className="scenery-mountain" />
            <div className="scenery-mountain-cap" />
            <div className="scenery-arch">
              <span />
            </div>
          </div>
          <div className="mountain-horizon" />
          <div className="workshop-label">ORDER BENEATH THE CHAOS</div>
        </div>
        <nav className="desktop-shortcuts" aria-label="Desktop shortcuts">
          {apps
            .filter((app) => ["workbench", "projects", "journal", "open-bench"].includes(app.id))
            .map((app) => (
              <button
                key={app.id}
                className="desktop-shortcut"
                type="button"
                onClick={() => launch(app.id)}
              >
                <span className="shortcut-icon" aria-hidden="true">
                  <PixelIcon name={app.icon} />
                </span>
                <span>{app.title}</span>
              </button>
            ))}
        </nav>
        {windows.map((frame) => (
          <Window
            key={frame.id}
            window={frame}
            onFocus={() => dispatch({ type: "focus", id: frame.id })}
            onMove={(x, y) => dispatch({ type: "move", id: frame.id, x, y })}
            onClose={() => dispatch({ type: "close", id: frame.id })}
            onMinimize={() => dispatch({ type: "minimize", id: frame.id })}
          >
            <Content id={frame.id} appearance={appearance} />
          </Window>
        ))}
        <div className="desktop-toast" role="status">
          {notice}
        </div>
      </main>
      <nav className="desktop-dock" aria-label="Application dock">
        {apps.map((app) => {
          const opened = windows.find((frame) => frame.id === app.id);
          const stateId = "dock-state-" + app.id;
          return (
            <button
              key={app.id}
              type="button"
              aria-describedby={opened ? stateId : undefined}
              className={opened && !opened.minimized ? "dock-app is-running" : "dock-app"}
              onClick={() => launch(app.id)}
              aria-label={app.title + (app.available ? "" : ", planned for " + app.release)}
            >
              <span className="dock-icon" aria-hidden="true">
                <PixelIcon name={app.icon} />
              </span>
              <small>{app.title}</small>
              {opened ? (
                <span id={stateId} hidden>
                  {opened.minimized ? "Minimized" : "Running"}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <footer className="desktop-footer">
        {appearance === "pixel"
          ? "KRUNCHOS / WORKSHOP · 8BITCN STUDY · NOT DEPLOYED"
          : "KRUNCHOS LAB · NOT DEPLOYED · EXPERIMENTAL PREVIEW"}
      </footer>
    </div>
  );
}
