# Claude Code handoff — KrunchyMonkey public site

**Goal:** Match the approved site mockup **1:1**, deploy to free GitHub Pages, and support a future public-facing Google OAuth information footprint without exposing the private Tracing Guatemala application.

## Read first

- `README.md`, `docs/DESIGN_PARITY.md`, `docs/ROADMAP.md`, `docs/DEPLOYMENT.md`
- `docs/reference/*.png` (golden review images)
- `index.html`, `assets/site.css`, `tracing-guatemala/index.html`, `tracing-guatemala/privacy/index.html`
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

## What constitutes completion

Matching screenshots, passing tests, passing GitHub Actions, a real public preview URL and reviewed privacy/documentation contents. DNS cutover and Google OAuth verification are separate gates; do not auto-approve them.
## Proposed next evolution: KrunchOS (not yet implemented)

- Read [`docs/ENGINEERING_CHARTER.md`](ENGINEERING_CHARTER.md) and the proposed KrunchOS milestone table in [`docs/ROADMAP.md`](ROADMAP.md) before implementing redesign work.
- The intended product is a personal-workshop OS UI: draggable windows, dock, folders, project explorer, journal, schematics, and allowlisted public demo browser; on mobile it becomes a touch-first app launcher with full-screen apps.
- Code quality is part of the public portfolio: feature-first structure, one folder per reusable component, component-level `index.ts` exports, explicitly curated feature exports, colocated tests, strict TypeScript, modular state and narrow browser adapters, reviewed ADRs, and automated quality gates.
- The current project is still no-build static HTML/CSS. A React/TypeScript/Vite migration is a **proposal** subject to a focused architecture ADR and reviewed PR; do not change tooling or the deployed page as an incidental cleanup.
- Preserve current approved logo/brand identity, existing informational/privacy routes, static GitHub Pages deployment, and the strict boundary from private `tg.krunchymonkey.dev` and real research data.
- Stage the work as small independently tested PRs; include desktop/mobile visual evidence, integration/accessibility checks, and rollback awareness. No auto-merging or assumptions that the existing 12 issues are complete.


## Proposed Open Workshop community direction

- Read [`docs/OPEN_WORKSHOP.md`](OPEN_WORKSHOP.md) for the planned contribution journey. KrunchOS is a curated creative space for software craftsmanship, not an unmoderated code-sharing platform.
- The site began with AI assistance. Human-written and AI-assisted contributions are held to the same standards of understanding, architectural intent, correctness, and maintainability.
- Establish licensing, brand-asset exclusions, and safe PR review during Foundations. Introduce read-only first-party craft notes during Workbench. External contributions and a curated gallery belong to a **proposed v1.1 milestone**, not v1.0.
- Never expose private research data. Do not enable automatic third-party publishing, merges, or privileged CI execution of unreviewed changes. Preserve opt-in attribution and a maintainer review path.


## Self-documenting code rule for KrunchOS

- Favor understandable names, typed contracts, small functions, clear component boundaries, and colocated behavior tests. The code should explain what it does without narration.
- Do not generate redundant inline comments, decorative section headers, routine JSDoc, or boilerplate prose around implementation.
- Keep rare short comments when they explain a non-obvious **why** (browser workaround, security invariant, external constraint, tradeoff). Prefer improving the design first.
- Keep architectural decisions and public contributor/onboarding guidance outside implementation in focused ADRs, README files, or docs. Do not confuse sparse source comments with no documentation.
- Retain required copyright/license notices and technical tool directives. Do not optimize for a comment-count metric.

## Groomed KrunchOS backlog and board assignment

- The 32 planned KrunchOS issues were created as `KMOS-001` through `KMOS-032` (GitHub issues #14–#45), with scoped acceptance criteria and dependencies. Consult the [roadmap](ROADMAP.md), rather than inventing more tickets for the same scope.
- Repository milestones and Project #9 assignments are not yet verified. The idempotent `scripts/setup-krunchos-planning.ps1` helper assigns existing issues to seven milestones and the project board when run by an authorized GitHub CLI user. Preview with `-WhatIf`; it does not close or modify original issues.
- Original issues #1–#12 remain open pending actual release acceptance; #1, #7 and #8 contain earlier evidence comments; #2–#6 and #9–#12 contain audit notes. Don't close any without checking its specific outstanding validation/approval.

## Curated Browser and first-party KrunchOS presentation

- [KMOS-033](https://github.com/krunchyMonkey/krunchymonkey-site/issues/46) is a curated browser for **fully working first-party public demos**, not a screenshot gallery or unrestricted browser.
- Approved public demo sites we control are expected to implement a pixel-era KrunchOS mode natively. The same application remains available in its normal standalone appearance with shared behavior and data model.
- Initial integration uses an allowlisted HTTPS entry point and a non-security URL presentation hint. Only add exact-origin/source-validated `postMessage` when two-way communication is required.
- Run an actual fictional-data multistep workflow in the demo as an acceptance test. Keep any mock external integrations honestly labeled; do not leak private research data or integrate directly with private `tg.krunchymonkey.dev`.
- Restrict host navigation to trusted configured sites. Cross-origin iframe navigation cannot be treated as fully controlled by the parent; the demo must cooperate with external-link policy. If an embed fails, offer a clear external fallback.
- Keep apps independently deployed and testable. Prefer simple, typed presentation contracts over a runtime CSS injector or privileged proxy.
