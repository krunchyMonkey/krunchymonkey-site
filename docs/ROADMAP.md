# KrunchyMonkey Site — delivery roadmap

**Repository:** `krunchyMonkey/krunchymonkey-site` (public)
**GitHub Project:** `KrunchyMonkey Site` (public)
**Target:** `https://krunchymonkey.dev` (GitHub Pages, Cloudflare-authoritative DNS)
**Private application:** `https://tg.krunchymonkey.dev` (LAN-only; **out of scope**)

## Release A — Pixel-parity foundation

- **KM-001** Freeze logo and visual tokens; commit source/baseline assets.
- **KM-002** Verify 1440px desktop homepage parity and core copy.
- **KM-003** Verify 390px mobile layout, navigation and accessibility.
- **KM-004** Validate public Tracing Guatemala product page and fictional-only preview.
- **KM-006** Validate baseline screenshots and add automated link/build checks.

**Gate:** Visual approval against reference screenshots; no secrets, private network info or real customer data.

## Release B — Publish public site

- **KM-007** GitHub Pages deployment workflow and preview URL.
- **KM-009** SEO, accessibility, performance and production-link review.
- **KM-008** Cloudflare apex DNS + GitHub Pages custom domain + HTTPS, only after preview approval.
- **KM-012** Launch verification and rollback runbook.

**Gate:** Public site works on both `www`/apex as chosen, trusted HTTPS, no `tg` record altered, no private application reachable over WAN. Public website doesn't require login.

## Release C — OAuth information readiness

- **KM-011** Select a real operator/privacy support contact and document actual data practices.
- **KM-005** Finalize Google-related privacy disclosure; owner reviews and approves copy.
- **KM-010** Align Google Auth Platform branding/homepage/privacy URLs with Tracing Guatemala app team's OAuth implementation.

**Gate:** Privacy policy accurately reflects delivered product; not submitted as draft to Google. OAuth remains implemented and tested in the **private Tracing Guatemala repo**, not the public static site.

## KrunchOS issue backlog — proposed milestones (repo issues created; milestones not yet assigned)

**Design direction:** KrunchOS turns the public personal portfolio into a simulated workstation: draggable desktop windows and folders on large screens, app launcher and full-screen app views on mobile, plus an allowlisted public-demo browser. It must remain a useful, accessible site, not just a novelty.

**Pixel-first v0.1 change request:** [KMOS-034 / #48](https://github.com/krunchyMonkey/krunchymonkey-site/issues/48) evaluates selective reuse of 8bitcn/ui, and [KMOS-035 / #49](https://github.com/krunchyMonkey/krunchymonkey-site/issues/49) prototypes it in [draft PR #50](https://github.com/krunchyMonkey/krunchymonkey-site/pull/50), stacked on v0.1 feature PR #47. Direction: pixel-first website, OS-inspired interaction rather than a mandatory desktop metaphor. Treat it as an experiment, **not** an approved redesign or release. The current public Pages deploy is unchanged.

**Code-craft contract:** [ENGINEERING_CHARTER.md](ENGINEERING_CHARTER.md) (proposed). New implementation must follow feature-first organization, a directory per reusable component with explicit `index.ts` exports, colocated tests, clean import boundaries, typed app contracts, and measurable quality gates. The component architecture/migration requires an ADR before framework changes.

| Proposed milestone | Scope | Gate |
|---|---|---|
| KrunchOS v0.1 — Foundations ([#14–#17](https://github.com/krunchyMonkey/krunchymonkey-site/issues?q=is%3Aissue+KMOS-), [#48](https://github.com/krunchyMonkey/krunchymonkey-site/issues/48), [#49](https://github.com/krunchyMonkey/krunchymonkey-site/issues/49)) | Desktop/mobile UX, ADR, typed registry, quality scaffolding, **optional 8bitcn/ui pixel-first change request** | Existing foundation stays intact; pixel-first variant evaluated in isolated PR and accepted only after owner review |
| KrunchOS v0.2 — Desktop (#18–#22) | Wallpaper, window lifecycle and dragging, dock, folder shortcuts, state persistence | Open, move, focus, minimize, close and reopen apps; keyboard tested |
| KrunchOS v0.3 — Mobile (#23–#26) | App launcher, full-screen views, mobile dock/back navigation, touch behavior | Phone experience verified without tiny draggable windows or trapped focus |
| KrunchOS v0.4 — Workbench (#27–#31) | Project catalog, README.me, build journal, architecture case studies and deep links | Real public content organized through the shared app model and direct links |
| KrunchOS v0.5 — Demo Browser (#32–#35, [#46](https://github.com/krunchyMonkey/krunchymonkey-site/issues/46)) | Retro browser frame, safe public-demo embeds, optional first-party presentation bridge, mobile fallback | Approved first-party demos run real workflows with native retro styling; unmanaged sites open externally; private app stays private |
| KrunchOS v1.0 — Public Launch (#36–#40) | Skippable boot, mascot motion, terminal, a11y/performance/security QA, release runbook | Accessible, secure, maintainable production rollout with rollback evidence |

**Dependencies:** v0.1 gates architecture and content contracts; desktop, mobile, and workbench may proceed in parallel thereafter. Browser integrates shell + catalog; v1.0 follows integration verification. Keep Releases A-C and their existing issue IDs untouched. The **27 scoped KrunchOS implementation issues** ([#14–#40](https://github.com/krunchyMonkey/krunchymonkey-site/issues?q=is%3Aissue+is%3Aopen+KMOS-)) were created on 2026-10-31, with per-issue criteria and dependencies. The **actual repository milestones and Project #9 field assignments remain to be set**; the proposed roadmap alone does not create them. Earlier issues #1–#12 remain open pending evidence and signoff.


**First-party application Browser (v0.5):** [KMOS-033 / #46](https://github.com/krunchyMonkey/krunchymonkey-site/issues/46) specifies the curated KrunchOS browser: only owner-approved public websites, each providing a **native pixel-era UI mode** while running actual application functionality. The standalone website remains modern. The host launches a trusted entry point in the appropriate presentation mode, using iframe embedding only if explicitly permitted. Initial integration may use a URL presentation hint; introduce cross-origin messaging only for genuinely necessary coordination. Unmanaged URLs never become arbitrary in-OS browsing destinations. The first complete demo must use separate fictional data and be verified end-to-end; the private Tracing Guatemala application remains inaccessible.

## Proposed v1.1 — Open Workshop (community contributions)

See [OPEN_WORKSHOP.md](OPEN_WORKSHOP.md) for the proposed community experience. The site should welcome engineers who enjoy the artistry of software. AI-assisted work is welcome when the author understands, owns, and can explain the result.

- **During v0.1:** agree on contribution philosophy, code/document licensing, excluded original brand assets, and safe external PR review.
- **During v0.4:** add a read-only Open Bench entry with curated first-party notes and engineering stories.
- **v1.1:** opt-in contributor attribution, contribution guide and templates, validated static craft-note submissions, maintainer review, and curated publication.
- **Later:** accept focused code contributions and community craft challenges within the engineering charter.

**Gate:** The public contribution path requires licensing clarity, branch protection, explicit maintainer approval, restricted CI, and non-executable validated site content. v1.1 is not a blocker for KrunchOS v1.0.

**Community issues created:** [#41–#45](https://github.com/krunchyMonkey/krunchymonkey-site/issues?q=is%3Aissue+KMOS-), covering licensing, contribution safety, validated Craft Notes, Open Bench gallery and pilot. Actual milestone/board assignment is pending.

## Repository milestone / Project #9 assignment

The original 32 groomed GitHub issues, optional presentation bridge #46, and pixel-first v0.1 change requests #48–#49 were created and groomed with focused acceptance criteria, verification expectations and dependency references. Because the connected GitHub integration does not expose GitHub Projects V2 mutation or milestone-creation tools, **they are not yet confirmed as Project #9 items or assigned to repository milestones**. After this documentation PR is reviewed/merged, run the idempotent local helper with authenticated GitHub CLI:

```powershell
pwsh -File .\\scripts\\setup-krunchos-planning.ps1 -WhatIf
pwsh -File .\\scripts\\setup-krunchos-planning.ps1
```

Requires `gh auth login` and `gh auth refresh -s project`. The helper creates/reuses seven repository milestones, assigns the 35 current issues (#14–#46, #48 and #49; #47 is a PR), adds them to Project #9, and populates a `KrunchOS Phase` project field. It does not merge, push, publish, or modify DNS. The original 12 issues are **not** reclassified or closed by the helper.

## Operating rules

- Every issue is independently testable and produces a small PR where code changes are needed.
- Use `Backlog → Ready → In Progress → Review → Done` in the `Workflow` GitHub Project field. `Priority` and `Release` fields give the launch pulse.
- Routine PRs may be merged after review and passing checks when authorized by repository policy; no auto-merge of domain changes or privacy statements without owner acceptance.
- Never assume an issue is complete because its code exists. Close only after its criteria have been verified.
- No secret token paths, research records, Caddy configuration or private-LAN access info in this repo.