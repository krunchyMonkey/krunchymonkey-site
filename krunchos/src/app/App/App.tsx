import { useReducer, useState } from "react";
import { getApp, type AppId } from "../../apps/registry";
import { DesktopShell } from "../../shell/desktop/DesktopShell";
import { MobileShell } from "../../shell/mobile/MobileShell";
import { initialWindowState, windowReducer } from "../../shell/model/windowManager";

export function App() {
  const [windowState, dispatch] = useReducer(windowReducer, initialWindowState);
  const [mobileAppId, setMobileAppId] = useState<AppId | null>(null);

  function openApp(id: AppId) {
    if (!getApp(id)?.available) return;
    dispatch({ type: "open", id });
    setMobileAppId(id);
  }

  return (
    <>
      <DesktopShell
        windows={windowState.windows}
        dispatch={dispatch}
        onLaunch={openApp}
      />
      <MobileShell activeApp={mobileAppId} onLaunch={openApp} onHome={() => setMobileAppId(null)} />
    </>
  );
}
