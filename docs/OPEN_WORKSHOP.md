# The Open Workshop — community contributions (proposal)

> **Status:** Product and governance proposal only. No public contribution intake, execution, gallery, or approval automation exists yet.

## Why it exists

**Order beneath the chaos.** KrunchOS should give curious engineers a place to practice craftsmanship for its own sake, share thoughtful improvements, and enjoy the process of making software. The site began with AI-assisted development; that origin is part of its story, not something to conceal. Contributions may be hand-written, AI-assisted, or mixed. The standard is **intentional engineering, not keystroke provenance**.

The site is KK's personal workstation, not a generic crowdsourced homepage. Contributions should enrich the workshop while preserving its identity, maintainability, accessibility, and privacy.

**Product metaphor:** an **Open Bench** inside the Workbench app, with a **Contribute** shortcut in the desktop/mobile launcher. Visitors can inspect curated improvements and optionally visit the GitHub pull request that explains the craft behind each one.

## Two ways to contribute

1. **Improve the workstation (code PR):** a focused feature, refactor, interaction, test, performance/accessibility improvement, documentation, or architecture diagram. Review the intent and maintainability, not only whether it runs.
2. **Share a craft note (content PR):** a concise case study or engineering experiment with a public repository/demo, tradeoffs, and lessons learned. Approved entries appear as curated content on the website without running arbitrary submitted code.

Start with the second path because a static content pipeline is safer and easier to curate. Open implementation contributions incrementally after the architecture and quality gates are established.

## Public submission journey

1. In KrunchOS, visitor opens **Workbench > Open Bench > Contribute**, which links to GitHub's contribution guide and issue/PR templates.
2. Contributor selects a small task or proposes an idea, then submits a PR against the public repository. No website account or login beyond GitHub is required.
3. CI validates the submission in a restricted context. Maintainers review design, ownership/licensing, privacy, test evidence, and architectural fit.
4. Accepted PRs are merged **only with explicit maintainer authorization**; deployment remains governed by repository protections. A content change is not automatically accepted merely because checks pass.
5. Curated entries appear as a new app item or a featured note in Open Bench, with optional contributor attribution, public PR/source links, and an explanation of what improved.

Declined submissions get respectful, specific feedback; there is no entitlement to publication or merge. Never claim an entry is live until deployment is verified.

## What a submission should explain

For code:
- What problem did you notice? Who benefits?
- Why this design instead of the obvious alternatives?
- Which modules/boundaries changed? What became simpler or more reusable?
- How was it tested (including keyboard/mobile if UI)?
- What are the tradeoffs, known limitations, and screenshots/evidence where relevant?

For a craft note:
- Title and short summary; an optional public GitHub handle or chosen display name.
- Original idea, design constraints, and deliberate decisions.
- Public source or demo link where applicable; what to notice in the details.
- One lesson learned, not generic self-promotion.

Do not demand disclosure of which lines were AI-written. Authors take responsibility for understanding, licensing, security, and correctness of all submitted work.

## How it appears in KrunchOS

**Open Bench** app:
- **Featured Work** — a small collection of approved artifacts and experiments.
- **What Changed** — a plain-English technical changelog tied to merged PRs and before/after evidence.
- **Contribute** — contribution guide, `good first issue` links, and narrowly scoped craft challenges.
- **Under the Hood** — diagrams and ADRs revealing the architecture of KrunchOS itself.

Keep attribution opt-in and editable before publication. No public rankings, follower counts, or competitive leaderboards. Craft is the point, not engagement farming.

## Security, licensing, and editorial boundaries

- **Resolve licensing before accepting external contributions.** The current repository is publicly readable but has no general open-source license; publishing source does not grant contribution/reuse rights. Propose an explicit code/docs license plus a clear exclusion or separate license for the original monkey brand artwork; include contributor terms and ownership expectations.
- Use GitHub's normal review and branch-protection flow; add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, PR/issue templates, and `CODEOWNERS` as appropriate to the size of the community. Keep maintenance sustainable.
- Two human-facing review requirements: technical quality/maintainability and publication/brand fit. They may be handled by the same maintainer; do not introduce unnecessary approval bureaucracy.
- For content PRs, validate schema, asset size, link destinations, and permitted formats; render escaped/sanitized Markdown. Reject arbitrary user-supplied HTML, JavaScript, iframe URLs, remote script tags, executable demos, or unreviewed assets.
- Do not execute untrusted PR code with credentials or deploy rights. Prefer read-only, least-privilege CI for forked PRs; never combine untrusted PR checkout with privileged `pull_request_target` workflow execution.
- Demo links are not automatically embeddable; allowlist approved public origins and provide external navigation fallback. Private `tg.krunchymonkey.dev`, real client records, credentials, internal infrastructure details, and personal data remain strictly excluded.
- Provide a clear reporting/removal path for unsafe, infringing, or privacy-sensitive contributions. Review attribution and permissions before featuring third-party work.

## Proposed rollout (not a v1.0 blocker)

| Stage | Deliverable | Acceptance |
|---|---|---|
| Foundation — alongside v0.1 | Record contribution principles, licensing decision/ADR, ownership boundaries | Reviewed policy; no open intake before license and review guidance |
| Read-only preview — alongside v0.4 | Open Bench entry point and curated first-party craft notes | Mobile/desktop accessible, direct links, static builds |
| Open Workshop v1.1 | Contribution templates, validated static content pipeline, maintainer review, opt-in attribution | External content PR can be reviewed and safely published; rejected PR cannot deploy |
| Later | Community implementation improvements, curated craft challenges, long-running changelog | Existing architecture/quality gates remain enforced; contributor workflow stays low-friction |

Do not create GitHub milestones or issues from this proposal without a separate planning step. Preserve all existing releases A–C and the existing KrunchOS milestones.

## Measure the right things

Prefer signals such as useful merged improvements, review turnaround, test reliability, accessibility, maintainability, clarity of ADRs, and sustained contributor enjoyment. Avoid vanity metrics, rigid test-coverage targets, or rewarding large PRs.

**Tagline:** *A workshop for the things engineers build because they care.*
