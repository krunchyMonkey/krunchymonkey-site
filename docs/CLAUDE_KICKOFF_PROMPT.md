# Copy-ready Claude Code kickoff prompt (after GitHub bootstrap)

We're starting the separate public website project `krunchyMonkey/krunchymonkey-site` with GitHub Project **KrunchyMonkey Site**.

This repository already includes the **approved KrunchyMonkey mockup source files** and exact original monkey logo. The goal is to preserve a **1:1 implementation**, not to reinterpret the design or rebuild it with a new framework.

Before writing code:
1. Inspect `README.md`, `docs/CLAUDE_HANDOFF.md`, `docs/DESIGN_PARITY.md`, `docs/ROADMAP.md`, and `docs/DEPLOYMENT.md`.
2. Review all GitHub issues `[KM-001]` through `[KM-012]`, current GitHub Project fields, branches, active PRs and test workflows.
3. Inspect the existing HTML/CSS, optimized logo, source logo and baseline screenshots under `docs/reference/`.
4. Confirm the repository is public, while Tracing Guatemala's actual LAN-only application remains a completely separate repository/deployment.

Implementation instructions:
- Start with the first unblocked **Release A** issue. Finish issues in dependency order, using small, testable PRs and visual reference evidence.
- Run `python scripts/check_site.py` and `python scripts/build_site.py` before opening PRs. Run desktop 1440px and mobile 390px visual reviews for design changes.
- Preserve approved visual layout, responsive behavior, typography, colors, copy, original logo and favicon. Do not add a framework or new design without a documented reason and approval.
- Keep the project board, issues, and `docs/CLAUDE_HANDOFF.md` current with verified evidence. Close only genuinely completed issues.
- Merge routine implementation PRs once tests and review pass, according to the project's authorization policy; never merge a privacy-policy approval or public DNS cutover without explicit owner acceptance.
- Deploy the website to GitHub Pages preview first; configure custom `krunchymonkey.dev` DNS only after explicit owner approval.
- **Never** publish real genealogy/client data, any API tokens or secrets, private internal IPs, or the `tg.krunchymonkey.dev` private application to GitHub Pages. The public privacy notice is a DRAFT until the actual Google Auth Platform and application data practices are verified and owner-approved.

Report the exact issue you start, the branch you use, and the expected acceptance-test evidence. Continue with the next unblocked issue after completing a verified PR.