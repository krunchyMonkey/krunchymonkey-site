# KrunchOS v0.1 — isolated local preview

**Not deployed.** This is a stand-alone preview living under `krunchos/`; the existing GitHub Pages site, its HTML/CSS pages, and its seven-file deployment allowlist are unchanged.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
git checkout feat/krunchos-v01-foundations
cd krunchos
npm ci
npm run dev
```

Open the URL printed by Vite (usually **http://localhost:5173/**). The server binds to localhost only.

Run checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium webkit   # once
npm run test:e2e                         # Playwright E2E + visual regression on 127.0.0.1:4317
```

See [docs/E2E_TESTING.md](docs/E2E_TESTING.md) for the browser matrix, screenshot baseline process and triage.

Nothing in these commands deploys the preview. A generated `dist/` in this folder is a local build artifact only.

## v0.1 scope

- Typed single application registry, shared by responsive desktop and mobile.
- Retro design tokens and first-party brand logo **imported from the repository's original asset**, never regenerated.
- A minimal draggable desktop window with open/focus/minimize/close plus a Workbench and Open Bench experience.
- A mobile launcher with full-screen app navigation.
- Unfinished apps are honest placeholders with linked release context.
- Unit and component tests, TypeScript strictness, ESLint, Prettier, and a PR-only GitHub Actions validation workflow.
- Architecture and migration decisions in `docs/ADR-0001.md`.

This is an early vertical slice, not the final mockup-parity build. Polished window resizing, desktop persistence, mobile history handling, embedded public demos, and community submissions remain in their later milestones.

## Privacy and release boundary

No client records, customer data, remote backend, authentication, or private Tracing Guatemala application is included. Public demo content is fictional or explicitly marked conceptual.

The normal site remains the seven allowlisted static files generated from the repo root. Do **not** add `krunchos/dist` or this preview to `scripts/build_site.py`, modify Pages workflows, or merge into `main` without explicit owner approval and updated acceptance evidence.

## Deployment decision

A future reviewed release PR must decide how the new Vite build replaces the homepage without changing the public Tracing Guatemala overview/privacy routes or existing custom-domain behavior. This v0.1 PR intentionally makes no such change.
