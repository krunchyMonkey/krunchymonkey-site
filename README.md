# KrunchyMonkey — public site

A small, real, no-build static website based on the approved KrunchyMonkey mockup and the owner-supplied monkey logo. Designed for GitHub Pages at **`krunchymonkey.dev`**.

> **Status:** Release 1 design-parity baseline. The Tracing Guatemala privacy notice is a **draft** and cannot be used as an approved Google OAuth privacy policy until reviewed and updated.

## Preview

```bash
python -m http.server 8000
```

Open <http://localhost:8000/>. The site is plain HTML + CSS, so there is **no npm install, paid host, runtime service, API key, or database**.

## Page structure

| Route | Purpose | State |
|---|---|---|
| `/` | KrunchyMonkey studio homepage | Mockup baseline |
| `/tracing-guatemala/` | Public overview of the private research product | Mockup baseline |
| `/tracing-guatemala/privacy/` | Proposed privacy information | **Draft / review required** |

## Design contract

- `assets/krunchymonkey-logo-original.png` — the **exact uploaded source logo**, preserved unmodified.
- `assets/krunchymonkey-logo.webp` — optimized existing website logo.
- `assets/favicon.png` — original favicon from approved mockup.
- `assets/site.css` — visual implementation and color tokens.
- `docs/reference/*.png` — approved screenshots, used for visual parity checks.
- `scripts/capture_visuals.py` — optional Playwright screenshots/difference report (no flaky pixel CI gate).
- `docs/DESIGN_PARITY.md` — typography, sections, layout, and visual acceptance guidance.

**Never regenerate or replace the logo with AI-generated art** without explicit approval. Use the baseline screenshots as source of truth; do not silently redesign.

## Development and build

```bash
python scripts/check_site.py
python scripts/build_site.py
```

`build_site.py` creates a **seven-file allowlist-only** deployment artifact in `dist/`. Docs, original high-resolution assets, mockup screenshots, issues, and local files aren't deployed. This is deliberately separate from the private Tracing Guatemala repository.

## Create the GitHub repo + Project + issues

See [docs/GITHUB_BOOTSTRAP.md](docs/GITHUB_BOOTSTRAP.md). A local Windows PowerShell script handles creation, push, Project fields, and issue backlog using the authenticated GitHub CLI:

```powershell
pwsh -File .\scripts\bootstrap-github.ps1
```

**Requires:** Git, GitHub CLI (`gh`), GitHub authentication with the `project` scope, and permission to create repositories. The script is idempotent where practical and never force-pushes.

## GitHub Pages

A Pages Actions workflow is included in `.github/workflows/pages.yml`. After the repository is created:

1. Go to **Settings → Pages** and select **GitHub Actions** as the build/publish source.
2. Push to `main` or manually run the deployment workflow.
3. Verify the GitHub-hosted project URL first.
4. Only then configure the apex custom domain `krunchymonkey.dev` in Pages settings and Cloudflare DNS, as described in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

**Never** change public DNS or create an A/AAAA/CNAME for `tg.krunchymonkey.dev` as part of this repo. That hostname is reserved for the **private LAN** application. The public Pages site contains no research records, OAuth tokens, or Caddy credentials.

## Issues & phases

The ready-to-publish backlog is in `docs/issues/` and `docs/issue-backlog.json`. See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md), and the [copy-ready Claude kickoff prompt](docs/CLAUDE_KICKOFF_PROMPT.md).

## Licensing

The monkey mark and design assets belong to their owner. Public GitHub visibility **does not grant a license** to reuse the artwork, visual identity, or other site materials. Any future open-source licensing choice should explicitly exclude brand assets.