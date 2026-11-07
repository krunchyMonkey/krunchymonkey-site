import { useReducer, useState } from "react";
import { getApp, type AppId } from "../../apps/registry";
import { DesktopShell } from "../../shell/desktop/DesktopShell";
import { MobileShell } from "../../shell/mobile/MobileShell";
import {
  initialWindowState,
  windowReducer,
  type WindowState,
} from "../../shell/model/windowManager";

export type Appearance = "classic" | "pixel";

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
  const [windowState, dispatch] = useReducer(
    windowReducer,
    appearance === "pixel" ? pixelWindowState : initialWindowState,
  );
  const [mobileAppId, setMobileAppId] = useState<AppId | null>(null);

  function openApp(id: AppId) {
    if (!getApp(id)?.available) return;
    dispatch({ type: "open", id });
    setMobileAppId(id);
  }

  return (
    <div className={appearance === "pixel" ? "pixel-os" : "classic-os"}>
      <DesktopShell
        appearance={appearance}
        windows={windowState.windows}
        dispatch={dispatch}
        onLaunch={openApp}
      />
      <MobileShell
        appearance={appearance}
        activeApp={mobileAppId}
        onLaunch={openApp}
        onHome={() => setMobileAppId(null)}
      />
    </div>
  );
}
