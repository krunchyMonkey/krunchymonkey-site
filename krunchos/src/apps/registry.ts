import type { PixelIconName } from "../components/PixelIcon";

export type AppId =
  | "workbench"
  | "projects"
  | "journal"
  | "schematics"
  | "browser"
  | "terminal"
  | "open-bench"
  | "settings";

export type AppCapability = "desktop-shortcut" | "menu-bar" | "mobile-dock";

export interface AppDefinition {
  readonly id: AppId;
  readonly route: string;
  readonly capabilities: readonly AppCapability[];
  readonly launchLabel?: string;
  readonly title: string;
  readonly icon: PixelIconName;
  readonly description: string;
  readonly release: string;
  readonly available: boolean;
}

export interface RegisteredApp extends AppDefinition {
  readonly launchLabel: string;
}

const definitions: readonly AppDefinition[] = [
  {
    id: "workbench",
    route: "/workbench",
    capabilities: ["desktop-shortcut", "menu-bar", "mobile-dock"],
    title: "Workbench",
    icon: "workbench",
    description: "Browse projects and discover how things are built.",
    release: "v0.1",
    available: true,
  },
  {
    id: "projects",
    route: "/projects",
    capabilities: ["desktop-shortcut"],
    title: "Projects",
    icon: "projects",
    description: "A directory of public experiments.",
    release: "v0.4",
    available: false,
  },
  {
    id: "journal",
    route: "/journal",
    capabilities: ["desktop-shortcut"],
    title: "Journal",
    icon: "journal",
    description: "Notes from the workbench.",
    release: "v0.4",
    available: false,
  },
  {
    id: "schematics",
    route: "/schematics",
    capabilities: [],
    title: "Schematics",
    icon: "schematics",
    description: "See how things are made.",
    release: "v0.4",
    available: false,
  },
  {
    id: "browser",
    route: "/browser",
    capabilities: [],
    title: "Browser",
    icon: "browser",
    description: "A curated browser for our real public demo applications.",
    release: "v0.5",
    available: false,
  },
  {
    id: "terminal",
    route: "/terminal",
    capabilities: [],
    title: "Terminal",
    icon: "terminal",
    description: "A small command-line playground.",
    release: "v1.0",
    available: false,
  },
  {
    id: "open-bench",
    route: "/open-bench",
    capabilities: ["desktop-shortcut", "menu-bar", "mobile-dock"],
    launchLabel: "Open Bench",
    title: "Open Bench",
    icon: "open-bench",
    description: "A welcoming space for thoughtful engineering.",
    release: "v0.4 / v1.1",
    available: true,
  },
  {
    id: "settings",
    route: "/settings",
    capabilities: [],
    title: "Settings",
    icon: "settings",
    description: "Personalize your workstation.",
    release: "v1.0",
    available: false,
  },
];

export type AppRoute =
  | { readonly kind: "home" }
  | { readonly kind: "app"; readonly app: RegisteredApp }
  | { readonly kind: "unavailable"; readonly app: RegisteredApp }
  | { readonly kind: "unknown"; readonly path: string };

const routePattern = /^\/[a-z0-9-]+$/;

export function createRegistry(definitions: readonly AppDefinition[]) {
  const apps: readonly RegisteredApp[] = definitions.map((definition) => ({
    ...definition,
    launchLabel: definition.launchLabel ?? "Open " + definition.title,
  }));
  const byId = new Map<string, RegisteredApp>();
  const byRoute = new Map<string, RegisteredApp>();
  for (const app of apps) {
    if (!routePattern.test(app.route)) {
      throw new Error("Invalid route " + JSON.stringify(app.route) + " for app " + app.id);
    }
    if (byId.has(app.id)) throw new Error("Duplicate app id " + app.id);
    if (byRoute.has(app.route)) throw new Error("Duplicate route " + app.route);
    byId.set(app.id, app);
    byRoute.set(app.route, app);
  }

  function getApp(id: string): RegisteredApp | undefined {
    return byId.get(id);
  }

  function isAppId(value: string): value is AppId {
    return byId.has(value);
  }

  function withCapability(capability: AppCapability): readonly RegisteredApp[] {
    return apps.filter((app) => app.capabilities.includes(capability));
  }

  function hrefFor(id: AppId): string {
    const app = byId.get(id);
    if (!app) throw new Error("Unknown app id " + id);
    return "#" + app.route;
  }

  function resolve(hash: string): AppRoute {
    const withoutHash = hash.startsWith("#") ? hash.slice(1) : hash;
    const path = withoutHash.split("?")[0] ?? "";
    const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
    if (normalized === "" || normalized === "/") return { kind: "home" };
    const app = byRoute.get(normalized);
    if (!app) return { kind: "unknown", path: normalized };
    return app.available ? { kind: "app", app } : { kind: "unavailable", app };
  }

  return { apps, getApp, isAppId, withCapability, hrefFor, resolve };
}

const registry = createRegistry(definitions);

export const { apps, getApp, isAppId, withCapability, hrefFor, resolve } = registry;
