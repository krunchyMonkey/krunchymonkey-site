import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MobileShell } from "./MobileShell";

afterEach(cleanup);

describe("MobileShell", () => {
  it("opens a registered app and provides a home action", () => {
    const onLaunch = vi.fn();
    const onHome = vi.fn();

    const { rerender } = render(
      <MobileShell activeApp={null} onLaunch={onLaunch} onHome={onHome} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Workbench" }));
    expect(onLaunch).toHaveBeenCalledWith("workbench");

    rerender(<MobileShell activeApp="workbench" onLaunch={onLaunch} onHome={onHome} />);
    fireEvent.click(screen.getByRole("button", { name: "Back to home" }));
    expect(onHome).toHaveBeenCalledOnce();
  });

  it("does not launch an unfinished application", () => {
    const onLaunch = vi.fn();
    render(<MobileShell activeApp={null} onLaunch={onLaunch} onHome={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Browser" }));
    expect(onLaunch).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain("v0.5");
  });
});
