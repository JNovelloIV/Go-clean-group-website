# The Hill

Production website for **The Hill** — an organic farm in Darek, Central Lombok.

A single-page, static-rendered Astro site. The brand voice is restrained on purpose. Copy is locked in `/reference/the-hill-copy.md`; visual fidelity is locked to the Claude Design export in `/reference/the-hill-standalone.html`. Don't paraphrase locked copy.

## Stack

- **[Astro 6.x](https://astro.build)** — static-first, no client-side framework, minimal JS.
- **TypeScript** (strictest preset).
- **Self-hosted fonts** under `/public/fonts/` — Cormorant Garamond + DM Sans (latin subset, variable woff2).
- **No CMS.** Copy is in components.

Node `>= 22.12` is required.

## Local development

```sh
npm install            # install dependencies
npm run dev            # dev server at http://localhost:4321
npm run build          # production build to ./dist/
npm run preview        # preview the production build locally
```

## Project structure

```
.
├── astro.config.mjs           # site URL + sitemap integration
├── public/
│   ├── favicon.svg            # placeholder mark — replace with real logo
│   ├── og-image.png           # social share preview (1200x630, regenerable)
│   ├── og-image.svg           # source for the OG card
│   ├── robots.txt             # points at /sitemap-index.xml
│   ├── fonts/                 # self-hosted variable woff2
│   └── images/
│       └── gallery/
│           └── README.md      # expected gallery photo paths + alt text
├── reference/
│   ├── the-hill-claude-code-brief.md   # original build brief
│   ├── the-hill-copy.md                # CANONICAL copy doc (source of truth)
│   └── the-hill-standalone.html        # Claude Design export (visual reference)
└── src/
    ├── layouts/
    │   └── Layout.astro       # SEO head, fonts, base resets, slot
    ├── components/
    │   ├── Nav.astro          # Sticky nav + mobile hamburger drawer
    │   ├── Hero.astro
    │   ├── Manifesto.astro
    │   ├── Locate.astro       # SVG map placeholder lives here (TODO-DESIGN-01)
    │   ├── Production.astro   # 4 panels + Sharing-the-abundance closing block
    │   ├── Building.astro
    │   ├── Gallery.astro      # auto-resolves real images from /public/images/gallery/
    │   ├── BigQuote.astro
    │   ├── Subscribe.astro    # dual-channel form (Email/WhatsApp + chips + Tally)
    │   └── Footer.astro
    ├── pages/
    │   └── index.astro        # composes the page in the brief's order
    └── styles/
        ├── tokens.css         # the locked brand palette + type scale + spacing
        ├── fonts.css          # @font-face declarations
        └── base.css           # reset + global typography + skip link + focus
```

## Updating copy

All copy lives inline in the section components under `src/components/`. There is no CMS. To change a sentence:

1. Open the relevant component (e.g. `src/components/Manifesto.astro`).
2. Edit the text. Italic emphasis uses `<em>…</em>` and renders in Harvest Gold on dark sections automatically — `tokens.css` handles the styling.
3. The dev server hot-reloads. Build with `npm run build` to verify.

When making meaningful copy changes, **also update `/reference/the-hill-copy.md`** so the canonical doc stays in sync.

### Section ↔ component map

| Section in copy doc                 | Component                          |
|-------------------------------------|------------------------------------|
| Global / Navigation                 | `Nav.astro`                        |
| §1 Hero                             | `Hero.astro`                       |
| §2 Manifesto — "The idea"           | `Manifesto.astro`                  |
| §3 Locate — "Where we are"          | `Locate.astro`                     |
| §4 Production — "The farm"          | `Production.astro`                 |
| §5 Building                         | `Building.astro`                   |
| §6 Gallery                          | `Gallery.astro`                    |
| §7 Letters                          | *(omitted for v1 — see below)*     |
| §8 Big Quote                        | `BigQuote.astro`                   |
| §9 Subscribe — "Stay close"         | `Subscribe.astro`                  |
| §10 Footer                          | `Footer.astro`                     |

### Adding the Letters section back

Letters is intentionally hidden for v1. To bring it back:

1. Create `src/components/Letters.astro` with the eyebrow/headline/intro from §7 of the copy doc, plus the real first letter content.
2. Add `<Letters />` between `<BigQuote />` and `<Subscribe />` in `src/pages/index.astro`.
3. Add the nav item to `src/components/Nav.astro` (`{ href: '#letters', label: 'Letters' }`) and a Letters link to `src/components/Footer.astro`.

## Adding real photography

The Gallery component auto-resolves real photos at build time. Drop a JPG at the path the placeholder shows on the live site (or in `public/images/gallery/README.md`) and the next build replaces the placeholder tile with an `<img>` automatically. No code change needed.

## Form (Subscribe)

The Subscribe form is a custom-styled dual-channel signup:

- **Email** or **WhatsApp** channel chooser (segmented control)
- Conditional contact field — email input *or* country-code + phone number
- Two optional chip groups (`I am…`, `I'm drawn to…`)
- Submit button gated on contact validity (chips never gate submission)
- Fine print, Instagram CTA

Submit handler builds this payload:

```ts
{
  channel: 'email' | 'whatsapp',
  contact: string,        // email address, or "+62XXXXXX..." for WhatsApp
  i_am: string[],         // selected Q1 chips
  drawn_to: string[],     // selected Q2 chips
  submitted_at: string    // ISO 8601
}
```

### Form provider

The Subscribe form posts to **[Formspark](https://formspark.io)** — chosen because it accepts a simple JSON POST from a static site (no backend needed) and keeps the custom UI intact. The integration lives in `src/components/Subscribe.astro`:

```ts
const FORMSPARK_URL = 'https://submit-form.com/PQ024KE15';
```

The submit handler:

- POSTs `{ channel, contact, i_am, drawn_to, submitted_at }` as JSON with `Content-Type` and `Accept: application/json`.
- Native JSON arrays (`i_am`, `drawn_to`) are first-class per [Formspark's arrays-and-objects docs](https://documentation.formspark.io/setup/arrays-and-objects.html); the dashboard renders them readably, no flattening needed.
- On 2xx: hides the form, reveals the on-brand confirmation block, keeps the Instagram CTA visible. Focus moves to the confirmation so screen readers announce it.
- On non-2xx or network error: shows `"Something didn't go through. Try again?"` in the form's status line, logs to `console.error`, and re-enables the submit button so the user can retry.

To switch providers (Fillout, Formspree, or a custom Cloudflare Worker), only `FORMSPARK_URL` and the `fetch(...)` call need to change. Payload shape, UI, and success/error logic stay the same.

### Optional Formspark dashboard tweaks

- Email notifications on each submission (default on; turn off if you don't want them).
- Webhook to a Google Sheet, Airtable, or your ESP.
- reCAPTCHA / honeypot if spam becomes an issue (Formspark has built-in honeypot detection; current form doesn't add an extra honeypot field — add one if needed).

## Accessibility

WCAG AA contrast verified across every text role. The five core brand colors (Deep Forest, Harvest Gold, Ivory, Near-Black, Sage) are unchanged from the brand deck. Three derived tones (`--dark-eyebrow`, `--dark-caption`, `--sage-deep`) were nudged in luminance to clear AA — see comments in `src/styles/tokens.css` for the exact ratios.

Other a11y commitments:

- Skip link first in tab order
- All interactive elements keyboard-reachable
- `prefers-reduced-motion` disables the hero scroll arrow animation and any reveal transitions
- Form labels associated via wrapping `<label>` or `for` attributes
- Mobile drawer is keyboard-operable (Esc closes, body scroll locks while open)
- All gallery images have alt text from the copy doc; image 6 is decoratively hidden

## SEO

- `<title>` and meta description from §Global of the copy doc
- Canonical URL points at `https://thehill.id/`
- OG + Twitter card images at `/og-image.png` (1200×630 placeholder; replace with a real photographic version once available)
- Sitemap at `/sitemap-index.xml`, advertised in `/robots.txt`

## Deploy

The build outputs static HTML/CSS/JS to `./dist/`. Recommended targets:

- **Cloudflare Pages** — free tier ample. Connect the repo, build command `npm run build`, output directory `dist`.
- **Netlify** — same pattern. Build command and publish directory the same.
- **Vercel** — supports Astro out of the box.

Point `thehill.id` (and `www.thehill.id`) at whichever host you choose.

## Pre-launch TODO

The list of things that still need user action before pointing the real domain at this site:

- [ ] Replace `public/favicon.svg` with the real mushroom-with-roots mark (and regenerate `favicon.ico` from it).
- [ ] Replace `public/og-image.png` with a real photographic version (1200×630 JPG or PNG, hero crop).
- [ ] Drop real gallery photos into `public/images/gallery/` per the slot table in that folder's README.
- [ ] Verify the **"foothills of Pergasingan"** reference in `src/components/Locate.astro` — Pergasingan is in east Lombok (Sembalun), not Central Lombok where Darek sits. May be a Claude Design fabrication; pick the correct local mountain reference.
- [ ] Decide image 6 in the Gallery — keep as decorative styled tile (current behavior) or replace with a real garden/produce photo + alt text.
- [ ] Run a live submission test against the Formspark form (`PQ024KE15`) and confirm the entry in the Formspark dashboard reads cleanly — particularly that the `i_am` and `drawn_to` arrays render readably. If they don't, swap to comma-joined strings in the submit handler in `src/components/Subscribe.astro` (one-line change). The Tally form `KYPL1V` was abandoned earlier in this build — Tally doesn't support direct JSON POST from a custom HTML form (only iframe embed or server-side API). See git history for context.
- [ ] Confirm the Instagram handle `@thehill_lombok` and the `hello@thehill.id` email are real and routed.
- [ ] Confirm the `site` value in `astro.config.mjs` is the right deploy domain (currently `https://thehill.id`).
- [ ] Replace the Locate section's stylized SVG map with the full island-orientation map per `TODO-DESIGN-01` in the copy doc (separate design pass).
- [ ] When the first real letter exists: add a Letters component back per the "Adding the Letters section back" instructions above.

## License & ownership

This is The Hill's own codebase. No external license imposed; treat as proprietary.

— Built in a Claude Code session against the brief in `/reference/`. Reach out via `hello@thehill.id`.
