# Design change request — 8bitcn/ui pixel-first experiment

**Issues:** KMOS-034 (#48), KMOS-035 (#49)
**Phase:** v0.1 Foundations
**Status:** Experimental / not adopted / not deployed.
**Branch:** \`experiment/krunchos-v01-8bitcn-ui\` based on \`feat/krunchos-v01-foundations\`.

## Product hypothesis

A **pixel-first website** with optional desktop motifs is a stronger visual identity than requiring every route to behave like an operating system. The OS still makes opening first-party public apps fun. Its website, desktop, and mobile share the same real interfaces and reusable design tokens.

## Scope of this spike

- Keep the existing v0.1 desktop preview untouched at \`/\`.
- Add a **separate route variant**, \`/?preview=8bitcn\`, with a pixel-first landing page, Workbench project inspector, public Research project details, and Open Bench story.
- Pilot real upstream-adapted MIT 8bitcn/ui Button and Card source. Local shadcn adapters provide only the supported subset. Compare with existing plain CSS for maintainability.
- Use Tailwind utilities **without globally importing Preflight/reset**, reducing risk of breaking the preexisting OS CSS.
- Reuse original logo from \`assets/krunchymonkey-logo.webp\`; no copied concept screenshots, fictional user metrics, private genealogy data, or remote APIs.
- Show **actual interactive selection and navigation**, not fake application activity. Fully functional first-party demos remain a later v0.5 deliverable.
- No network font dependency; use an intentionally ordinary local monospace fallback. A licensed self-hosted pixel font may be evaluated later.

## Evaluation matrix

| Criterion | What to inspect |
|---|---|
| Visual | Screen captures at 1440px desktop and 390px mobile; layout, color, feel vs approved mockups |
| UX | Keyboard tab/focus, touch targets, readability and content clarity |
| Engineering | Component source ownership, strict types, API clarity, test complexity |
| Toolchain | Added Tailwind + Radix/shadcn dependency surface, bundle size and update path |
| Security | First-party content only; no private app or new deployment |
| Reversibility | Remove \`?preview=8bitcn\` feature, vendor components, and Tailwind plugin; baseline remains unchanged |

## Recommendation criteria

Adopt selectively **only if** the interactive pixel study is visibly closer to owner-approved references, works on both viewports, and the maintenance overhead is justified. Do not migrate existing project logic or private Tracing Guatemala UI as part of this experiment.

The study's PR should target the **v0.1 feature branch**, not \`main\`. Review, merge and deployment remain explicit owner decisions.
