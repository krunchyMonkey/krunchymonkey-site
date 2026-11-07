import { bootKrunchOS, desktopShell, expect, test } from "./fixtures";

test("the original v0.1 preview at / still boots and works", async ({ page }) => {
  await bootKrunchOS(page, "/");
  const os = desktopShell(page);
  const workbench = os.window("Workbench");

  await expect(page.locator(".classic-os")).toHaveCount(1);
  await expect(page.locator(".pixel-os")).toHaveCount(0);
  await expect(page.getByRole("banner")).toContainText("LOCAL PREVIEW · v0.1");
  await expect(workbench).toBeVisible();
  await expect(os.window("Open Bench")).toHaveCount(0);

  const row = workbench.getByRole("button", { name: /Field Notes Lab/ });
  await row.click();
  await expect(row).toHaveAttribute("aria-pressed", "true");
  await expect(workbench.getByRole("region", { name: "Selected project details" })).toContainText(
    "Field Notes Lab",
  );

  await os.dock.getByRole("button", { name: "Open Bench", exact: true }).click();
  await expect(os.window("Open Bench")).toBeVisible();
});
