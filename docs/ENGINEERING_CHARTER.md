# KrunchOS engineering charter (proposed)

> **Status:** Proposed architecture direction for the KrunchOS redesign. This document does not authorize an unreviewed framework migration or change the currently deployed HTML/CSS website.

## North star

**Playful on the surface. Disciplined under the hood.**

KrunchyMonkey is both a personal workshop and a public engineering portfolio. The interface should reveal curiosity, personality, and craft; the repository should demonstrate the habits of an engineer who cares what happens after the demo.

The goal is not to maximize abstraction or lines of code. It is to make every decision understandable, reversible, testable, and maintainable.

## Order beneath the chaos: the open workshop

The visual experience may be quirky and unconventional. The implementation should demonstrate deliberate architecture, clean boundaries, and care for maintainability.

KrunchOS began with AI-assisted development. That origin is part of the story, not something to conceal. AI changes the tools, but engineers still own design judgments, tradeoffs, verification, and what they ship. Review contributions for understandable intent and useful craftsmanship, not whether individual lines were produced by hand.

We also want to offer a curated creative outlet for developers. A contributor can improve the workstation itself or submit a short engineering craft note for the public workbench. Nothing is automatically published or merged. See [OPEN_WORKSHOP.md](OPEN_WORKSHOP.md) for the proposed reviewer workflow, contributor experience, and licensing prerequisites.

## Retro shell, modern capabilities

The workstation borrows the clarity, structure, and tactile appeal of early graphical computers: restrained color, crisp geometry, recognizable windows, simple menus, and a useful terminal. These are intentional **presentation choices**, not an excuse to recreate old usability limitations. Modern mouse, touch, keyboard, browser history, focus management, responsive layouts, and accessibility remain first-class.

**A host should not dictate a guest's identity.** The Demo Browser provides a recognizable KrunchOS frame. Approved **first-party public demos we control** may *opt in* to a small, versioned presentation contract to hide duplicate site chrome, use compact navigation, or adapt a theme when embedded. Their standalone experience and core application behavior stay independent. Third-party and non-participating sites show a neutral preview/external-link option instead; they never need a retro skin.

Cross-origin cooperation is an explicit, least-privilege interface: typed messages; exact allowlisted origins and sources; schema/version checking; handshake timeout and safe fallback. Presentation hints are not authentication, and the host must never assume it can read or rewrite an iframe's DOM. Do not transport credentials, account state, private research data, or privileged actions. A separately hosted fictional-data demo is the only eligible Tracing Guatemala integration; the private LAN application is not.

This direction is tracked in [KMOS-033](https://github.com/krunchyMonkey/krunchymonkey-site/issues/46) (planned for v0.5), building on the safe embed work in [KMOS-020](https://github.com/krunchyMonkey/krunchymonkey-site/issues/33).

## Principles (non-negotiable for new KrunchOS implementation)

1. **Feature-first organization.** Group related UI, state, tests, and domain concepts by capability instead of accumulating a global `components/` or `utils/` junk drawer.
2. **Component ownership.** Give each reusable React component its own named directory with its implementation, colocated unit/component tests, and styles where applicable.
3. **Explicit public APIs.** Each component directory exports from `index.ts`; each feature/shell boundary exposes a deliberately curated `index.ts`. Use named exports by default. Internal files are not imported across feature boundaries. Do not create sprawling barrels or circular imports.
4. **Clear separation of concerns.** Keep rendering/presentation separate from app lifecycle, persistence, content data, and infrastructure/browser APIs. Composition happens at the app boundary. Apply SOLID where it helps, not as a ritual.
5. **One coherent app model.** Desktop, mobile, dock, folders, command palette, and deep links resolve the same app IDs and metadata. Do not maintain separate catalogs for each shell.
6. **Test behavior near its owner.** Components colocate `*.test.tsx` and hooks/utilities colocate their unit tests. Cross-feature flows belong in `e2e/`; use focused tests instead of giant snapshots.
7. **Accessibility is a core requirement.** Mouse, touch, keyboard, reduced motion, focus management, screen readers, and small viewports are first-class. Novelty must never hide content or trap a user.
8. **Privacy by construction.** Only public/fictional data enters this repo and its deploy artifact. No credentials, private genealogy records, local network details, or client content. Never iframe the private research app.
9. **Make complexity earn its keep.** Prefer small, boring, observable abstractions. Extract shared behavior after duplication demonstrates the need; avoid premature plugin frameworks, state libraries, or micro-frontends.
10. **Treat the code as part of the portfolio.** Document architectural tradeoffs, keep readable PRs, make tests and quality checks public, and offer legitimate links to implementation and architecture without exposing private infrastructure.

## Proposed target layout (React + TypeScript + Vite, subject to an ADR)

~~~text
src/
  app/
    App/
      App.tsx
      App.test.tsx
      index.ts
    routing/
    index.ts
  shell/
    desktop/
      DesktopShell/
        DesktopShell.tsx
        DesktopShell.test.tsx
        DesktopShell.module.css
        index.ts
      Window/
        Window.tsx
        Window.test.tsx
        Window.module.css
        index.ts
      Dock/
        Dock.tsx
        Dock.test.tsx
        index.ts
      index.ts
    mobile/
      MobileShell/
        MobileShell.tsx
        MobileShell.test.tsx
        index.ts
      index.ts
  features/
    workbench/
      components/
        ProjectExplorer/
          ProjectExplorer.tsx
          ProjectExplorer.test.tsx
          ProjectExplorer.module.css
          index.ts
      model/
      hooks/
      index.ts
    demos/
      components/
      model/
      index.ts
    journal/
      components/
      index.ts
  shared/
    ui/
      Button/
        Button.tsx
        Button.test.tsx
        index.ts
    lib/
    types/
  content/
    projects/
    journal/
  styles/
    tokens.css
  test/
    setup.ts
e2e/
docs/
  adr/
~~~

This is an **illustrative shape**, not permission to generate empty directories or boilerplate. One component per directory is the default; non-component types, tiny pure functions, and closely related private helpers need not become ceremony. Create folders only for actual work.

## Import and dependency discipline

- `app` composes shells/features; shells and features depend on `shared` and explicit contracts, not each other's internals.
- `features/*` do not reach into sibling features' implementation directories. Cross-feature orchestration belongs in `app` or explicit shared interfaces.
- Keep the OS window manager independent of feature-specific UI. Feature apps register metadata and renderers through typed contracts.
- Browser side effects (`localStorage`, history, iframe messaging, window events) are behind narrow adapters/hooks. Persist only non-sensitive, versioned preferences and handle unavailable storage.
- Prefer named exports, straightforward types, and stable import aliases. No wildcard re-export maze or circular imports.
- Keep UI components small enough to understand in one sitting; extract when ownership or behavior becomes unclear, not to hit an arbitrary line count.

## Code conventions

- TypeScript `strict`; avoid `any` except for a narrowly justified, documented boundary.
- ESLint, Prettier, typecheck, and tests run in CI. Use module-scoped CSS (or an ADR-approved equivalent), with shared color/spacing tokens preserved from the current brand.
- Favor composition, pure functions, dependency inversion at real boundaries, and explicit state transitions.
- Use a typed registry for app IDs, icons, labels, capabilities, routes, and demo embed policy; do not scatter hard-coded names across desktop and mobile.
- Maintain meaningful loading, empty, error, and blocked-iframe states. External demo links remain usable when embeds fail.
- Record significant choices in short ADRs: framework/build migration, routing strategy on GitHub Pages, window management, local persistence, third-party dependencies, and iframe security.

## Self-documenting source code

**Default: the source explains itself.** Express behavior through precise names, small functions, clear types, well-defined interfaces, focused modules, and tests that read like examples. Do not add prose that duplicates the implementation.

- Avoid routine inline comments, decorative section banners, autogenerated JSDoc, redundant descriptions of props, and long source-file headers. Prefer a name, type, function extraction, or simpler design.
- Comments are **exceptional**, reserved for a decision the code cannot make obvious: a browser compatibility workaround, surprising invariant, security boundary, external protocol constraint, or non-obvious tradeoff. Keep them short, explain **why** (not what), and link to an ADR or issue when useful.
- Keep architectural history, onboarding, usage guides, and meaningful design decisions in concise files under `docs/` or the appropriate public README rather than embedding narrative in implementation files. These documents help new contributors and do not replace readable code.
- Keep required license notices, accessibility semantics, type declarations, third-party attributions, and tool/compiler directives where they belong. Do not remove needed annotations in the name of purity.
- Never contort understandable code solely to eliminate a necessary comment. If a comment explains complex behavior, first try making the behavior simpler; if a comment still adds essential context, preserve it.
- Code reviews should challenge comments that restate the implementation, and challenge opaque code equally. A low comment count is not a quality metric.

## Testing strategy and review gates

- **Colocated unit/component tests:** interaction, keyboard behavior, state transitions, focus handling, important edge cases.
- **Integration tests:** app registry, route restoration, desktop/mobile navigation, storage failures, blocked external demo.
- **Playwright E2E:** smoke-test opening/closing/focusing windows, folder navigation, demo fallback, mobile back navigation, and direct links.
- **Accessibility:** automated checks plus manual keyboard and touch review, at least 1440px desktop and 390px mobile visual evidence; include reduced-motion checks for animations.
- **CI gates on changed implementation:** format/lint, `tsc --noEmit`, relevant unit/integration tests, production build, and focused browser tests before merge.
- **Public craft evidence:** maintain relevant architecture diagrams/ADRs and track bundle size, browser performance, accessibility violations, coverage trends, and dependency cycles honestly. Set numerical thresholds from a measured baseline rather than gaming a score.

## PR checklist

- [ ] Small, independently reviewable scope with a clear user-visible or maintainability outcome.
- [ ] Feature-first location and component folders with intentional `index.ts` exports.
- [ ] No deep cross-feature imports, dependency cycles, or unnecessary abstractions.
- [ ] Implementation communicates intent through naming, types, boundaries, and tests; no redundant comments or autogenerated documentation; exceptional rationale is short and specific.
- [ ] Tests colocated with new behavior; E2E added for new cross-shell flows.
- [ ] Desktop/mobile UX, keyboard accessibility, error states, and reduced motion considered.
- [ ] Public data only; demo destinations allowlisted; no private app exposure.
- [ ] Typecheck, lint, build, and applicable tests pass; visual evidence included for UI changes.
- [ ] ADR/docs updated when architectural boundaries or operating assumptions change.

## Migration and approval boundaries

The existing public homepage and Tracing Guatemala informational/privacy routes remain intact until KrunchOS design and migration are explicitly reviewed. The current design-parity screenshots remain the baseline for existing pages; intentional changes require new approved references. Preserve GitHub Pages hosting, relative/base-aware assets, safe deep links, and the static deployment allowlist. Do not modify Cloudflare DNS, OAuth flows, or `tg.krunchymonkey.dev` as part of this redesign.

**Working maxim:** A visitor should enjoy opening the windows. A senior engineer should enjoy opening the repository.
