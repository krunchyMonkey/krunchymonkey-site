import { useEffect, useReducer, useState } from "react";
import { getApp, type AppId } from "../../apps";
import { renderApp } from "./appViews";
import { currentRoute, dropHash, leaveApp, routeNotice, writeAppEntry } from "./history";
import { DesktopShell } from "../../shell/desktop/DesktopShell";
import { MobileShell } from "../../shell/mobile/MobileShell";
import {
  initialWindowState,
  windowReducer,
  type Appearance,
  type WindowState,
} from "../../shell/model";

const pixelWindowState: WindowState = {
  windows: [
    { id: "workbench", x: 165, y: 88, width: 626, height: 472, zIndex: 2, minimized: false },
    { id: "open-bench", x: 805, y: 166, width: 421, height: 375, zIndex: 1, minimized: false },
  ],
  nextZIndex: 3,
};

interface AppProps {
  readonly appearance?: Appearance;
}

export function App({ appearance = "classic" }: AppProps) {
  const [initialRoute] = useState(currentRoute);
  const [windowState, dispatch] = useReducer(
    windowReducer,
    appearance === "pixel" ? pixelWindowState : initialWindowState,
    (state) =>
      initialRoute.kind === "app"
        ? windowReducer(state, { type: "open", id: initialRoute.app.id })
        : state,
  );
  const [mobileAppId, setMobileAppId] = useState<AppId | null>(
    initialRoute.kind === "app" ? initialRoute.app.id : null,
  );
  const [notice, setNotice] = useState(() => routeNotice(initialRoute));

  useEffect(() => {
    if (initialRoute.kind === "unavailable" || initialRoute.kind === "unknown") dropHash();
  }, [initialRoute]);

  useEffect(() => {
    function syncFromLocation() {
      const route = currentRoute();
      if (route.kind === "app") {
        setNotice("");
        setMobileAppId(route.app.id);
        return;
      }
      setMobileAppId(null);
      if (route.kind === "home") return;
      setNotice(routeNotice(route));
      dropHash();
    }
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, []);

  function launchDesktop(id: AppId) {
    if (!getApp(id)?.available) return;
    dispatch({ type: "open", id });
  }

  function launchMobile(id: AppId) {
    if (!getApp(id)?.available || id === mobileAppId) return;
    dispatch({ type: "open", id });
    setNotice("");
    writeAppEntry(id, mobileAppId === null);
    setMobileAppId(id);
  }

  function goHome() {
    if (mobileAppId === null) return;
    if (leaveApp() === "replaced") setMobileAppId(null);
  }

  return (
    <div className={appearance === "pixel" ? "pixel-os" : "classic-os"}>
      <DesktopShell
        appearance={appearance}
        windows={windowState.windows}
        dispatch={dispatch}
        onLaunch={launchDesktop}
        renderApp={(id) => renderApp(id, appearance)}
      />
      <MobileShell
        appearance={appearance}
        activeApp={mobileAppId}
        notice={notice}
        onNotice={setNotice}
        onLaunch={launchMobile}
        renderApp={(id) => renderApp(id, appearance)}
        onHome={goHome}
      />
    </div>
  );
}
