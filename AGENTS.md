# AGENTS.md

## Architecture

Astro + Starlight marketing site and docs for VapourKit (a separate Electron desktop app).

**Two surfaces, one repo:**
- **Landing page** — `src/pages/index.astro` is a custom Astro page outside Starlight. Uses `src/layouts/Layout.astro` (not Starlight's default).
- **Docs** — everything under `src/content/docs/` is Starlight markdown, served at root-level URLs (`/installation`, `/guides/basic-usage/` — no `/docs/` prefix).

**Theme sync:** Landing and docs share `localStorage` key `starlight-theme` and `data-theme` HTML attribute. Both default to dark. Change in both `Layout.astro` and `astro.config.mjs` if you switch the default.

## Commands

```bash
npm install                    # first-time setup
npm run gen:filters            # REQUIRED — generates src/content/docs/filters/reference.md
npm run gen:og                 # REQUIRED — generates public/og.png (1200×630 social card)
npm run build                  # production build (run gen:filters AND gen:og first)
npm run dev                    # dev server at localhost:4321
npm run preview                # preview dist/ after build
```

`gen:og` and `gen:filters` run in CI before build. Both must succeed for a passing build.

## Build prerequisites

### Filter generation (`npm run gen:filters`)
Reads `.vkfilter` TOML files from the VapourKit desktop app repo. Looks in:
- `VAPOURKIT_REPO_PATH` env var, or
- `../vapourkit` (sibling directory)

Override: `VAPOURKIT_REPO_PATH=/path/to/vapourkit npm run gen:filters`

### OG image generation (`npm run gen:og`)
Uses `sharp` to resize `public/pictures/Main Screen.png` → `public/og.png` (1200×630, center-crop). Output is gitignored (regenerated in CI).

## Key conventions

- **Base URL**: `src/lib/base.ts` normalizes `import.meta.env.BASE_URL` with trailing-slash. All landing page links must use `import { base } from '../lib/base'` and interpolate `{base}`, not raw `/`.
- **Tailwind preflight is disabled** — `@astrojs/starlight-tailwind` disables it. Custom resets live in `src/styles/tailwind.css` at `@layer base`. Do not re-enable full Preflight.
- **CSS color variables** are RGB triplets (e.g. `--vk-bg: 5 5 5`) so `rgb(var(--vk-bg) / <alpha-value>)` works for Tailwind opacity modifiers. Defined in `:root[data-theme="dark"]` and `:root[data-theme="light"]` in `tailwind.css`.
- **`tailwind.config.mjs`** extends `opacity` with `6`, `8`, `12` (0.06, 0.08, 0.12). Dark mode: `['class', '[data-theme="dark"]']`.
- **Section overline** — the `section-overline` utility class in `tailwind.css` (`@layer utilities`) wraps the repeated `text-[11px] tracking-[0.12em] text-vk-accent` pattern. Use it instead of inlining.
- **Grain/vignette** is scoped to landing page only via `body.has-grain::before`/`::after` (landing passes `<Layout grain>`). Starlight pages never get `has-grain`. `starlight.css` has a safety net: `body:not(.has-grain)::before, body:not(.has-grain)::after { display: none !important; }`.
- **`<script is:inline>`** in Astro passes through verbatim — no transpilation. NEVER use TypeScript syntax (`as`, `<HTMLElement>`, `e: MouseEvent`) inside an `is:inline` script. It will ship as-is to the browser and throw SyntaxError.

## Components

| Component | Used where | Role |
|-----------|-----------|------|
| `Icon.astro` | Landing page, FloatingToggle | Inline SVG icon set (chip, eye, github, discord, expand, etc.) |
| `FloatingToggle.astro` | Landing (via Layout), Docs (via StarlightFooter) | Fixed bottom-right: theme toggle + scroll-to-top button |
| `StarlightFooter.astro` | Docs (astro.config.mjs `components.Footer`) | Wraps Starlight footer + injects FloatingToggle |
| `Lightbox.astro` | Landing Tour section | Fullscreen image modal. Opens on click of `[data-lightbox]` elements. ESC/backdrop/× to close. |
| `ComparisonSlider.astro` | Landing Before/After section | CSS range-input before/after slider. Shows placeholder when no images supplied. Pass `before`/`after` props when you have frame captures. |

## Landing page structure (`src/pages/index.astro`)

Sections: Hero → Features → Before/After (YouTube embeds + ComparisonSlider) → Tour (screenshots with click-to-lightbox) → Filters (8 categories, 2-column grid) → Models (VSR badge) → System Reqs → Community/Support → Footer.

- Hero image is above-the-fold — `loading="eager"`, never lazy-load.
- Tour images use `object-cover` for uniform 16:9 fill. Hover overlay with expand icon + text. Click opens Lightbox.
- Filter chips use real filter names from `src/content/docs/filters/reference.md`. Do not invent names.
- Screenshots live in `public/pictures/`.
- Videos are YouTube iframes (nocookie domain, `loading="lazy"`).

## Content that requires the VapourKit repo

- `src/content/docs/filters/reference.md` — auto-generated, never edit by hand. Re-run `npm run gen:filters`.
- `scripts/generateFilterDocs.ts` — the generator.
- `src/content/docs/models/licensing.md` — links to VapourKit repo for license data.

## CI

GitHub Actions validates the build on push to `main`. Workflow checks out `Kim2091/vapourkit` into `vapourkit-source/`, runs `gen:filters`, `gen:og`, then `build` to confirm the site compiles (no deploy step — build validation only).
