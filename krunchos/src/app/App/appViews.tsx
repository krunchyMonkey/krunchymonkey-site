import type { ComponentType, ReactNode } from "react";
import type { AppId } from "../../apps";
import { OpenBench } from "../../features/open-bench";
import { PixelOpenBench, PixelWorkbench } from "../../features/pixel-study";
import { ProjectExplorer } from "../../features/workbench";
import type { Appearance } from "../../shell/model";

export const appViews: Record<Appearance, Record<AppId, ComponentType | null>> = {
  pixel: {
    workbench: PixelWorkbench,
    projects: null,
    journal: null,
    schematics: null,
    browser: null,
    terminal: null,
    "open-bench": PixelOpenBench,
    settings: null,
  },
  classic: {
    workbench: ProjectExplorer,
    projects: null,
    journal: null,
    schematics: null,
    browser: null,
    terminal: null,
    "open-bench": OpenBench,
    settings: null,
  },
};

export function renderApp(id: AppId, appearance: Appearance): ReactNode {
  const View = appViews[appearance][id];
  return View ? <View /> : <p>This application is still being crafted.</p>;
}
