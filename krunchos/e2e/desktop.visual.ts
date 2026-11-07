import {
  bootKrunchOS,
  desktopShell,
  dragWindow,
  expect,
  parkPointer,
  test,
  waitForStableRender,
} from "./fixtures";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await bootKrunchOS(page);
});

test("desktop boot", async ({ page }) => {
  await expect(page).toHaveScreenshot("desktop-boot.png", { fullPage: true });
});

test("Workbench focused with a selected project", async ({ page }) => {
  const os = desktopShell(page);
  const workbench = os.window("Workbench");

  await os.dock.getByRole("button", { name: "Open Bench", exact: true }).click();
  await workbench.getByRole("button", { name: "Inspect Field Notes Lab" }).click();
  await parkPointer(page);

  await expect(workbench).toHaveScreenshot("workbench-focused.png");
});

test("overlapping windows follow z-order", async ({ page }) => {
  const os = desktopShell(page);

  await dragWindow(page, os.window("Open Bench"), -300, 40);
  await parkPointer(page);
  await expect(page).toHaveScreenshot("overlap-open-bench-raised.png");

  await os.window("Workbench").getByRole("navigation", { name: "Project folders" }).click();
  await parkPointer(page);
  await expect(page).toHaveScreenshot("overlap-workbench-raised.png");
});

test("8bitcn/ui project cards and buttons", async ({ page }) => {
  const files = desktopShell(page)
    .window("Workbench")
    .getByRole("region", { name: "Project files" });
  await files.getByRole("button", { name: "Inspect KrunchOS (This!)" }).click();
  await parkPointer(page);
  await waitForStableRender(page);

  await expect(files).toHaveScreenshot("8bitcn-project-cards.png");
});
