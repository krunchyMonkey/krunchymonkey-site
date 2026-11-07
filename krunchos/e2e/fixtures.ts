import { test as base, expect, type Locator, type Page } from "@playwright/test";

export const PIXEL_OS_PATH = "/?preview=8bitcn";

interface KrunchOSFixtures {
  readonly externalRequests: string[];
}

/**
 * Every test runs with a network guard: only the isolated local preview origin
 * may be contacted, so the suite can never reach tg.krunchymonkey.dev, LAN
 * services or any other remote host.
 */
export const test = base.extend<KrunchOSFixtures>({
  externalRequests: [
    async ({ context, baseURL }, use) => {
      const allowedOrigin = new URL(baseURL ?? "http://127.0.0.1").origin;
      const blocked: string[] = [];
      await context.route("**/*", (route) => {
        const url = route.request().url();
        if (new URL(url).origin === allowedOrigin) return route.continue();
        blocked.push(url);
        return route.abort("blockedbyclient");
      });
      await use(blocked);
      expect(blocked, "KrunchOS must not make external network requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function waitForStableRender(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
}

export async function bootKrunchOS(page: Page, path = PIXEL_OS_PATH) {
  await page.goto(path);
  await waitForStableRender(page);
}

/** Glyphs that OS fallback fonts render inconsistently; icons must be owned SVG instead. */
export const FALLBACK_FONT_GLYPHS = /[▤▣▥⌘◎✦⚙⌂✧▧]/u;

export function desktopShell(page: Page) {
  const desktop = page.getByRole("main", { name: "KrunchOS desktop" });
  return {
    desktop,
    menuBar: page.getByRole("navigation", { name: "Workstation menus" }),
    shortcuts: page.getByRole("navigation", { name: "Desktop shortcuts" }),
    dock: page.getByRole("navigation", { name: "Application dock" }),
    status: desktop.getByRole("status"),
    window: (title: string) => desktop.getByRole("region", { name: `${title} window` }),
  };
}

export function mobileShell(page: Page) {
  return {
    app: page.getByRole("main"),
    launcher: page.getByRole("navigation", { name: "Mobile applications" }),
    dock: page.getByRole("navigation", { name: "Mobile dock" }),
    back: page.getByRole("button", { name: "Back to home" }),
    status: page.getByRole("status"),
  };
}

export async function imageIsLoaded(image: Locator) {
  return image.evaluate((element) => {
    const img = element as HTMLImageElement;
    return img.complete && img.naturalWidth > 0;
  });
}

/** Drags a window by its titlebar handle using real pointer input. */
export async function dragWindow(page: Page, window: Locator, dx: number, dy: number) {
  const handle = window.locator(".window-drag-handle");
  const box = await handle.boundingBox();
  if (!box) throw new Error("Window titlebar is not visible");
  const startX = box.x + 40;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, { steps: 8 });
  await page.mouse.up();
}

/** Returns the accessible name of the window that is visually on top at a point. */
export async function topmostWindowAt(page: Page, x: number, y: number) {
  return page.evaluate(
    ([px, py]) =>
      document
        .elementFromPoint(px, py)
        ?.closest('[role="region"][aria-label$=" window"]')
        ?.getAttribute("aria-label") ?? null,
    [x, y] as const,
  );
}

/** Moves the pointer away so hover styles never leak into screenshots. */
export async function parkPointer(page: Page) {
  await page.mouse.move(0, 0);
}
