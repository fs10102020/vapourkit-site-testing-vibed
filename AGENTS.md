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
npm run gen:og                 # REQUIRED — generates public/og.jpg (1200×630 social card)
npm run build                  # production build (auto-runs gen:filters + gen:og via prebuild)
npm run dev                    # dev server at localhost:4321
npm run preview                # preview dist/ after build (also `npm start`)
```

`npm run build` automatically runs `prebuild` (gen:filters + gen:og) before building. Both generation steps must succeed for a passing build. In CI, these run as separate steps before `astro build`.

## Build prerequisites

### Filter generation (`npm run gen:filters`)
Reads `.vkfilter` TOML files from the VapourKit desktop app repo. Looks in:
- `VAPOURKIT_REPO_PATH` env var, or
- `../vapourkit` (sibling directory, validates by checking for `include/plugins/plugin_filters/`)

Override: `VAPOURKIT_REPO_PATH=/path/to/vapourkit npm run gen:filters`

### OG image generation (`npm run gen:og`)
Uses `sharp` to resize `public/pictures/Main Screen.png` → `public/og.jpg` (1200×630, center-crop, JPEG quality 85). Output is gitignored (regenerated in CI).

## Key conventions

- **Base URL**: `src/lib/base.ts` normalizes `import.meta.env.BASE_URL` with trailing-slash. All landing page links must use `import { base } from '../lib/base'` and interpolate `{base}`, not raw `/`.
- **Tailwind preflight is disabled** — `@astrojs/starlight-tailwind` disables it via the Tailwind plugin in `tailwind.config.mjs`. Custom resets live in `src/styles/tailwind.css` at `@layer base`. Do not re-enable full Preflight.
- **CSS color variables** are RGB triplets (e.g. `--vk-bg: 5 5 5`) so `rgb(var(--vk-bg) / <alpha-value>)` works for Tailwind opacity modifiers. Defined in `:root[data-theme="dark"]` and `:root[data-theme="light"]` in `tailwind.css`.
- **`tailwind.config.mjs`**: dark mode uses `['class', '[data-theme="dark"]']`. Colors are defined with `<alpha-value>` placeholder for opacity modifier support. Deleted unused colors/opacity entries — add back only if actually used.
- **Section overline** — the `section-overline` utility class in `tailwind.css` (`@layer utilities`) wraps the repeated `text-[11px] tracking-[0.12em] text-vk-accent` pattern. Use it instead of inlining.
- **Hero glow** — the `.hero-glow` utility class in `tailwind.css` replaces the inline `style=` background. Uses `var(--vk-hero-glow-1)` and `var(--vk-hero-glow-2)` CSS variables.
- **Grain/vignette** is scoped to landing page only via `body.has-grain::before`/`::after` (landing passes `<Layout grain>`). Starlight pages never get `has-grain`. `starlight.css` has a safety net: `body:not(.has-grain)::before, body:not(.has-grain)::after { display: none !important; }`.
- **`<script is:inline>`** in Astro passes through verbatim — no transpilation. NEVER use TypeScript syntax (`as`, `<HTMLElement>`, `e: MouseEvent`) inside an `is:inline` script. It will ship as-is to the browser and throw SyntaxError.
- **Section headings**: use `<SectionHeading overline="..." title="..." description="..." />` instead of inlining the repeated div/h2 pattern. Accepts optional `description` prop.
- **Shared class constants**: `index.astro` frontmatter exports `socialLinkClass`, `chipClass`, `ctaPrimaryClass`, and `ctaSecondaryClass` — reuse these instead of inlining long Tailwind class strings.
- **Icons**: all `<Icon>` SVG elements include `aria-hidden="true"` because their accessible name comes from the parent button/element's `aria-label`, not from the icon itself.
- **External links**: use `rel="noopener noreferrer"` (not just `noopener`) on all `target="_blank"` links.
- **YouTube embeds**: defined as a `videos` data array in frontmatter. Always use `youtube-nocookie.com` domain, `referrerpolicy="no-referrer"`, and `loading="lazy"`.
- **Filter categories**: driven by `filterCategories` data array in frontmatter — never hardcode the DOM. Edit the array to add/remove categories or filters.

## Components

| Component | Used where | Role |
|-----------|-----------|------|
| `Icon.astro` | Landing page, FloatingToggle, SectionHeading | 16 inline SVG icons (all with `aria-hidden="true"`). `cyan-dot` is a `<span>`, not SVG — ignores `size` and `stroke` props. |
| `FloatingToggle.astro` | Landing (via Layout), Docs (via StarlightFooter) | Fixed bottom-right: theme toggle + scroll-to-top button. Scroll handler uses `requestAnimationFrame`. |
| `StarlightFooter.astro` | Docs (astro.config.mjs `components.Footer`) | Wraps Starlight footer + injects FloatingToggle |
| `Lightbox.astro` | Landing Tour section | Fullscreen image modal. Features: focus trap, `aria-modal="true"`, keyboard activation (Enter/Space on triggers), ESC/backdrop/× to close, return-focus-on-close, View Transitions guard (`window.__vkLightboxInit`). |
| `ComparisonSlider.astro` | Landing Before/After section | CSS range-input before/after slider. Shows placeholder when no images supplied. Pass `before`/`after` props when you have frame captures. Script uses parentElement traversal from document.currentScript. |
| `SectionHeading.astro` | Landing page (all sections) | Reusable section header with overline, title, and optional description. Replaces 8 duplicated div/h2 blocks. |

## Landing page structure (`src/pages/index.astro`)

Sections: Hero → Features → Before/After (YouTube embeds + ComparisonSlider) → Tour (screenshots with click-to-lightbox) → Filters (8 categories, 2-column grid) → Models (VSR badge) → System Reqs → Community/Support → Footer.

- Hero image is above-the-fold — `loading="eager"` with `fetchpriority="high"`, never lazy-load.
- Tour images use `object-cover` for uniform 16:9 fill, with explicit `width`/`height` to prevent CLS. Hover overlay with expand icon + text. Click opens Lightbox. Trigger elements use `tabindex="0"` and `role="button"` for keyboard accessibility.
- Filter chips use real filter names from `src/content/docs/filters/reference.md`. Categories/filters are data-driven from a frontmatter array. Do not invent names or hardcode the DOM.
- Screenshots live in `public/pictures/`.
- Videos are YouTube iframes (nocookie domain, `loading="lazy"`, `referrerpolicy="no-referrer"`).
- System requirements use semantic `<dl>`/`<dt>`/`<dd>` elements.
- Footer is outside `<main>` for correct HTML semantics.
- All section headings use `<SectionHeading>` component.

## Content that requires the VapourKit repo

- `src/content/docs/filters/reference.md` — auto-generated, never edit by hand. Re-run `npm run gen:filters`.
- `scripts/generateFilterDocs.ts` — the generator.
- `src/content/docs/models/licensing.md` — links to VapourKit repo for license data.

## CI

GitHub Actions workflow (`.github/workflows/build.yml`) validates the build on push/PR to `main`:
- **Triggers**: `push`, `pull_request`, `workflow_dispatch`
- **Concurrency**: cancels in-progress runs on the same ref
- **Steps**: checkout site → checkout `Kim2091/vapourkit` → setup Node 20 with npm cache → `npm ci` → `gen:filters` → `gen:og` → `astro build` → upload `dist/` artifact
- Build validation only — no deployment step.

## Dependencies

Build-time and dev tools (`sharp`, `@iarna/toml`, `@astrojs/check`, `tsx`, `typescript`, `@types/node`) are in `devDependencies`. Runtime deps (`astro`, `tailwindcss`, `@astrojs/starlight`, `@astrojs/tailwind`, `@astrojs/starlight-tailwind`) are in `dependencies`.
