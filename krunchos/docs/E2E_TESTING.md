# KrunchOS end-to-end and visual regression tests

Playwright Test checks that the approved pixel OS (`/?preview=8bitcn`) behaves like an operating system on desktop and mobile, that the original v0.1 preview (`/`) still works, and that the approved look does not drift without review.

## Quick start

```bash
cd krunchos
npm ci
npx playwright install chromium webkit   # once per Playwright version
npm run test:e2e:functional              # behavior only: all three projects
npm run test:e2e                         # behavior + screenshots
```

| Script                              | Purpose                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| `npm run test:e2e`                  | Full suite: every project, functional and visual.                 |
| `npm run test:e2e:functional`       | Behavior specs only (`*.spec.ts`).                                |
| `npm run test:e2e:visual`           | Screenshot comparisons only (`*.visual.ts`).                      |
| `npm run test:e2e:headed`           | Desktop Chromium with a visible browser.                          |
| `npm run test:e2e:debug`            | Playwright Inspector, step by step.                               |
| `npm run test:e2e:report`           | Open the last HTML report.                                        |
| `npm run test:e2e:update-snapshots` | Re-render screenshot baselines for **your platform** (see below). |

## Isolation and privacy

- Playwright builds the app and serves it with `vite preview` on **127.0.0.1:4317** with `--strictPort`. It never reuses an existing server, so if the port is busy the run stops with an error instead of testing whatever is listening there. Nothing is killed.
- To use a different port, set `KRUNCHOS_E2E_PORT`, for example `KRUNCHOS_E2E_PORT=4327 npm run test:e2e` (PowerShell: `$env:KRUNCHOS_E2E_PORT=4327; npm run test:e2e`). Ports 4190–4192 belong to other local services; leave them alone.
- Every test runs behind a network guard (`e2e/fixtures.ts`). Any request outside the local preview origin is blocked and fails the test, so the suite cannot reach `tg.krunchymonkey.dev`, LAN services or other hosts.
- Tests use only the public project catalog in `src/features/workbench/model/projects.ts`. Do not add client, genealogy or other private data to fixtures.

## Browser matrix

| Project            | Engine                             | Viewport        | Runs                                                       |
| ------------------ | ---------------------------------- | --------------- | ---------------------------------------------------------- |
| `desktop-chromium` | Chromium                           | 1440×900, DPR 1 | `desktop.spec.ts`, `baseline.spec.ts`, `desktop.visual.ts` |
| `mobile-chromium`  | Chromium, Pixel 7 emulation, touch | 390×844, DPR 1  | `mobile.spec.ts`, `mobile.visual.ts`                       |
| `mobile-webkit`    | WebKit, iPhone 13 emulation, touch | 390×844, DPR 1  | `mobile.spec.ts` (functional smoke, no screenshots)        |

WebKit runs the mobile behavior specs but has no screenshot baselines: one pinned engine per baseline keeps the visual gate stable, and WebKit's value here is checking that navigation and touch work.

## What is covered

**Desktop (`desktop.spec.ts`)**: OS chrome (menu bar, logo, wallpaper, shortcuts, dock, two windows, no marketing hero); z-order on focus, checked by hit-testing the overlap; titlebar dragging and bounds; minimize and restore from the dock without duplicates; close and relaunch; Workbench project selection and inspector; 8bitcn/ui Button and Card rendering and keyboard activation; honest planned-app notices for Projects, Terminal and Settings.

**Baseline (`baseline.spec.ts`)**: the classic preview at `/` boots, selects a project and opens Open Bench.

**Mobile (`mobile.spec.ts`)**: launcher, brand and dock render while desktop markup stays hidden; no horizontal overflow; tap targets are at least 24×24 px (WCAG 2.5.8), on screen and not overlapping; Workbench opens full screen, project selection works with touch, and Back, Home and the dock all navigate; planned apps explain their release.

**Known gaps (`test.fail`)**: these tests describe the correct behavior and are expected to fail until the linked issue is fixed. If one starts passing, Playwright reports it as a failure, so the marker has to be removed in the fixing PR.

| Test                                                   | Tracking issue |
| ------------------------------------------------------ | -------------- |
| Browser back returns from a mobile app to the launcher | KMOS-011 #24   |

## Visual regression

| Baseline                        | Project          | Size                 |
| ------------------------------- | ---------------- | -------------------- |
| `desktop-boot.png`              | desktop-chromium | 1440×900, full page  |
| `workbench-focused.png`         | desktop-chromium | Workbench window     |
| `overlap-open-bench-raised.png` | desktop-chromium | 1440×900 viewport    |
| `overlap-workbench-raised.png`  | desktop-chromium | 1440×900 viewport    |
| `8bitcn-project-cards.png`      | desktop-chromium | Project files region |
| `mobile-launcher.png`           | mobile-chromium  | 390×844 viewport     |
| `mobile-workbench.png`          | mobile-chromium  | 390×844 viewport     |

Baselines are stored in `e2e/__screenshots__/<platform>/<project>/<name>.png`.

### Determinism

- Fixed viewport, device scale factor 1, `en-US` locale, UTC time zone, light color scheme and reduced motion.
- Captures wait for `document.fonts.ready` and for every image to finish decoding. Animations are disabled, the caret is hidden and the pointer is moved away so hover styles never appear in a capture. The suite uses no fixed sleeps.
- **Tolerance:** `maxDiffPixels: 0` with Playwright's default per-pixel color `threshold: 0.2`. The threshold absorbs sub-visible antialiasing intensity noise; no pixel may change beyond it. A 25-pixel budget was tried first and rejected, because swapping a single `I` for `l` in the Workbench toolbar changes exactly 1 pixel and passed.

### Linux CI is the source of truth

Fonts and rasterization differ between operating systems (the UI uses Courier New, which Linux maps to Liberation Mono). Only `__screenshots__/linux/` is committed. CI renders inside the pinned `mcr.microsoft.com/playwright:v1.64.1-noble` image, so the OS, fonts and browser builds match exactly.

On Windows or macOS the first visual run writes local baselines into `__screenshots__/win32/` or `__screenshots__/darwin/`. Those folders are git-ignored and only useful for checking your own changes locally.

### Changing an approved baseline

CI runs with `updateSnapshots: "none"`, so it never accepts or writes a baseline. To approve an intentional visual change:

1. Push the UI change. The `e2e` job fails and uploads `playwright-test-results` with `*-expected.png`, `*-actual.png` and `*-diff.png` for each changed screenshot.
2. Add the **`krunchos-snapshots`** label to the PR. The `snapshot-candidates` job renders every visual test in the pinned Linux image and uploads `krunchos-snapshot-candidates`. It cannot write to the repository.
3. Download the artifact, inspect each image, and copy only the intended ones into `krunchos/e2e/__screenshots__/linux/`. Commit them in a separate `test(e2e): update baselines` commit that explains why.
4. Remove the label. The PR re-runs and must pass against the new baselines.

If Docker is available, step 2 can be done locally:

```bash
docker run --rm -v "$PWD":/work -w /work/krunchos mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c "npm ci && npx playwright test visual.ts --update-snapshots=all"
```

## CI

`.github/workflows/krunchos-validate.yml` runs on pull requests that touch `krunchos/**`, the shared logo or the workflow itself:

- `preview-checks`: `npm ci`, TypeScript for the app and the E2E code, ESLint, Vitest and the production build.
- `e2e`: the full Playwright suite in the pinned container. The HTML report is always uploaded; traces, failure screenshots, videos and diffs are uploaded on failure. Artifacts are kept for 7 days.
- `snapshot-candidates`: runs only when the `krunchos-snapshots` label is added.

The workflow has `contents: read` permission only, does not persist checkout credentials, and has explicit timeouts. `retries` is `0` everywhere: a flaky test fails the build and gets fixed rather than retried.

## Triage

1. Open the `playwright-report` artifact (or run `npm run test:e2e:report` locally) and find the failing test.
2. For a screenshot failure, compare the `expected`, `actual` and `diff` images. If the change was intended, follow the baseline update process above. Otherwise fix the regression.
3. For a behavior failure, open the trace: `npx playwright show-trace path/to/trace.zip`. It shows each action, the DOM snapshot, console output and network activity.
4. If the run fails with "port is already used", another process is on 4317. Choose another port with `KRUNCHOS_E2E_PORT`. Do not stop the other process.
5. An "external network requests" failure means the app tried to reach another host. Remove that dependency rather than allowlisting it.
