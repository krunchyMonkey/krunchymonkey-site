import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PixelStudy } from "./PixelStudy";

afterEach(cleanup);

describe("pixel OS design study", () => {
  it("boots into real OS windows and lets users inspect actual public projects", () => {
    render(<PixelStudy />);
    const desktop = screen.getByRole("main", { name: "KrunchOS desktop" });
    expect(within(desktop).getByRole("region", { name: "Workbench window" })).toBeTruthy();
    expect(within(desktop).getByRole("region", { name: "Open Bench window" })).toBeTruthy();
    const explorer = within(desktop).getByRole("region", { name: "Project files" });
    const inspect = within(explorer).getAllByRole("button", { name: /Inspect/ });
    fireEvent.click(inspect[0]);
    expect(within(desktop).getByRole("region", { name: "Selected project details" })).toBeTruthy();
  });

  it("minimizes and restores the Workbench through the dock", () => {
    render(<PixelStudy />);
    const desktop = screen.getByRole("main", { name: "KrunchOS desktop" });
    const workbench = within(desktop).getByRole("region", { name: "Workbench window" });
    fireEvent.click(within(workbench).getByRole("button", { name: "Minimize Workbench" }));
    expect(within(desktop).queryByRole("region", { name: "Workbench window" })).toBeNull();
    const dock = screen.getByRole("navigation", { name: "Application dock" });
    fireEvent.click(within(dock).getByRole("button", { name: "Workbench" }));
    expect(within(desktop).getByRole("region", { name: "Workbench window" })).toBeTruthy();
  });

  it("offers an OS app launcher for mobile", () => {
    render(<PixelStudy />);
    const nav = screen.getByRole("navigation", { name: "Mobile applications" });
    expect(within(nav).getByRole("button", { name: /Workbench/ })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: /Open Bench/ })).toBeTruthy();
  });
});
