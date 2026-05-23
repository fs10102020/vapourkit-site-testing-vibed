# vapourkit-site

Marketing site and documentation for [Vapourkit](https://github.com/Kim2091/vapourkit).

Built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## Local development

```bash
npm install

# Generate the filter reference from a sibling vapourkit checkout
npm run gen:filters

# Generate the OG social preview image (1200×630, center-crop from Main Screen.png)
npm run gen:og

# Dev server (hot reload)
npm run dev

# Production build (run gen:filters and gen:og first)
npm run build

# Preview the production build
npm run preview
```

By default `gen:filters` looks for the Vapourkit repo at `../vapourkit`. Override with the `VAPOURKIT_REPO_PATH` environment variable:

```bash
VAPOURKIT_REPO_PATH=/path/to/vapourkit npm run gen:filters
```

## Structure

```
src/
  pages/
    index.astro              # Landing page (custom Astro, not Starlight)
  content/
    docs/                    # Starlight content collection
      introduction.md
      installation.md
      first-upscale.md
      guides/
      models/
      filters/               # `reference.md` is auto-generated
      reference/
      development/
  components/
    Icon.astro               # Inline SVG icon set (lucide-style)
    FloatingToggle.astro     # Fixed bottom-right theme toggle + scroll-to-top
    StarlightFooter.astro    # Wraps Starlight footer + FloatingToggle
    Lightbox.astro           # Fullscreen image modal (Tour section)
    ComparisonSlider.astro   # Before/after CSS slider (placeholder)
  layouts/
    Layout.astro             # Landing page layout
  lib/
    base.ts                  # Normalized BASE_URL helper
  styles/
    tailwind.css             # Tailwind + custom utilities (grain, section-overline, etc.)
    starlight.css            # Starlight theme overrides + grain safety net
  assets/
    wordmark.svg
scripts/
  generateFilterDocs.ts      # Reads .vkfilter files → src/content/docs/filters/reference.md
  generateOgImage.ts         # Sharp resize Main Screen.png → public/og.png
astro.config.mjs             # Starlight + Tailwind integrations + sidebar
tailwind.config.mjs          # Theme tokens (RGB triplets for opacity modifiers)
.github/workflows/deploy.yml # CI: checkout → gen:filters → gen:og → build validation
```

The landing page lives outside the Starlight content collection so it can be fully custom. All docs live at root-level URLs (`/installation`, `/guides/basic-usage`, etc.) — there is no `/docs/` prefix.

## CI

GitHub Actions validates the build on every push to `main`. The workflow checks out the Vapourkit desktop repo alongside this one, then runs `gen:filters`, `gen:og`, and `build` to confirm the site compiles.

## Refreshing the filter reference

The filter reference page is generated from `.vkfilter` files in the Vapourkit repo's `include/plugins/plugin_filters/` and `include/filter_templates/` directories. Re-run `npm run gen:filters` (or push to `main` to trigger CI) after adding or modifying filters upstream.

## License

GPL 3.0, matching Vapourkit.
