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

## Proposed KrunchOS milestones — next evolution (not yet created in GitHub)

**Design direction:** KrunchOS turns the public personal portfolio into a simulated workstation: draggable desktop windows and folders on large screens, app launcher and full-screen app views on mobile, plus an allowlisted public-demo browser. It must remain a useful, accessible site, not just a novelty.

**Code-craft contract:** [ENGINEERING_CHARTER.md](ENGINEERING_CHARTER.md) (proposed). New implementation must follow feature-first organization, a directory per reusable component with explicit `index.ts` exports, colocated tests, clean import boundaries, typed app contracts, and measurable quality gates. The component architecture/migration requires an ADR before framework changes.

| Proposed milestone | Scope | Gate |
|---|---|---|
| KrunchOS v0.1 — Foundations | Desktop/mobile UX, ADR for frontend migration and routing, typed app registry, design tokens and quality scaffolding | Reviewed UX + architecture; static preview and baseline checks pass |
| KrunchOS v0.2 — Desktop | Wallpaper, window lifecycle and dragging, dock, folder shortcuts, state persistence | Open, move, focus, minimize, close and reopen apps; keyboard tested |
| KrunchOS v0.3 — Mobile | App launcher, full-screen views, mobile dock/back navigation, touch behavior | Phone experience verified without tiny draggable windows or trapped focus |
| KrunchOS v0.4 — Workbench | Project catalog, README.me, build journal, architecture case studies and deep links | Real public content organized through the shared app model and direct links |
| KrunchOS v0.5 — Demo Browser | Embedded-demo browser shell, origin allowlist, blocked-frame fallback, mobile view | Fictional public demos work or safely open externally; private app stays private |
| KrunchOS v1.0 — Public Launch | Skippable boot, mascot motion, terminal, a11y/performance/security QA, release runbook | Accessible, secure, maintainable production rollout with rollback evidence |

**Dependencies:** v0.1 gates architecture and content contracts; desktop, mobile, and workbench may proceed in parallel thereafter. Browser integrates shell + catalog; v1.0 follows integration verification. Keep Releases A-C and their existing issue IDs untouched. These milestones/issues are a design proposal, **not** a claim they exist on GitHub or that earlier issues are finished.

## Proposed v1.1 — Open Workshop (community contributions)

See [OPEN_WORKSHOP.md](OPEN_WORKSHOP.md) for the proposed community experience. The site should welcome engineers who enjoy the artistry of software. AI-assisted work is welcome when the author understands, owns, and can explain the result.

- **During v0.1:** agree on contribution philosophy, code/document licensing, excluded original brand assets, and safe external PR review.
- **During v0.4:** add a read-only Open Bench entry with curated first-party notes and engineering stories.
- **v1.1:** opt-in contributor attribution, contribution guide and templates, validated static craft-note submissions, maintainer review, and curated publication.
- **Later:** accept focused code contributions and community craft challenges within the engineering charter.

**Gate:** The public contribution path requires licensing clarity, branch protection, explicit maintainer approval, restricted CI, and non-executable validated site content. v1.1 is not a blocker for KrunchOS v1.0.

## Operating rules

- Every issue is independently testable and produces a small PR where code changes are needed.
- Use `Backlog → Ready → In Progress → Review → Done` in the `Workflow` GitHub Project field. `Priority` and `Release` fields give the launch pulse.
- Routine PRs may be merged after review and passing checks when authorized by repository policy; no auto-merge of domain changes or privacy statements without owner acceptance.
- Never assume an issue is complete because its code exists. Close only after its criteria have been verified.
- No secret token paths, research records, Caddy configuration or private-LAN access info in this repo.