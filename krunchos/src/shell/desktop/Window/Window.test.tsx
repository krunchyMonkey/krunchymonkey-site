import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Window } from "./Window";

afterEach(cleanup);

describe("Window", () => {
  it("exposes the application title and accessible window controls", () => {
    const onMinimize = vi.fn();
    const onClose = vi.fn();
    render(
      <Window
        window={{
          id: "workbench",
          x: 10,
          y: 20,
          width: 500,
          height: 400,
          zIndex: 1,
          minimized: false,
        }}
        onMove={vi.fn()}
        onFocus={vi.fn()}
        onMinimize={onMinimize}
        onClose={onClose}
      >
        <p>Welcome</p>
      </Window>,
    );

    expect(screen.getByRole("region", { name: "Workbench window" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Minimize Workbench" }));
    fireEvent.click(screen.getByRole("button", { name: "Close Workbench" }));
    expect(onMinimize).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
