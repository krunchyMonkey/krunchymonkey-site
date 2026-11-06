import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ProjectExplorer } from "./ProjectExplorer";

afterEach(cleanup);

describe("ProjectExplorer", () => {
  it("lists public projects and changes the selected summary", () => {
    render(<ProjectExplorer />);
    expect(screen.getByRole("heading", { name: "Projects /" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Field Notes Lab/ }));
    expect(screen.getByText(/An idea for collecting and organizing/)).toBeTruthy();
  });
});
