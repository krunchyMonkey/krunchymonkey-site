import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const port = Number(process.env.KRUNCHOS_E2E_PORT ?? 4317);
const baseURL = `http://127.0.0.1:${port}`;

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      threshold: 0.2,
      maxDiffPixels: 0,
    },
  },
  updateSnapshots: isCI ? "none" : "missing",
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      testMatch: ["desktop.spec.ts", "baseline.spec.ts", "desktop.visual.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: desktopViewport,
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-chromium",
      testMatch: ["mobile.spec.ts", "mobile.visual.ts"],
      use: {
        ...devices["Pixel 7"],
        viewport: mobileViewport,
        screen: mobileViewport,
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile-webkit",
      testMatch: ["mobile.spec.ts"],
      use: {
        ...devices["iPhone 13"],
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: `npx vite build --logLevel warn && npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
