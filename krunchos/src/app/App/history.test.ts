import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  currentRoute,
  dropHash,
  isAppEntry,
  leaveApp,
  routeNotice,
  writeAppEntry,
} from "./history";

beforeEach(() => {
  history.replaceState(null, "", "/?preview=8bitcn");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("history helpers", () => {
  it("pushes an app entry from home and keeps the query", () => {
    const length = history.length;
    writeAppEntry("workbench", true);
    expect(location.hash).toBe("#/workbench");
    expect(location.search).toBe("?preview=8bitcn");
    expect(history.length).toBe(length + 1);
    expect(isAppEntry()).toBe(true);
  });

  it("replaces the entry and preserves its state when switching apps", () => {
    writeAppEntry("workbench", true);
    const length = history.length;
    writeAppEntry("open-bench", false);
    expect(location.hash).toBe("#/open-bench");
    expect(history.length).toBe(length);
    expect(isAppEntry()).toBe(true);
  });

  it("goes back when leaving a pushed app entry", () => {
    writeAppEntry("workbench", true);
    const back = vi.spyOn(history, "back").mockImplementation(() => undefined);
    expect(leaveApp()).toBe("back");
    expect(back).toHaveBeenCalledOnce();
  });

  it("drops the hash instead of going back on a cold deep link", () => {
    history.replaceState(null, "", "/?preview=8bitcn#/workbench");
    const back = vi.spyOn(history, "back");
    expect(leaveApp()).toBe("replaced");
    expect(back).not.toHaveBeenCalled();
    expect(location.hash).toBe("");
    expect(location.search).toBe("?preview=8bitcn");
  });

  it("drops a bad hash", () => {
    history.replaceState(null, "", "/?preview=8bitcn#/nope");
    expect(currentRoute().kind).toBe("unknown");
    dropHash();
    expect(location.hash).toBe("");
    expect(location.search).toBe("?preview=8bitcn");
  });

  it("words notices for unavailable and unknown routes", () => {
    expect(routeNotice({ kind: "unknown", path: "/nope" })).toBe("That app could not be found.");
    history.replaceState(null, "", "/#/terminal");
    expect(routeNotice(currentRoute())).toBe("Terminal arrives in v1.0.");
    expect(routeNotice({ kind: "home" })).toBe("");
  });
});
