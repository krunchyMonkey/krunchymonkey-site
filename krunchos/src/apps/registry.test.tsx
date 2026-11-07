import { describe, expect, it } from "vitest";
import { apps, getApp, isAppId } from "./registry";

describe("application registry", () => {
  it("exposes unique stable IDs", () => {
    expect(new Set(apps.map((app) => app.id)).size).toBe(apps.length);
  });

  it("provides the same definition to desktop and mobile", () => {
    expect(getApp("workbench")?.title).toBe("Workbench");
    expect(isAppId("open-bench")).toBe(true);
    expect(isAppId("untrusted-url")).toBe(false);
  });

  it("keeps unfinished applications explicitly unavailable", () => {
    expect(getApp("browser")?.available).toBe(false);
    expect(getApp("workbench")?.available).toBe(true);
  });
});
