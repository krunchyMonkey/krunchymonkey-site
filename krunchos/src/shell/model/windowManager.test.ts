import { describe, expect, it } from "vitest";
import { initialWindowState, windowReducer } from "./windowManager";

describe("KrunchOS window state", () => {
  it("opens an application once and focuses the existing instance", () => {
    const opened = windowReducer(initialWindowState, { type: "open", id: "open-bench" });
    const refocused = windowReducer(opened, { type: "open", id: "open-bench" });

    expect(opened.windows).toHaveLength(2);
    expect(refocused.windows).toHaveLength(2);
    expect(refocused.windows.find((item) => item.id === "open-bench")?.zIndex).toBeGreaterThan(
      opened.windows[0].zIndex,
    );
  });

  it("preserves location when minimizing and reopening a window", () => {
    const moved = windowReducer(initialWindowState, {
      type: "move",
      id: "workbench",
      x: 45,
      y: 90,
    });
    const minimized = windowReducer(moved, { type: "minimize", id: "workbench" });
    const restored = windowReducer(minimized, { type: "open", id: "workbench" });

    expect(minimized.windows[0].minimized).toBe(true);
    expect(restored.windows[0]).toMatchObject({ x: 45, y: 90, minimized: false });
  });

  it("closes only the selected window", () => {
    const opened = windowReducer(initialWindowState, { type: "open", id: "open-bench" });
    const closed = windowReducer(opened, { type: "close", id: "workbench" });

    expect(closed.windows.map((item) => item.id)).toEqual(["open-bench"]);
  });

  it("ignores moves targeting a closed window", () => {
    const unchanged = windowReducer(initialWindowState, {
      type: "move",
      id: "browser",
      x: 100,
      y: 200,
    });
    expect(unchanged).toBe(initialWindowState);
  });
});
