import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { DesktopShell } from "./DesktopShell";

afterEach(cleanup);

function renderShell(minimized: boolean | null) {
  const windows =
    minimized === null
      ? []
      : [{ id: "workbench" as const, x: 0, y: 0, width: 500, height: 400, zIndex: 1, minimized }];
  render(
    <DesktopShell
      appearance="classic"
      windows={windows}
      dispatch={vi.fn()}
      onLaunch={vi.fn()}
      renderApp={() => null}
    />,
  );
  return screen.getByRole("navigation", { name: "Application dock" });
}

describe("DesktopShell dock state", () => {
  it("describes a running app", () => {
    const dock = renderShell(false);
    expect(
      within(dock).getByRole("button", { name: "Workbench", description: "Running" }),
    ).toBeTruthy();
  });

  it("describes a minimized app", () => {
    const dock = renderShell(true);
    expect(
      within(dock).getByRole("button", { name: "Workbench", description: "Minimized" }),
    ).toBeTruthy();
  });

  it("has no description when nothing is open", () => {
    const dock = renderShell(null);
    expect(dock.querySelector("[aria-describedby]")).toBeNull();
    expect(dock.querySelector("[id^='dock-state-']")).toBeNull();
  });
});
