export type AppId =
  | "workbench"
  | "projects"
  | "journal"
  | "schematics"
  | "browser"
  | "terminal"
  | "open-bench"
  | "settings";

export interface RegisteredApp {
  readonly id: AppId;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly release: string;
  readonly available: boolean;
}

export const apps: readonly RegisteredApp[] = [
  {
    id: "workbench",
    title: "Workbench",
    icon: "▤",
    description: "Browse projects and discover how things are built.",
    release: "v0.1",
    available: true,
  },
  {
    id: "projects",
    title: "Projects",
    icon: "▣",
    description: "A directory of public experiments.",
    release: "v0.4",
    available: false,
  },
  {
    id: "journal",
    title: "Journal",
    icon: "▥",
    description: "Notes from the workbench.",
    release: "v0.4",
    available: false,
  },
  {
    id: "schematics",
    title: "Schematics",
    icon: "⌘",
    description: "See how things are made.",
    release: "v0.4",
    available: false,
  },
  {
    id: "browser",
    title: "Browser",
    icon: "◎",
    description: "A curated browser for our real public demo applications.",
    release: "v0.5",
    available: false,
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: ">_",
    description: "A small command-line playground.",
    release: "v1.0",
    available: false,
  },
  {
    id: "open-bench",
    title: "Open Bench",
    icon: "✦",
    description: "A welcoming space for thoughtful engineering.",
    release: "v0.4 / v1.1",
    available: true,
  },
  {
    id: "settings",
    title: "Settings",
    icon: "⚙",
    description: "Personalize your workstation.",
    release: "v1.0",
    available: false,
  },
];

const appById = new Map(apps.map((app) => [app.id, app]));

export function getApp(id: string): RegisteredApp | undefined {
  return appById.get(id as AppId);
}

export function isAppId(value: string): value is AppId {
  return appById.has(value as AppId);
}
