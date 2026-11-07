import {
  FALLBACK_FONT_GLYPHS,
  bootKrunchOS,
  desktopShell,
  dragWindow,
  expect,
  imageIsLoaded,
  test,
  topmostWindowAt,
} from "./fixtures";

test.beforeEach(async ({ page }) => {
  await bootKrunchOS(page);
});

test.describe("boot", () => {
  test("shows real operating-system chrome instead of a marketing page", async ({ page }) => {
    const os = desktopShell(page);
    const menuBar = page.getByRole("banner");

    await expect(menuBar).toBeVisible();
    await expect(menuBar.getByText("KrunchOS", { exact: true })).toBeVisible();
    await expect.poll(() => imageIsLoaded(menuBar.locator("img"))).toBe(true);
    await expect(os.menuBar.getByRole("button")).toHaveText(["Workbench", "Open Bench"]);

    await expect(os.desktop).toBeVisible();
    await expect(os.desktop.getByText("ORDER BENEATH THE CHAOS")).toBeVisible();

    await expect(os.shortcuts.getByRole("button")).toHaveText([
      /Workbench$/,
      /Projects$/,
      /Journal$/,
      /Open Bench$/,
    ]);

    await expect(os.dock.getByRole("button")).toHaveCount(8);
    await expect(os.dock.getByRole("button", { name: "Workbench", exact: true })).toBeVisible();
    await expect(os.dock.getByRole("button", { name: "Terminal, planned for v1.0" })).toBeVisible();

    await expect(os.window("Workbench")).toBeVisible();
    await expect(os.window("Open Bench")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  });

  test("draws icons as owned svg instead of fallback-font glyphs", async ({ page }) => {
    const os = desktopShell(page);
    expect(await page.locator("body").innerText()).not.toMatch(FALLBACK_FONT_GLYPHS);

    for (const group of [os.shortcuts, os.dock]) {
      for (const button of await group.getByRole("button").all()) {
        await expect(button.locator('svg[aria-hidden="true"]')).toHaveCount(1);
      }
    }
    await expect(
      os.window("Workbench").locator('.window-app-icon svg[aria-hidden="true"]'),
    ).toHaveCount(1);
  });

  test("hides the mobile launcher at desktop width", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "Mobile applications" })).toBeHidden();
  });
});

test.describe("window management", () => {
  test("focusing a window raises it above an overlapping window", async ({ page }) => {
    const os = desktopShell(page);
    const workbench = os.window("Workbench");
    const openBench = os.window("Open Bench");

    await dragWindow(page, openBench, -300, 0);
    const workbenchBox = await workbench.boundingBox();
    const benchBox = await openBench.boundingBox();
    expect(workbenchBox && benchBox).toBeTruthy();
    const overlapX = (benchBox!.x + workbenchBox!.x + workbenchBox!.width) / 2;
    const overlapY = benchBox!.y + benchBox!.height / 2;
    expect(overlapX).toBeGreaterThan(benchBox!.x);
    expect(overlapX).toBeLessThan(workbenchBox!.x + workbenchBox!.width);

    expect(await topmostWindowAt(page, overlapX, overlapY)).toBe("Open Bench window");

    await workbench.getByRole("navigation", { name: "Project folders" }).click();
    expect(await topmostWindowAt(page, overlapX, overlapY)).toBe("Workbench window");

    await os.dock.getByRole("button", { name: "Open Bench", exact: true }).click();
    expect(await topmostWindowAt(page, overlapX, overlapY)).toBe("Open Bench window");
  });

  test("dragging the titlebar moves the window", async ({ page }) => {
    const workbench = desktopShell(page).window("Workbench");
    const before = await workbench.boundingBox();

    await dragWindow(page, workbench, 120, 60);

    const after = await workbench.boundingBox();
    expect(after!.x - before!.x).toBeCloseTo(120, 0);
    expect(after!.y - before!.y).toBeCloseTo(60, 0);
  });

  test("keeps a dragged window inside the desktop", async ({ page }) => {
    const os = desktopShell(page);
    const workbench = os.window("Workbench");

    await dragWindow(page, workbench, -2000, -2000);

    const desktopBox = await os.desktop.boundingBox();
    const windowBox = await workbench.boundingBox();
    expect(windowBox!.x).toBeGreaterThanOrEqual(desktopBox!.x);
    expect(windowBox!.y).toBeGreaterThanOrEqual(desktopBox!.y);
  });

  test("minimize hides the window and the dock restores it without duplicates", async ({
    page,
  }) => {
    const os = desktopShell(page);
    const workbench = os.window("Workbench");
    const dockButton = os.dock.getByRole("button", { name: "Workbench", exact: true });

    await workbench.getByRole("button", { name: "Minimize Workbench" }).click();
    await expect(workbench).toHaveCount(0);
    await expect(os.window("Open Bench")).toBeVisible();

    await dockButton.click();
    await expect(workbench).toHaveCount(1);
    await expect(workbench).toBeVisible();

    await dockButton.click();
    await expect(workbench).toHaveCount(1);
  });

  test("dock buttons expose running and minimized state without renaming", async ({ page }) => {
    const os = desktopShell(page);
    const workbench = os.window("Workbench");
    const dockButton = os.dock.getByRole("button", { name: "Workbench", exact: true });

    await expect(dockButton).toHaveAccessibleDescription("Running");
    await workbench.getByRole("button", { name: "Minimize Workbench" }).click();
    await expect(dockButton).toHaveAccessibleDescription("Minimized");
    await dockButton.click();
    await expect(dockButton).toHaveAccessibleDescription("Running");
    await workbench.getByRole("button", { name: "Close Workbench" }).click();
    await expect(dockButton).toHaveAccessibleDescription("");
    await dockButton.click();
    await expect(dockButton).toHaveAccessibleDescription("Running");

    const terminal = os.dock.getByRole("button", { name: "Terminal, planned for v1.0" });
    await expect(terminal).toBeVisible();
    await expect(terminal).toHaveAccessibleDescription("");
  });

  test("restoring a minimized window keeps its application state", async ({ page }) => {
    const os = desktopShell(page);
    const workbench = os.window("Workbench");

    await workbench.getByRole("button", { name: "Inspect Data Sketches" }).click();
    await workbench.getByRole("button", { name: "Minimize Workbench" }).click();
    await os.dock.getByRole("button", { name: "Workbench", exact: true }).click();

    await expect(workbench.getByRole("region", { name: "Selected project details" })).toContainText(
      "Data Sketches",
    );
  });

  test("close removes the window and relaunch opens a fresh one", async ({ page }) => {
    const os = desktopShell(page);
    const openBench = os.window("Open Bench");

    await openBench.getByRole("button", { name: "Close Open Bench" }).click();
    await expect(openBench).toHaveCount(0);

    await os.shortcuts.getByRole("button", { name: "Open Bench" }).click();
    await expect(openBench).toHaveCount(1);
    await expect(openBench.getByRole("heading", { name: "Pull up a chair." })).toBeVisible();

    await os.menuBar.getByRole("button", { name: "Open Bench" }).click();
    await expect(openBench).toHaveCount(1);
  });
});

test.describe("Workbench", () => {
  test("lists public project files and inspects the selected project", async ({ page }) => {
    const workbench = desktopShell(page).window("Workbench");
    const files = workbench.getByRole("region", { name: "Project files" });
    const inspector = workbench.getByRole("region", { name: "Selected project details" });

    await expect(workbench.getByRole("navigation", { name: "Project folders" })).toBeVisible();
    await expect(workbench.getByText("4 FILES")).toBeVisible();
    await expect(files.getByRole("button", { name: /^Inspect / })).toHaveCount(4);
    await expect(files.getByRole("button", { name: "Inspect Tracing Guatemala" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(inspector).toContainText("Tracing Guatemala");
    await expect(inspector).toContainText("STATUS: Public overview");

    await files.getByRole("button", { name: "Inspect Field Notes Lab" }).click();

    await expect(files.getByRole("button", { name: "Inspect Field Notes Lab" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(files.getByRole("button", { name: "Inspect Tracing Guatemala" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(inspector).toContainText("Field Notes Lab");
    await expect(inspector).toContainText(
      "An idea for collecting and organizing research discoveries.",
    );
    await expect(inspector).toContainText("STATUS: Concept");
    await expect(inspector).not.toContainText("Tracing Guatemala");
  });

  test("renders 8bitcn/ui buttons and cards that respond to activation", async ({ page }) => {
    const workbench = desktopShell(page).window("Workbench");
    const inspect = workbench.getByRole("button", { name: "Inspect Data Sketches" });

    await expect(inspect).toHaveAttribute("data-slot", "button");
    await expect(inspect.locator('[data-slot="button-decorations"] > span').first()).toBeVisible();
    await expect(workbench.locator('[data-slot="card"]')).toHaveCount(4);

    await inspect.focus();
    await page.keyboard.press("Enter");
    await expect(inspect).toHaveAttribute("aria-pressed", "true");
    await expect(inspect).toHaveText("✓ SELECTED");
  });
});

test.describe("planned applications", () => {
  for (const { launcher, name, expected } of [
    { launcher: "shortcuts", name: "Projects", expected: "Projects is planned for v0.4." },
    {
      launcher: "dock",
      name: "Terminal, planned for v1.0",
      expected: "Terminal is planned for v1.0.",
    },
    {
      launcher: "dock",
      name: "Settings, planned for v1.0",
      expected: "Settings is planned for v1.0.",
    },
  ] as const) {
    test(`${name} announces its planned release without opening a window`, async ({ page }) => {
      const os = desktopShell(page);
      const windows = os.desktop.getByRole("region", { name: / window$/ });
      await expect(windows).toHaveCount(2);

      await os[launcher].getByRole("button", { name, exact: true }).click();

      await expect(os.status).toHaveText(expected);
      await expect(windows).toHaveCount(2);
    });
  }

  test("launching an available app clears the planned notice", async ({ page }) => {
    const os = desktopShell(page);
    await os.shortcuts.getByRole("button", { name: "Journal" }).click();
    await expect(os.status).toHaveText("Journal is planned for v0.4.");

    await os.shortcuts.getByRole("button", { name: "Workbench" }).click();
    await expect(os.status).toBeHidden();
  });
});
