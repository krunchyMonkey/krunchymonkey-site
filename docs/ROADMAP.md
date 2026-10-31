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

## Operating rules

- Every issue is independently testable and produces a small PR where code changes are needed.
- Use `Backlog → Ready → In Progress → Review → Done` in the `Workflow` GitHub Project field. `Priority` and `Release` fields give the launch pulse.
- Routine PRs may be merged after review and passing checks when authorized by repository policy; no auto-merge of domain changes or privacy statements without owner acceptance.
- Never assume an issue is complete because its code exists. Close only after its criteria have been verified.
- No secret token paths, research records, Caddy configuration or private-LAN access info in this repo.