# KrunchOS v0.1 release evidence

Evidence for KMOS-004 (#17), recorded 2026-11-07. Nothing here is deployed. KrunchOS is not in the GitHub Pages allowlist (`scripts/build_site.py`).

## Brand tokens and example component

- `src/styles/tokens.css` defines the `--os-*` palette. The accent `--os-gold: #ffc13a` is the same value as the public site's `--gold` in `assets/site.css`.
- The monkey logo is the unmodified `assets/krunchymonkey-logo.webp`, imported by both shells and fingerprinted by Vite.
- The example reusable component is `src/components/PixelIcon/`. It has an explicit `index.ts`, owned SVG icons in `icons.ts` and the colocated `PixelIcon.test.tsx`.
- The pixel theme is scoped under `.pixel-os` (`src/app/PixelStudy/*.css`).
- Tradeoff: the shell layout CSS is still global, in `tokens.css`. Splitting it per component is deferred to avoid churning the approved visual baselines.

## CI parity

`npm ci && npm run check` reproduces the `preview-checks` job:

1. `typecheck`: the app and the E2E code.
2. `lint`: including the import-x layering and cycle rules.
3. `format:check`.
4. `test`.
5. `build`.
6. `check:dist`.

`npx playwright test` reproduces the `e2e` job. The Linux screenshots only match inside the pinned `mcr.microsoft.com/playwright:v1.64.1-noble` image, which only CI runs.

## Static public artifact check (`npm run check:dist`)

`scripts/check-dist.mjs` checks `dist/` and fails the build on any of the following:

- a file type that is not allowlisted, or a dotfile
- a source map or `sourceMappingURL`
- an absolute or external `src`, `href` or `url()`, or a reference that does not resolve inside `dist/`
- a privacy denylist match: the private host name, LAN and loopback addresses, Live ports 4190–4192, e-mail addresses, key material, `/api/`
- a gzip budget overrun: JS over 120 kB or CSS over 15 kB

There are no denylist exceptions. `--json <path>` writes a deterministic manifest (path, bytes, gzip bytes, SHA-256). CI uploads it as `krunchos-dist-manifest`.

## Bundle statistics

Measured on this branch (stack top, Vite 6.2.6, `base: "./"`):

| File                               | Raw                   | Gzip                              |
| ---------------------------------- | --------------------- | --------------------------------- |
| `assets/index-*.js`                | 248.0 kB              | 77.0 kB                           |
| `assets/index-*.css`               | 29.3 kB               | 7.1 kB                            |
| `assets/krunchymonkey-logo-*.webp` | 19.9 kB               | (already compressed)              |
| `index.html`                       | 0.6 kB                | 0.4 kB                            |
| **Total**                          | **297.7 kB, 4 files** | JS 77.0 / 120 kB, CSS 7.1 / 15 kB |

The #50 baseline was 240.5 kB JS (75.5 kB gzip) and 29.1 kB CSS (7.1 kB gzip). The registry, history and check work adds about 1.5 kB of gzip JS.

## Screenshot evidence

There are 7 Linux baselines in `e2e/__screenshots__/linux/`, compared at `maxDiffPixels: 0`:

| Baseline                                                                                                                               | Status                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| desktop-chromium: `desktop-boot`, `workbench-focused`, `overlap-workbench-raised`, `overlap-open-bench-raised`, `8bitcn-project-cards` | Approved by the owner in #55. **Replaced by candidates in #63 (PixelIcon SVGs), pending owner review.** |
| mobile-chromium: `mobile-launcher`                                                                                                     | Approved in #55. **Candidate in #63, pending owner review.**                                            |
| mobile-chromium: `mobile-workbench`                                                                                                    | Approved in #55. **Candidates in #62 (44px Back) and then #63, pending owner review.**                  |

Candidates come only from the `krunchos-snapshots` label flow. No baseline is accepted without owner review.

## Rollback evidence

- KrunchOS is not published, so today there is nothing to roll back, and the public artifact is unchanged.
- The migration plan (ADR-0002, #15 / PR #66) mounts KrunchOS as a single `os/` directory. `scripts/pages_poc.py rollback-check` proves that removing that directory leaves the public files byte-identical to today's `build_site.py` output, under both the `/` and `/krunchymonkey-site/` bases.
- Rollback is therefore a revert-and-redeploy of one directory. It touches no DNS, TLS or Cloudflare setting, and caches clear within Pages' fixed 10-minute `max-age`.

## Remaining release constraints

- The owner must review the candidate baselines from #62 and #63.
- The stack (#47…) branched before `/tracing-guatemala/demo/` landed on `main`, so it needs a rebase onto `main` before integration.
- The cutover PR must add exactly one allowlist entry (`os/`), and only with explicit owner authorisation (#40).
- The full #24 v0.3 criteria remain open: the GitHub Pages preview reload and the apex reload still need verifying on a real host.
