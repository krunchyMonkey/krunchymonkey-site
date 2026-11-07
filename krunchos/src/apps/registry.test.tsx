import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelIcon, pixelIconNames } from "../components/PixelIcon";
import {
  apps,
  createRegistry,
  getApp,
  hrefFor,
  isAppId,
  resolve,
  withCapability,
} from "./registry";
import type { AppDefinition } from "./registry";

describe("application registry", () => {
  it("exposes unique stable IDs", () => {
    expect(new Set(apps.map((app) => app.id)).size).toBe(apps.length);
  });

  it("provides the same definition to desktop and mobile", () => {
    expect(getApp("workbench")?.title).toBe("Workbench");
    expect(isAppId("open-bench")).toBe(true);
    expect(isAppId("untrusted-url")).toBe(false);
  });

  it("gives every application a valid pixel icon that renders decoratively", () => {
    for (const app of apps) {
      expect(pixelIconNames, app.id).toContain(app.icon);
      const { container } = render(<PixelIcon name={app.icon} />);
      expect(container.querySelector('svg[aria-hidden="true"]'), app.id).not.toBeNull();
    }
  });

  it("keeps unfinished applications explicitly unavailable", () => {
    expect(getApp("browser")?.available).toBe(false);
    expect(getApp("workbench")?.available).toBe(true);
  });

  it("assigns capabilities matching the shells", () => {
    const ids = (capability: Parameters<typeof withCapability>[0]) =>
      withCapability(capability).map((app) => app.id);
    expect(ids("desktop-shortcut")).toEqual(["workbench", "projects", "journal", "open-bench"]);
    expect(ids("menu-bar")).toEqual(["workbench", "open-bench"]);
    expect(ids("mobile-dock")).toEqual(["workbench", "open-bench"]);
    expect(withCapability("mobile-dock").map((app) => app.launchLabel)).toEqual([
      "Open Workbench",
      "Open Bench",
    ]);
  });

  it("returns undefined for a missing app", () => {
    expect(getApp("nope")).toBeUndefined();
  });
});

describe("registry validation", () => {
  const base = apps.find((app) => app.id === "workbench") as AppDefinition;
  const other = apps.find((app) => app.id === "open-bench") as AppDefinition;

  it("rejects duplicate ids", () => {
    expect(() => createRegistry([base, { ...other, id: "workbench" }])).toThrow(/Duplicate app id/);
  });

  it("rejects duplicate routes", () => {
    expect(() => createRegistry([base, { ...other, route: base.route }])).toThrow(
      /Duplicate route/,
    );
  });

  it("rejects malformed routes", () => {
    for (const route of ["workbench", "/Workbench", "/a/b", "/", "/a b", "/x?y"]) {
      expect(() => createRegistry([{ ...base, route }]), route).toThrow(/Invalid route/);
    }
  });
});

describe("route resolution", () => {
  it("round-trips every app", () => {
    for (const app of apps) {
      const result = resolve(hrefFor(app.id));
      expect(result.kind, app.id).toBe(app.available ? "app" : "unavailable");
      expect(result.kind === "home" || result.kind === "unknown" ? null : result.app.id).toBe(
        app.id,
      );
    }
    expect(hrefFor("open-bench")).toBe("#/open-bench");
  });

  it("resolves home variants", () => {
    for (const hash of ["", "#", "#/", "#?x=1"]) {
      expect(resolve(hash), hash).toEqual({ kind: "home" });
    }
  });

  it("ignores query strings and trailing slashes", () => {
    expect(resolve("#/workbench/").kind).toBe("app");
    expect(resolve("#/workbench?x=1").kind).toBe("app");
  });

  it("falls back deterministically for unknown routes", () => {
    expect(resolve("#/nope")).toEqual({ kind: "unknown", path: "/nope" });
    expect(resolve("#nope")).toEqual({ kind: "unknown", path: "nope" });
  });

  it("reports known but unavailable apps", () => {
    const registry = createRegistry(
      apps.map((app) => (app.id === "workbench" ? { ...app, available: false } : app)),
    );
    expect(registry.resolve("#/workbench").kind).toBe("unavailable");
    expect(registry.resolve("#/open-bench").kind).toBe("app");
  });
});
