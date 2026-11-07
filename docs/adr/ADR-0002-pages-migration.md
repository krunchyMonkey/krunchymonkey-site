# ADR-0002: Bringing KrunchOS onto GitHub Pages

**Status:** Proposed for owner review. Nothing in this ADR changes the live site, the Pages workflow or DNS.
**Issue:** #15 (KMOS-002). **Related:** ADR-0001 (`krunchos/docs/ADR-0001.md`, draft PR #47), #16, #17, #24, #40.
**Date:** 2026-11-07

## Context

`krunchymonkey.dev` is a static, dependency-free GitHub Pages artifact. `scripts/build_site.py` publishes an explicit allowlist of 8 files:

| Public URL | Source |
| --- | --- |
| `/` | `index.html` |
| `/tracing-guatemala/` | `tracing-guatemala/index.html` |
| `/tracing-guatemala/demo/` | `tracing-guatemala/demo/index.html` |
| `/tracing-guatemala/privacy/` | `tracing-guatemala/privacy/index.html` (the privacy/legal URL referenced by the Google OAuth consent screen) |
| assets | `assets/site.css`, `assets/favicon.png`, `assets/krunchymonkey-logo.webp`, `.nojekyll` |

KrunchOS is a React/TypeScript/Vite single-page app in `krunchos/` (draft stack #47 → #63 and the follow-ups in this release). It must eventually replace the homepage without breaking any of the URLs above.

GitHub Pages behaviour that constrains the design. Observed read-only on 2026-11-07 against the live site:

- **No server rewrites.** A path that is not a file returns 404. Today the site has no `404.html`, so Pages serves its default 404 page.
- A directory without a trailing slash gets a **301** to the slash form (`/tracing-guatemala` → `/tracing-guatemala/`).
- Every response carries **`Cache-Control: max-age=600`**. Nothing can be made immutable, and HTML cannot be made `no-cache`.
- With the custom domain set, the project path `krunchymonkey.github.io/krunchymonkey-site/…` **301-redirects to `krunchymonkey.dev/…`** with the path kept. So this repo serves only at base `/`. A project-path base (`/<repo>/`) matters for a separate preview repository, for forks, and if the custom domain is ever removed.

## Options

### A. Incremental mounting (recommended)

Keep the existing static pages exactly as they are. Publish the KrunchOS build as one more allowlisted directory, `/os/`. Later, when the owner accepts it, make the homepage hand off to it.

- KrunchOS builds with Vite `base: "./"`, so every asset URL is relative. The same artifact works at `/os/`, at `/krunchymonkey-site/os/` and at any preview path, with no rebuild.
- App deep links use **hash routes** (`/os/#/workbench`). The fragment never reaches the server, so cold load and reload of any app URL hit `/os/index.html` and need no rewrite. Unknown or disabled routes resolve to the launcher with a notice (#16, #24).
- `/tracing-guatemala/**` and the privacy page stay hand-written static HTML. They work without JavaScript, keep their exact bytes, and stay outside KrunchOS's failure domain.
- Cutover is a small, separate step: the homepage gains a link or a progressive hand-off to `/os/`, or `/` becomes KrunchOS while the old homepage moves to its own URL. Each step is its own reviewed PR.

### B. Full homepage replacement (rejected for now)

Make `/` the SPA and serve every public URL from it.

- Pages has no rewrites. Path routes such as `/tracing-guatemala/privacy/` would then need either duplicated `index.html` stubs or the `404.html` redirect trick. Both return the wrong status or need JavaScript for the privacy policy, and that URL must stay crawlable and stable for OAuth verification.
- The whole public site moves into one failure domain. A broken bundle takes down the privacy policy and the Tracing Guatemala pages.
- Rollback means restoring a completely different artifact rather than dropping one directory.
- One big cutover PR is not small or reviewable, which goes against the charter (#13).

### C. Separate origin or subdomain (rejected)

Host KrunchOS on its own repository or subdomain. This isolates it but needs DNS and certificate work, which are out of scope and owner-gated, and it splits the brand. A separate Pages repository is still the right vehicle for an **isolated preview** (below), just not for production.

## Decision

Adopt **A, incremental mounting at `/os/`**, with relative asset base and hash routes. Defer any change to `/` until the owner explicitly accepts KrunchOS for the homepage (#40).

## Routing, 404 and reload

| Request | Behaviour on Pages | Verified by |
| --- | --- | --- |
| `/`, `/tracing-guatemala/`, `/tracing-guatemala/demo/`, `/tracing-guatemala/privacy/` | 200, unchanged bytes | `pages_poc.py verify`, both bases |
| `/tracing-guatemala` (no slash) | 301 to slash form | PoC server and the live site |
| `/os/` and `/os/#/<app>` (cold load and reload) | 200 `os/index.html`; the app resolves from the hash | PoC `verify` and the browser check |
| `/os/#/nope`, `/os/#/terminal` (unknown or disabled) | Launcher with a status notice; the hash is cleared with `replaceState` | E2E `mobile.spec.ts` |
| `/os/workbench` (path-style) | 404. This is intentional and documents that there are no rewrites | PoC `verify` |
| Unknown path | 404. A future `404.html` must use absolute links built for its base, because it is served at any depth | PoC `assemble --base` |

Adding `404.html` to production changes today's 404 page, so it ships only with the cutover PR, not before.

## Deployment artifact allowlist

- The public allowlist stays in `scripts/build_site.py` and is **not** widened by this ADR.
- The future cutover PR adds exactly one entry, the `os/` directory, copied from `krunchos/dist/` only after `npm run check` passes. That includes `check:dist` (#17): allowlisted file types only, no source maps, relative URLs only, and a privacy denylist for the private host, LAN addresses, Live ports and key material.
- The private Tracing Guatemala application is in another repository and is never an input. The denylist fails the build if its host name or LAN addresses ever appear.
- The artifact is deterministic. `pages_poc.py manifest` prints sorted paths, sizes and SHA-256 values, plus a combined hash. Two runs on the same commit give the same hash.

## Cache behaviour

Pages fixes `max-age=600` for every file, so after a deploy visitors can see a mix of old and new files for up to 10 minutes:

- Vite fingerprints JS and CSS file names. A new `index.html` never loads old bundles.
- A **cached old `os/index.html`** can request bundle names that the new deploy removed, and those return 404 for up to 10 minutes. Mitigation for the cutover: keep the previous release's `os/assets/*` in the artifact for one release, which is cheap because bundles are about 80 kB gzip. Otherwise accept a 10-minute window, during which a reload fixes it.
- The static pages are small and unversioned. A 10-minute staleness is acceptable and is already the case today.

## Rollback

Rollback is **removing the `os/` entry and redeploying**, by reverting the cutover commit and letting `pages.yml` run, or by re-running the last good `pages.yml` deploy from the Actions tab. `pages_poc.py rollback-check` proves that the artifact without the mount is byte-identical to today's `build_site.py` output. Rollback is therefore exact, and it never touches DNS, TLS or Cloudflare. Allow up to 10 minutes for caches.

## Isolated preview (before any production change)

Production `krunchymonkey-site` Pages serves only at `krunchymonkey.dev`, so an owner-reviewable hosted preview needs a **separate, owner-created preview repository** (for example `krunchyMonkey/krunchos-preview`). Its Pages site serves at `https://krunchymonkey.github.io/krunchos-preview/`, which is a project-path base. The relative build exists for exactly this case. The procedure is in the release-readiness report on the PR. Every step is owner-authorised, and none touches this repository's Pages settings or DNS.

## Consequences

- KrunchOS app URLs carry `#/…` until a later release. Moving to path routes later would need per-app `index.html` stubs, which the registry `route` field already supports.
- The homepage and Tracing Guatemala pages keep working without JavaScript.
- The stack (#47…) branched before `/tracing-guatemala/demo/` landed on `main` (#52–#54). It needs a rebase onto `main` before integration. The PoC runs against `main`'s 8-file allowlist.

## Proof of concept

`scripts/pages_poc.py`, its tests and `.github/workflows/pages-migration-poc.yml` reproduce Pages semantics on `127.0.0.1:4318`: no rewrites, a 301 for a missing slash, a 404 that serves `404.html`, and `max-age=600`. The workflow only reads and never deploys.

Results on 2026-11-07, with the real KrunchOS build (relative base, hash routes; stack top `chore/krunchos-dist-check`) mounted at `os/`:

| Check | `/` (custom domain) | `/krunchymonkey-site/` (project path) |
| --- | --- | --- |
| `verify`: 4 public pages, every relative asset, the slash 301, the 404 page and its links, `os/` and its assets, `os/workbench` 404 | 65/65 pass | 66/66 pass |
| `rollback-check`: everything except `os/` is byte-identical to `build_site.py` plus `404.html` | pass | pass |
| Browser, Chromium (Pixel 7) and WebKit (iPhone 13): cold load `os/#/workbench`, reload, in-app Back stays in KrunchOS, browser Back, Forward, unknown route falls back, no 4xx, no external requests | 18/18 pass | 18/18 pass |
| `python3 -m unittest scripts/test_pages_poc.py` | 7/7 pass | |

The manifest of the assembled `/` artifact has combined SHA-256 `0d3ed122…2e9028` and is identical across runs. Reproduce it with:

```sh
python3 scripts/pages_poc.py assemble --out /tmp/site --krunchos-dist krunchos/dist --mount os --base /
python3 scripts/pages_poc.py verify /tmp/site --prefix / --mount os
python3 scripts/pages_poc.py assemble --out /tmp/site-public --base /
python3 scripts/pages_poc.py rollback-check --with /tmp/site --without /tmp/site-public --mount os
python3 scripts/pages_poc.py manifest /tmp/site
```

(In Git Bash on Windows, set `MSYS_NO_PATHCONV=1` so that `/` is not rewritten.)
