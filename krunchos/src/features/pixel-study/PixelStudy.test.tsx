import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PixelStudy } from "./PixelStudy";

afterEach(cleanup);

describe("pixel-first workbench study", () => {
  it("shows interactive project selection rather than static screenshot tiles", () => {
    render(<PixelStudy />);
    const study = screen.getByRole("region", { name: "Workbench design study" });
    expect(within(study).getAllByText("Tracing Guatemala").length).toBeGreaterThan(0);
    const inspect = within(study).getAllByRole("button", { name: /Inspect project/ });
    fireEvent.click(inspect[0]);
    expect(within(study).getAllByText("KrunchOS").length).toBeGreaterThan(0);
    expect(within(study).getByText(/STATUS: v0\.1 foundation/)).toBeTruthy();
  });

  it("uses navigation to switch between research and Open Bench", () => {
    render(<PixelStudy />);
    const nav = screen.getByRole("navigation", { name: "Pixel study navigation" });
    fireEvent.click(within(nav).getByRole("button", { name: "Research" }));
    expect(screen.getByRole("region", { name: "Research project design study" })).toBeTruthy();
    fireEvent.click(within(nav).getByRole("button", { name: "Open Bench" }));
    expect(screen.getByRole("region", { name: "Open Bench design study" })).toBeTruthy();
  });

  it("provides a direct way back to the baseline v0.1 preview", () => {
    render(<PixelStudy />);
    expect(screen.getByRole("link", { name: /Original v0.1 preview/ }).getAttribute("href")).toBe("./");
  });
});
