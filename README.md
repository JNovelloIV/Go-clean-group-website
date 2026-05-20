# Go Clean Group

Static marketing site built with [Astro](https://astro.build).

## Requirements

- Node `>= 22.12.0` (see `.nvmrc`)

## Commands

```sh
npm install
npm run dev      # start dev server at http://localhost:4321
npm run build    # output static site to ./dist
npm run preview  # serve the production build locally
```

## Structure

```
src/
  layouts/Layout.astro    # base HTML, meta, slot
  pages/index.astro       # home page
  styles/
    tokens.css            # design tokens (colors, spacing, type)
    base.css              # global resets + container
public/                   # static assets served as-is
astro.config.mjs          # Astro config + sitemap integration
```
