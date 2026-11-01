# Design change request — 8bitcn/ui inside KrunchOS

**Issues:** KMOS-034 (#48), KMOS-035 (#49)  
**Phase:** v0.1 Foundations  
**State:** Experimental, not approved or deployed  
**PR:** #50, stacked against the foundation PR #47

## Revised product decision

The first 8bitcn/ui prototype rendered as a conventional marketing SPA. Owner feedback: it looked too much like a webpage rather than an operating system. **Correct approach: retain the existing functional KrunchOS desktop/mobile OS shell and window manager, and use pixel-styled 8bitcn/ui components *inside* apps.**

## Comparison URLs

- `/`: untouched baseline v0.1 OS styling.
- `/?preview=8bitcn`: pixel-edition OS shell with actual windows, desktop shortcuts, menu bar, dock, app launcher, and 8bitcn/ui Workbench / Open Bench.

## Design and implementation

- Pixel variant reuses the existing reducer for window open, focus, close, move, minimize and restore. There is **no second window manager**.
- Default desktop boots with two overlapping windows; mobile boots to an app launcher, then full-screen OS application views.
- 8bitcn Button/Card source is adapted under `src/vendor/8bitcn`, preserving upstream attribution and MIT terms in `THIRD_PARTY_8BITCN.md`. No remote font request.
- Public content only, original monkey logo, stylized CSS Guatemalan-inspired landscape, no live/embedded private genealogy app.
- **Not implemented in this spike:** resizing, a full Code Explorer, public demo browser, real terminal, login or community contribution workflow. Disabled/future apps remain clearly indicated.

## Acceptance and follow-up

- Verify TypeScript, lint, tests, build, and original static-site validation in GitHub Actions.
- Manually capture/review desktop 1440×900 and mobile 390×844; visually inspect window placement, typography, scrolling and tap targets.
- Desktop Workbench and Open Bench can be minimized, restored, closed and focused; app selection changes inspector content. Mobile can launch an app and return home.
- Review accessibility (keyboard focus, reduced motion, touch sizes) and compare bundle impact before adoption.
- Keep PR #50 draft and stacked; no merge, Pages deployment, DNS, server or Tracing Guatemala changes.

## Rollback

Remove the `?preview=8bitcn` entry point, pixel UI files and vendor components. The original v0.1 OS preview remains separate.
