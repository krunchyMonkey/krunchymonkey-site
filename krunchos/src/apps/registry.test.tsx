import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelIcon, pixelIconNames } from "../components/PixelIcon";
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
});
