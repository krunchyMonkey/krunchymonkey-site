import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "./App";

afterEach(cleanup);

describe("KrunchOS", () => {
  it("starts with a Workbench window and can launch Open Bench", () => {
    render(<App />);
    expect(screen.getByRole("region", { name: "Workbench window" })).toBeTruthy();
    const menus = screen.getByRole("navigation", { name: "Workstation menus" });
    fireEvent.click(within(menus).getByRole("button", { name: "Open Bench" }));
    expect(screen.getByRole("region", { name: "Open Bench window" })).toBeTruthy();
  });
});
