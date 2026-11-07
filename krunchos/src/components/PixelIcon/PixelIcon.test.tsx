import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelIcon } from "./PixelIcon";
import { pixelIconNames, pixelIcons } from "./icons";

describe("PixelIcon", () => {
  it("renders a decorative, palette-inheriting svg", () => {
    const { container } = render(<PixelIcon name="home" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg?.getAttribute("fill")).toBe("currentColor");
    expect(svg?.getAttribute("shape-rendering")).toBe("crispEdges");
    expect(svg?.getAttribute("width")).toBe("1em");
  });

  it("has a non-empty 16x16 bitmap for every named icon", () => {
    for (const name of pixelIconNames) {
      const rows: readonly string[] = pixelIcons[name];
      expect(rows, name).toHaveLength(16);
      for (const row of rows) expect(row, name).toMatch(/^[.#]{16}$/);
      expect(rows.join("")).toContain("#");
      const { container } = render(<PixelIcon name={name} />);
      expect(container.querySelector("path")?.getAttribute("d"), name).toMatch(/^M/);
    }
  });

  it("adds an optional class without losing the base class", () => {
    const { container } = render(<PixelIcon name="file" className="extra" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toBe("pixel-icon extra");
  });
});
