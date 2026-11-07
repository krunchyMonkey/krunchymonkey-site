import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { apps } from "../../apps";
import { appViews, renderApp } from "./appViews";

afterEach(cleanup);

describe("appViews", () => {
  it("maps every available app to a view in both appearances and nothing else", () => {
    for (const appearance of ["pixel", "classic"] as const) {
      for (const app of apps) {
        const view = appViews[appearance][app.id];
        if (app.available) expect(view, appearance + " " + app.id).not.toBeNull();
        else expect(view, appearance + " " + app.id).toBeNull();
      }
    }
  });

  it("renders a fallback for apps without a view", () => {
    render(<>{renderApp("terminal", "classic")}</>);
    expect(screen.getByText("This application is still being crafted.")).toBeTruthy();
  });
});
