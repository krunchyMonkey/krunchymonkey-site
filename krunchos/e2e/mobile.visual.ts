import { bootKrunchOS, expect, mobileShell, parkPointer, test } from "./fixtures";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ page }) => {
  await bootKrunchOS(page);
});

test("mobile launcher", async ({ page }) => {
  await expect(page).toHaveScreenshot("mobile-launcher.png");
});

test("mobile Workbench", async ({ page }) => {
  await mobileShell(page).launcher.getByRole("button", { name: "Workbench" }).tap();
  await parkPointer(page);

  await expect(page).toHaveScreenshot("mobile-workbench.png");
});
