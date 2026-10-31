# Approved design parity contract

**Source of truth:** The KrunchyMonkey static-site mockup supplied and accepted on October 31, 2026. The actual HTML, CSS, images, and screenshots are committed alongside this document.

## Reference screenshots

| Reference | Viewport | Target |
|---|---:|---|
| `docs/reference/home-hero-1440.png` | 1440px desktop (hero crop) | The visual introduction, headline and logo balance |
| `docs/reference/home-desktop-1440.png` | 1440 × 900 full page | All homepage sections and footer |
| `docs/reference/home-mobile-390.png` | 390 × 844 full page | Mobile navigation, hero stacking, card behavior |
| `docs/reference/tracing-guatemala-desktop-1440.png` | 1440 × 900 full page | Project information and fictional product preview |
| `docs/reference/privacy-draft-desktop-1440.png` | 1440 × 900 full page | Privacy page layout; **copy is not approved policy** |

Compare screenshots at the listed viewport widths and device scale factor 1. Differences due to fonts, antialiasing, or browser versions should be reviewed by a human, not used as an excuse to change the intended design.

## Colors and design tokens

The canonical tokens are in `assets/site.css` (do not paraphrase them independently in component-specific files):

| Token | Value | Usage |
|---|---|---|
| `--night` | `#151110` | Dark hero, footer |
| `--night-2` | `#211816` | Secondary dark surfaces |
| `--wine` | `#481d1a` | Monkey/logo-inspired accent |
| `--gold` | `#ffc13a` | Main brand emphasis, CTA |
| `--gold-lite` | `#ffd77a` | Highlights |
| `--cream` | `#faf7f0` | Soft background |
| `--paper` | `#f5f1e7` | Feature/card panels |
| `--ink` | `#28211e` | Dark text |
| `--radius` | `18px` | Major card radius |
| `--max` | `1180px` | Maximum content width |

## Layout and copy (don't drift)

- Logo and wordmark use the approved uploaded monkey mark. Preserve the **yellow-orange background, dark maroon monkey, controller eyes, and cream facial details**.
- Hero tagline: **“A little playful. A lot of purpose.”** Keep its typography and two-line treatment.
- Hero copy emphasizes practical, privacy-minded software, with **Explore the work** and **How I build** actions.
- Trait bar: **Built for real people**, **Private by default**, **Crafted to last**.
- Main project: **Tracing Guatemala**, fictional-only conceptual research dashboard, not a real client screenshot.
- Approach section: **Old-school care. Modern tools.** with three principles.
- About and footer close the page with developer personality, not sales conversion.
- Mobile: content stacks, navigation uses `<details>`, and no horizontal overflow is permitted.

## Definition of 1:1

- [ ] Approved icon and favicon are visually unchanged; master source asset remains available.
- [ ] Desktop first viewport, full-page homepage, and project page align with approved images (section order, dominant proportions, color, padding, typography and copy).
- [ ] Mobile screenshot at 390px retains the intended hierarchy and has no horizontal scrolling or broken tap targets.
- [ ] All routes, links, images, and typography work from both a project Pages URL and the apex domain.
- [ ] Any intentional visual departure is explicitly documented with before/after screenshots in a reviewed PR.
- [ ] Technical improvements (accessibility, build checks, deployment) do not silently redesign the site.

## Comparison process

1. Run `python -m http.server 8000` from the repo root (or use the optional `python scripts/capture_visuals.py` script after installing Playwright and Pillow).
2. Open `http://localhost:8000/` and use a 1440px-wide browser viewport; repeat at 390px.
3. Compare rendered pages with `docs/reference/` and attach visual evidence to the PR.
4. Check the project and privacy routes and click all nav/anchor links.
5. Do not use real family history or private customer data in screenshots or tests.

The screenshot files are review baselines. For automated raster comparison, pin browser version, fonts and OS before adopting a pixel threshold in CI; inconsistent rendering environments cause false positives.