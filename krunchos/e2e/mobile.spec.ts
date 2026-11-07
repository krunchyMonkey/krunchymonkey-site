import type { Locator, Page } from "@playwright/test";
import { PIXEL_OS_PATH, bootKrunchOS, expect, imageIsLoaded, mobileShell, test } from "./fixtures";

const MIN_TOUCH_TARGET = 24;
const COMFORTABLE_TOUCH_TARGET = 44;

test.beforeEach(async ({ page }) => {
  await bootKrunchOS(page);
});

async function boxesOf(locator: Locator) {
  const boxes = [];
  for (const item of await locator.all()) {
    const box = await item.boundingBox();
    if (!box) throw new Error("Expected a visible control");
    boxes.push(box);
  }
  return boxes;
}

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "page must not scroll horizontally").toBeLessThanOrEqual(clientWidth);
}

async function expectUsableTargets(page: Page, controls: Locator) {
  const viewport = page.viewportSize()!;
  const boxes = await boxesOf(controls);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }
  for (const [index, a] of boxes.entries()) {
    for (const b of boxes.slice(index + 1)) {
      const overlaps =
        a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
      expect(overlaps, "tap targets must not overlap").toBe(false);
    }
  }
}

test.describe("launcher", () => {
  test("shows the brand and app launcher instead of desktop windows", async ({ page }) => {
    const mobile = mobileShell(page);

    await expect(page.getByRole("heading", { level: 1, name: "KrunchOS" })).toBeVisible();
    await expect.poll(() => imageIsLoaded(page.locator(".mobile-brand-mark"))).toBe(true);
    await expect(mobile.launcher.getByRole("button")).toHaveText([
      /Workbench$/,
      /Projects$/,
      /Journal$/,
      /Schematics$/,
      /Browser$/,
      /Terminal$/,
      /Open Bench$/,
      /Settings$/,
    ]);
    await expect(mobile.dock.getByRole("button")).toHaveCount(3);

    await expect(page.getByRole("main", { name: "KrunchOS desktop" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Application dock" })).toBeHidden();
    await expect(page.getByRole("region", { name: /window$/ })).toHaveCount(0);
  });

  test("fits the viewport with usable, non-overlapping tap targets", async ({ page }) => {
    const mobile = mobileShell(page);
    await expectNoHorizontalOverflow(page);
    await expectUsableTargets(page, mobile.launcher.getByRole("button"));
    await expectUsableTargets(page, mobile.dock.getByRole("button"));
  });

  test("planned apps explain their release instead of opening", async ({ page }) => {
    const mobile = mobileShell(page);
    await mobile.launcher.getByRole("button", { name: "Terminal" }).tap();

    await expect(mobile.status).toHaveText("Terminal arrives in v1.0.");
    await expect(mobile.back).toBeHidden();
    await expect(mobile.launcher).toBeVisible();
  });
});

test.describe("app navigation", () => {
  test("opens Workbench full screen, selects a project and returns home", async ({ page }) => {
    const mobile = mobileShell(page);
    await mobile.launcher.getByRole("button", { name: "Workbench" }).tap();

    await expect(mobile.launcher).toBeHidden();
    await expect(mobile.back).toBeVisible();
    await expect(mobile.app.getByText("▣ WORKBENCH / PROJECT FILES")).toBeVisible();

    const files = page.getByRole("region", { name: "Project files" });
    const lastProject = files.getByRole("button", { name: "Inspect Data Sketches" });
    await lastProject.scrollIntoViewIfNeeded();
    await lastProject.tap();
    await expect(lastProject).toHaveAttribute("aria-pressed", "true");

    const inspector = page.getByRole("region", { name: "Selected project details" });
    await inspector.scrollIntoViewIfNeeded();
    await expect(inspector).toBeInViewport();
    await expect(inspector).toContainText(
      "Little experiments in visual explanations and software.",
    );
    await expectNoHorizontalOverflow(page);

    await mobile.back.tap();
    await expect(mobile.launcher).toBeVisible();
    await expect(mobile.back).toBeHidden();
  });

  test("keeps navigation controls on screen inside an app", async ({ page }) => {
    const mobile = mobileShell(page);
    await mobile.launcher.getByRole("button", { name: "Workbench" }).tap();

    await expect(mobile.back).toBeInViewport();
    await expectUsableTargets(page, mobile.dock.getByRole("button"));
    await expectUsableTargets(page, mobile.back);
  });

  for (const [appearance, path] of [
    ["pixel", PIXEL_OS_PATH],
    ["classic", "/"],
  ] as const) {
    test(`Back to home is a 44px target and the title stays on one line (${appearance})`, async ({
      page,
    }) => {
      await bootKrunchOS(page, path);
      const mobile = mobileShell(page);
      await mobile.launcher.getByRole("button", { name: "Workbench" }).tap();

      const box = await mobile.back.boundingBox();
      console.log(`Back to home box (${appearance}): ${box!.width}x${box!.height}`);
      expect(box!.width).toBeGreaterThanOrEqual(COMFORTABLE_TOUCH_TARGET);
      expect(box!.height).toBeGreaterThanOrEqual(COMFORTABLE_TOUCH_TARGET);

      const titlebar = page.locator(".mobile-titlebar");
      const title = titlebar.locator("strong");
      const titleBox = await title.boundingBox();
      const lineHeight = await title.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
      expect(titleBox!.height, "title must not wrap").toBeLessThan(
        (Number.isNaN(lineHeight) ? 24 : lineHeight) * 1.5,
      );
      const barBox = await titlebar.boundingBox();
      expect(titleBox!.x).toBeGreaterThanOrEqual(box!.x + box!.width);
      expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(barBox!.x + barBox!.width);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("dock switches between apps and returns home", async ({ page }) => {
    const mobile = mobileShell(page);

    await mobile.dock.getByRole("button", { name: "Open Bench" }).tap();
    await expect(page.getByRole("heading", { name: "Pull up a chair." })).toBeVisible();

    await mobile.dock.getByRole("button", { name: "Open Workbench" }).tap();
    await expect(page.getByRole("region", { name: "Project files" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pull up a chair." })).toBeHidden();

    await mobile.dock.getByRole("button", { name: "Home" }).tap();
    await expect(mobile.launcher).toBeVisible();
  });

  test("browser back returns from an app to the launcher", async ({ page }) => {
    test.fail(true, "Known gap: the mobile shell does not use browser history yet (KMOS-011 #24).");
    const mobile = mobileShell(page);
    await mobile.launcher.getByRole("button", { name: "Workbench" }).tap();
    await expect(mobile.back).toBeVisible();

    await page.goBack();

    await expect(mobile.launcher).toBeVisible({ timeout: 2_000 });
  });
});
