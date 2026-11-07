import { useState } from "react";
import { apps, getApp, withCapability, type AppId } from "../../../apps";
import { PixelIcon } from "../../../components/PixelIcon";
import type { AppRenderer, Appearance } from "../../model";
import monkeyLogo from "../../../../../assets/krunchymonkey-logo.webp";

interface MobileShellProps {
  readonly appearance?: Appearance;
  readonly activeApp: AppId | null;
  readonly onLaunch: (id: AppId) => void;
  readonly onHome: () => void;
  readonly renderApp: AppRenderer;
}

export function MobileShell({
  appearance = "classic",
  activeApp,
  onLaunch,
  onHome,
  renderApp,
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

  const active = activeApp ? getApp(activeApp) : undefined;

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
              {active ? <PixelIcon name={active.icon} /> : null} {active?.title}
            </strong>
            <span aria-hidden="true">
              <PixelIcon name="projects" />
            </span>
          </header>
          <main className="mobile-app-content">{renderApp(activeApp)}</main>
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
                  <PixelIcon name={app.icon} />
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
          <PixelIcon name="home" />
        </button>
        {withCapability("mobile-dock").map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => open(app.id)}
            aria-label={app.launchLabel}
          >
            <PixelIcon name={app.icon} />
          </button>
        ))}
      </nav>
      <div className="mobile-home-indicator" aria-hidden="true" />
    </div>
  );
}
