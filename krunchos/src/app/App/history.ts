import { hrefFor, resolve, type AppId, type AppRoute } from "../../apps";

const APP_ENTRY = { krunchos: "app" } as const;

export function isAppEntry(): boolean {
  return (history.state as { krunchos?: string } | null)?.krunchos === APP_ENTRY.krunchos;
}

export function currentRoute(): AppRoute {
  return resolve(location.hash);
}

export function dropHash(): void {
  history.replaceState(history.state, "", location.pathname + location.search);
}

export function writeAppEntry(id: AppId, fromHome: boolean): void {
  if (fromHome) history.pushState(APP_ENTRY, "", hrefFor(id));
  else history.replaceState(history.state, "", hrefFor(id));
}

export function leaveApp(): "back" | "replaced" {
  if (isAppEntry()) {
    history.back();
    return "back";
  }
  dropHash();
  return "replaced";
}

export function routeNotice(route: AppRoute): string {
  if (route.kind === "unavailable") {
    return route.app.title + " arrives in " + route.app.release + ".";
  }
  if (route.kind === "unknown") return "That app could not be found.";
  return "";
}
