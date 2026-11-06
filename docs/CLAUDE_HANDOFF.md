# Claude Code handoff — KrunchyMonkey public site

**Goal:** Match the approved site mockup **1:1**, deploy to free GitHub Pages, and support a future public-facing Google OAuth information footprint without exposing the private Tracing Guatemala application.

## Read first

- `README.md`, `docs/DESIGN_PARITY.md`, `docs/ROADMAP.md`, `docs/DEPLOYMENT.md`
- `docs/reference/*.png` (golden review images)
- `index.html`, `assets/site.css`, `tracing-guatemala/index.html`, `tracing-guatemala/demo/index.html`, `tracing-guatemala/privacy/index.html`
- Current GitHub Issues `[KM-001]` through `[KM-012]`; inspect open PRs and branch status first.

## Technical direction

- Preserve the no-build HTML/CSS approach until complexity justifies a migration. Do not introduce React/Next.js or a server simply to host three static pages.
- The actual uploaded brand logo is `assets/krunchymonkey-logo-original.png`; compressed WebP and favicon variants are approved. Do not replace them with generated approximations.
- Keep site paths relative so `https://krunchymonkey.github.io/krunchymonkey-site/` works before DNS cutover.
- GitHub Actions runs `scripts/check_site.py`, creates an allowlist-only `dist/` with `scripts/build_site.py`, and publishes that artifact.
- The screenshot baseline and design tokens are contractual. Follow the design exactly unless an intentional change is approved in a PR with visual evidence.
- Every PR includes desktop (1440px) and mobile (390px) evidence when visual code changes.
- Keep PRs focused; prioritize Release A, then Release B; Release C requires owner inputs.
- Close issues only after verifying tests and real deployment evidence. Do not claim deployment or policy approval from local tests alone.

## Privacy and security rules

- Public pages contain no customer or family-history records. The featured research UI is entirely fictional.
- No secrets, Cloudflare token paths, DNS automation credentials, internal IP addresses, app endpoints behind the LAN, or host configuration in this repo.
- This site is public information only: no backend, authentication implementation, SQLite, or user uploads.
- Privacy notice is explicitly **draft** until owner/legal/product review confirms actual scopes, operators, retention, deletion, contact information and environment.
- Google login belongs in `tracing-guatemala-desktop`; it requires separate app authorization and approved Google identities. The public site may provide branding/info URLs but is NOT an OAuth redirect proxy or credential handler.
- `tg.krunchymonkey.dev` stays on private DNS. The public apex alone may point to GitHub Pages after owner approval.

## Public demo entry route

- `/tracing-guatemala/demo/` is the branded entry page for the separate, fictional-only Tracing Guatemala demo. It must not route to private Live, use client records, or host the demo's backend.
- **LIVE since 2026-11-06 (PR #53).** The page links **Launch Interactive Demo** to the verified standalone demo `https://krunchymonkey.github.io/tracing-guatemala-desktop/`. That demo is published by the owner-approved Tracing Guatemala Pages workflow ([#192](https://github.com/krunchyMonkey/tracing-guatemala-desktop/issues/192)); first release `005b943`.
- `scripts/check_site.py` rejects any `tg.krunchymonkey.dev` link, and any external link on the demo page other than that exact URL. Never infer the destination from user-controlled parameters, and do not iframe the private site.
- To take the demo offline, unpublish it in the Tracing Guatemala repo (see its `docs/operations/public-demo-pages.md`), then restore the Coming soon copy here.
- The public website must not share sessions, cookies, resources or identity endpoints with the private research workspace. Do not change Cloudflare or the private `tg` DNS record for this feature.

## What constitutes completion

Matching screenshots, passing tests, passing GitHub Actions, a real public preview URL and reviewed privacy/documentation contents. DNS cutover and Google OAuth verification are separate gates; do not auto-approve them.