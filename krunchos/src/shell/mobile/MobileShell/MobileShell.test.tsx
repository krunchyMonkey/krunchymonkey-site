import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MobileShell } from "./MobileShell";

afterEach(cleanup);

describe("MobileShell", () => {
  it("opens a registered app and provides a home action", () => {
    const onLaunch = vi.fn();
    const onHome = vi.fn();
    const { rerender } = render(
      <MobileShell
        activeApp={null}
        onLaunch={onLaunch}
        onHome={onHome}
        notice=""
        onNotice={vi.fn()}
        renderApp={() => null}
      />,
    );

    const launcher = screen.getByRole("navigation", { name: "Mobile applications" });
    fireEvent.click(within(launcher).getByRole("button", { name: "Workbench" }));
    expect(onLaunch).toHaveBeenCalledWith("workbench");

    rerender(
      <MobileShell
        activeApp="workbench"
        onLaunch={onLaunch}
        onHome={onHome}
        notice=""
        onNotice={vi.fn()}
        renderApp={() => null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to home" }));
    expect(onHome).toHaveBeenCalledOnce();
  });

  it("does not launch an unfinished application", () => {
    const onLaunch = vi.fn();
    const onNotice = vi.fn();
    render(
      <MobileShell
        activeApp={null}
        onLaunch={onLaunch}
        onHome={vi.fn()}
        notice=""
        onNotice={onNotice}
        renderApp={() => null}
      />,
    );

    const launcher = screen.getByRole("navigation", { name: "Mobile applications" });
    fireEvent.click(within(launcher).getByRole("button", { name: "Browser" }));
    expect(onLaunch).not.toHaveBeenCalled();
    expect(onNotice).toHaveBeenCalledWith("Browser arrives in v0.5.");
  });
});
