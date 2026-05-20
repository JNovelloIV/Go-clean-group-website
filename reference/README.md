# Handoff: GoClean Group — Marketing Website

## Overview

A single-page marketing website for **GoClean Group**, a small local villa-cleaning team in Kuta, Lombok. The site converts walk-up visitors (mostly villa owners, property managers, and long-stay guests) into WhatsApp bookings. It explains the services, publishes flat prices, builds trust through team-and-place storytelling, and ends in a structured WhatsApp handoff form.

The site is **fully bilingual (EN / ID)** via an in-page language toggle — every translatable string is stored on the element as `data-en` and `data-id`. There is no routing; language switch is instant client-side.

Primary conversion action: open a pre-filled WhatsApp message to **+62 878 6457 3925**.

---

## About the Design Files

The file in `design_reference/index.html` is a **design reference**, not production code to copy directly. It is a self-contained HTML prototype showing the intended look, copy, content structure, interactions, and visual rhythm.

The task is to **recreate this design in the target codebase's existing environment** using its established patterns:

- If the project has an existing React / Next.js / Astro / Vue / Svelte setup, build it there using the project's component conventions, routing, and build pipeline.
- If no environment exists yet, **Astro** or **Next.js (App Router) with static export** are good fits — this is a brochure site, so static output + an `og:` meta block + a sitemap is plenty. SSR / API routes are not needed (the form opens WhatsApp client-side; nothing is submitted to a backend).
- Break the single HTML file into proper components (Header, Hero, ServiceCard, PriceTable, CompareCard, Step, WhyCard, ReviewCard, FAQItem, ContactForm, Footer).
- Move design tokens (colors, fonts, spacing, radii, shadows) into the codebase's existing token system (Tailwind theme config / CSS custom properties / styled-system / etc.).
- Replace the inline `data-en` / `data-id` pattern with the codebase's i18n library (`next-intl`, `react-i18next`, `astro-i18next`, etc.) — but keep the **content keyed identically** so translations don't drift.

---

## Fidelity

**High-fidelity (hifi).** Colors, typography, spacing, copy, and interactions are all final. Recreate pixel-faithfully. The one exception: the gallery section is hidden (`#gallery` has `display:none`) and is waiting on real photos — leave it commented or stubbed until photography is provided.

---

## Tech & Constraints

- **Plain HTML5 + CSS3 + vanilla JS**, no build step in the reference. Translate this to the target framework.
- **Fonts** are Google Fonts: `Fraunces` (serif) and `Hanken Grotesk` (sans). Preconnect + display=swap.
- **Performance budget:** the page should remain lightweight. No analytics / no third-party scripts beyond Google Fonts. No images currently load (Unsplash URL is used only for `og:image`). When photos are added, lazy-load below the fold.
- **Accessibility:**
  - `prefers-reduced-motion: reduce` already disables animation and smooth-scroll — preserve this.
  - All interactive elements are keyboard-reachable; mobile drawer traps focus implicitly via Escape close.
  - Form fields use proper `<label for>` association and `autocomplete` hints where applicable.
- **Responsive:** breakpoints at ~880px (collapse desktop nav into hamburger drawer) and ~720px (single-column for grids). Container max-width 1200px, gutter `clamp(20px, 4vw, 40px)`.

---

## Page Structure (top-to-bottom)

The page is one long scroll with 11 visible sections (the gallery is the 12th but hidden). Each is a `<section>` with an `id` so the nav links anchor-scroll to it.

| # | Section id | Title (EN) | Background | Purpose |
|---|---|---|---|---|
| 1 | _(hero)_ | Live fresh. Feel clean. | `--cream` | Hook + value prop + WhatsApp CTA |
| 2 | `#services` | What we do, and do well. | `--paper` | 5 service cards w/ starting prices |
| 3 | `#compare` | Regular or deep — which one do I need? | `--forest` (dark) | Side-by-side comparison |
| 4 | `#pricing` | Published prices. No surprises. | `--cream` | Two price tables + discount perks |
| 5 | `#how` | From a message to a clean villa, in four steps. | `--paper` | 4-step process |
| 6 | `#why` | Small team. Honest work. | `--cream` | 4 trust cards |
| 7 | `#gallery` | Real villas. Real team. | `--paper` | **HIDDEN — pending photography** |
| 8 | `#reviews` | Six and counting on Google. | `--cream` | Testimonials |
| 9 | `#area` | Where we go. | `--paper` | Service-area list / map |
| 10 | `#faq` | Questions, answered honestly. | `--cream` | Accordion FAQ |
| 11 | `#contact` | Tell us about your villa. Get a quick reply. | `--forest` (dark) | Contact info + WhatsApp form |

Sections alternate between three backgrounds (`paper` / `cream` / `dark`) for vertical rhythm. The two `dark` sections (`#compare`, `#contact`) use `--forest` as background with mint/cream accents — they are the conceptual anchors of the page.

---

## Design Tokens

### Colors (CSS custom properties on `:root`)

| Token | Hex | Role |
|---|---|---|
| `--mint` | `#5FBF9F` | Accent — buttons on dark, italic flourishes on dark, brand-logo fill |
| `--forest` | `#2D6B53` | Primary brand color — headlines, primary buttons, dark section bg |
| `--sage` | `#4A9B7E` | Italic flourishes on light, hover state, eyebrow color |
| `--mist` | `#C5E8D8` | Soft bg, icon container fills |
| `--cream` | `#F4FAF6` | Page wash (default body bg) |
| `--paper` | `#FFFFFF` | Card surfaces, alternating section bg |
| `--ink` | `#1A2E25` | Body text |
| `--ink-2` | `#4a5e55` | Secondary text |
| `--line` | `#e3ede7` | Hairlines, dividers |
| `--clay` | `#D9A074` | Sparing tropical accent (used very sparingly) |

**Usage rules:**
- `--mint` is for **accent only** — never as body text or a primary surface.
- `--forest` is the workhorse for headlines, primary CTAs, and dark sections.
- On dark backgrounds, italic flourishes shift from `--sage` to `--mint` for contrast.
- The page never uses gradients as backgrounds. All section transitions are flat color blocks.

### Typography

| Token | Family | Use |
|---|---|---|
| `--serif` | `"Fraunces", ui-serif, Georgia, serif` | All `h1`–`h3`, brand wordmark |
| `--sans` | `"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif` | Body text, `h4`, buttons, UI |

**Fraunces is loaded with the variable opsz axis (9..144) and italic.** Weight range 300–600. Italic is used intentionally on a few words per heading (the `.italic` span) for a hand-written-essay feel — translate this to a styled component, not a content concern.

**Type scale (clamp-based, fluid):**

| Element | Size | Line-height | Weight | Notes |
|---|---|---|---|---|
| `h1` | `clamp(40px, 6.2vw, 78px)` | 1.02 | 300 | `letter-spacing: -.02em` |
| `h2` | `clamp(30px, 4vw, 48px)` | 1.08 | 300 | `letter-spacing: -.015em` |
| `h3` | `clamp(20px, 2vw, 24px)` | 1.25 | 500 |  |
| `h4` | `17px` | (default) | 600 | Sans, not serif |
| `body` | `17px` | 1.6 | 400 | Hanken Grotesk |
| `p.lead` | `clamp(17px, 1.5vw, 19px)` | 1.6 | 400 | Subhead under section titles |
| `.eyebrow` | `12.5px` | (default) | 600 | `letter-spacing: .14em`, uppercase, color `--sage` (or `--mint` on dark) |

**Italic flourishes:** the `.italic` class is `font-style: italic; color: var(--sage); font-weight: 300;` — used for the second half of every section heading to soften the typographic rhythm.

### Spacing & layout

- Container max-width: **1200px**
- Container gutter: `clamp(20px, 4vw, 40px)`
- Section vertical padding: ~96px desktop, scales down on mobile
- Card padding: typically 28–32px
- Gap inside grids: 24–32px

### Radii

| Token | Px |
|---|---|
| `--r-sm` | 12 |
| `--r-md` | 16 |
| `--r-lg` | 22 |
| `--r-xl` | 28 |

Buttons are `border-radius: 999px` (full pill).

### Shadows

- `--shadow-sm`: `0 1px 2px rgba(26,46,37,.04), 0 2px 8px rgba(26,46,37,.04)` — hairline cards
- `--shadow-md`: `0 6px 24px rgba(26,46,37,.07), 0 1px 2px rgba(26,46,37,.05)` — default card lift
- `--shadow-lg`: `0 24px 60px rgba(26,46,37,.12), 0 2px 6px rgba(26,46,37,.05)` — hover, feature card

Shadow color is tinted with the ink hue (`rgba(26,46,37,...)`), not neutral black. **Do not switch to black/grey shadows** — the cool-green tint is part of the brand feel.

---

## Components

### Header (sticky)
- `position: sticky; top: 0; z-index: 50`
- Translucent: `background: rgba(244,250,246,.82); backdrop-filter: saturate(140%) blur(14px)`
- Adds bottom border (`--line`) when scrolled (toggled via JS `.scrolled` class)
- Contains: brand mark + name, **section counter** (`01 / 12 · Hero` — desktop only, updates on scroll via IntersectionObserver), nav links, language toggle (EN/ID pill), WhatsApp CTA button with live-dot, mobile menu button
- Collapses to hamburger drawer below 880px

### Brand mark
- 38×38px circle with `background: var(--mint)` and a faint inset shadow `inset 0 -6px 14px rgba(45,107,83,.18)`
- Currently a placeholder SVG (palm-leaf-ish swoosh in forest/mint). **Replace with the final logo SVG when available.**
- Wordmark: `<span>GoClean<em> Group</em></span>` — italic " Group" in sage/mint

### Buttons (.btn variants)
- All buttons: `border-radius: 999px`, `padding: 14px 22px`, `font-weight: 600`, `font-size: 15px`, `line-height: 1`
- Variants:
  - `.btn-primary` — bg `--forest`, text `--paper`, hover bg `--sage`
  - `.btn-ghost` — transparent, text `--forest`, border `rgba(45,107,83,.25)`, hover border `--forest`
  - `.btn-on-dark` — bg `--mint`, text `--forest`, hover bg `#7dd0b5`
  - `.btn-on-dark-ghost` — transparent, white text, white-alpha border
- All have `:active { transform: translateY(1px) }`
- WhatsApp CTAs include a **`.live-dot`** — an 8px green dot with a pulsing CSS shadow (1.8s loop) for a "we're online" signal

### Section counter
Desktop-only widget in the header: `01 / 12 · Hero`. Tracks the most-visible section via IntersectionObserver (thresholds `[0.25, 0.5, 0.75]`, rootMargin `-20% 0px -40% 0px`) and updates the number and section name. Section names are bilingual (`s.en` / `s.id_`).

### Scroll progress bar
Thin bar fixed to top of viewport (`#scrollProgress`), grows in width as the user scrolls (`window.scrollY / (scrollHeight - innerHeight)`).

### Cursor accent
A soft glowing circle that follows the cursor on desktop (fine pointer, no reduced motion). Uses lerp-based smoothing and a hover-affordance "hot" state over interactive elements. Skip this on mobile / coarse pointer / reduced motion.

### Service card (`.service-card`)
- White surface, `--r-lg` (22px), `--shadow-md`
- Icon container: `--mist` background, rounded, ~48–56px square
- Title (h3, serif), body copy, then `.price-line` ("From Rp 150,000 / villa") at the bottom
- 5 cards total: Regular cleaning, Deep cleaning, Exterior glass, Garden care, Pre-opening deep clean

### Compare card (`.compare-card`)
- In the dark section (`#compare`). Two cards side-by-side: Regular vs Deep.
- Deep cleaning is the `.feature` card — slightly larger / more prominent.
- Each has: a `.tag` chip, h3 title, big price, "What's included" list with checkmark bullets, then "Not included" list (muted, with different bullet treatment).
- Checkmark-style bullets, not standard discs.

### Price card (`.price-card`)
- Two stacked in a 2-column grid: "Villa cleaning" (sizes & prices) and "Specialty services" (service & price range).
- Each row: label on left, amount on right, alignment via flexbox `space-between`.
- Below the first card: `.perks` block with two discount rows (15% weekly, 20% monthly) — circular `--mist` chip showing the percentage, then strong title + descriptor.
- Then `.pay-line`: "Pay after, your way:" + two chips ("Cash", "Bank transfer").

### Step (`.step`)
- 4 steps in a row (`.steps` grid). On mobile, single column.
- Each: numbered badge (1–4) in a `--mist` circle, h3 title, body copy.
- "From a message to a clean villa, in four steps."

### Why card (`.why-card`)
- 4 cards in a 2×2 (desktop) or 1×4 (mobile) grid.
- Each: `.why-ico` rounded square w/ icon, h3, body copy.

### Review card (`.review-card`)
- Quote, attribution, optional star row. 6+ Google reviews referenced.
- Pulls names like "Cathy Long", "Christine Wakeham", etc. (full content in source).

### FAQ accordion
- Uses native `<details>` / `<summary>` for `.faq-item`.
- `<summary>` has chevron that rotates on `[open]`.
- Each item has bilingual `data-en` / `data-id` on both question and answer.

### Contact form (`#bookForm`)
- Lives in the dark final-CTA section.
- Fields: name, area (select w/ "Selong Belanak (+Rp 50k)"), villa size (select w/ embedded prices), service (select), preferred date (`type="date"`), preferred time slot (select), free-text notes.
- Submit button is `.btn-on-dark` (mint) with a live-dot.
- **On submit:** prevent default, compose a WhatsApp deep-link with the form values URL-encoded into the `text` query param, then `window.open(url, '_blank')`. **Nothing is sent server-side. No data is stored.** Mention this in the form footer copy (already present).
- The phone number is `+62 878 6457 3925`, formatted in the URL as `https://wa.me/6287864573925?text=...`.

### Mobile drawer
- Off-canvas right panel, 320px wide max 86vw.
- Backdrop `rgba(26,46,37,.5)`, opacity-fade transition 250ms.
- Replaces nav links on small screens; same anchor targets.
- Close on Escape, on backdrop click, and on close-button click.

### Footer
- `--forest` background, white text.
- 4 columns: Brand + tagline + socials | Services | Company | Contact (phone, email, address).
- Socials: WhatsApp, Instagram (`@gocleangroup`), Facebook, Google Maps. All `target="_blank" rel="noopener"`.
- Bottom strip: copyright + small links.

---

## Interactions & Behavior

### Language toggle
- Two pill buttons in the header (`EN` / `ID`) with `data-lang-btn="en|id"`.
- On click, the active class toggles and `document.documentElement.dataset.lang` is set.
- A function (`applyLang`) walks every element with `[data-en]` and `[data-id]` and swaps `textContent` (or value/placeholder for inputs/selects) accordingly.
- **Persisted** to `localStorage` so the choice survives reload. Initial state honors `localStorage` first, then `navigator.language` (default `en`).
- Word-reveal H2s have to be unwrapped before translation and re-wrapped after — see the `h2Cache` logic. Replicate this pattern (cache clean structure, restore on lang change, re-wrap).

### Section counter (header)
- IntersectionObserver across all `[id]` sections; the most-visible one's index updates `#scNum` and name updates `#scName`.

### Scroll-reveal
- `.reveal` and `.reveal-stagger > *` start `opacity: 0` translated 12–20px down.
- IntersectionObserver flips them to `.in` once 20% in view; transitions out over ~600ms with a slight easing curve.
- Staggered children use `transition-delay` proportional to index.

### Word-reveal H2s
- Every `.section-head h2` is wrapped per-word: each word becomes `<span class="w" style="--d: Nms">`.
- When the heading enters the viewport, `.in` is added; the `.w` spans fade-and-translate in sequence (60ms gap).
- Cached structure restores on language change so translations don't break.

### Header on-scroll
- After ~12px of scroll, header gets `.scrolled` (adds bottom border).

### Cursor accent (desktop)
- Soft glowing circle that lerps toward `clientX/Y`.
- Adds `.hot` class when hovering interactive elements (a, button, summary, inputs).
- Skipped entirely on coarse pointer / no-hover / reduced motion.

### FAQ
- Native `<details>` toggle — no custom JS needed.
- Chevron rotates 180° on `[open]` via CSS.

### Animation philosophy
- Everything respects `prefers-reduced-motion: reduce` — see the global rule that nukes all transitions/animations.
- Smooth-scroll for anchor links, also disabled under reduced motion.

---

## State Management

State is **minimal** and entirely client-side:

| State | Storage | Used for |
|---|---|---|
| `language` (`'en'` / `'id'`) | `localStorage` | Active language; applied to all `[data-en]/[data-id]` |
| `activeSectionIdx` | In-memory | Header section counter |
| `headerScrolled` | In-memory (DOM class) | Header border-bottom |
| Mobile drawer open | In-memory (DOM class) | Off-canvas visibility |
| FAQ open items | Native `<details>` | Accordion state |
| Form values | Uncontrolled inputs | Read on submit, encoded into WhatsApp URL |

No backend, no analytics, no cookies, no auth, no DB. The contact form opens WhatsApp; persistence is a non-goal.

---

## Copy & Content

All visible strings are bilingual via `data-en` / `data-id`. **Migrate these as key/value pairs into your i18n library** rather than reproducing the dual-attribute pattern. Suggested key namespace: `nav.*`, `hero.*`, `services.*`, `compare.*`, `pricing.*`, `how.*`, `why.*`, `reviews.*`, `area.*`, `faq.*`, `contact.*`, `footer.*`.

Tone notes for any new copy: **warm, plain, slightly imperfect, locally rooted.** "Three faces every time." "Same team. Honest work." "EN or ID — both work." Avoid corporate boilerplate.

### Key numbers / facts (do not fabricate, these are real)
- Phone: `+62 878 6457 3925` (WhatsApp link: `https://wa.me/6287864573925`)
- Email: `goclean277@gmail.com`
- Location: Kuta, Lombok Tengah
- Hours: Daily, 08.00–18.00
- Reviews: 6+ Google reviews (as of writing)
- Team size: 3 Kuta natives
- Service areas: Kuta, Tanjung Aan, Gerupuk; +Rp 50k surcharge for Selong Belanak
- Google Maps URL: `https://www.google.com/maps/place/Goclean+kuta+lombok/...` (see source for full URL)
- Instagram: `instagram.com/gocleangroup`
- Facebook: `facebook.com/gocleangroup`

### Pricing (don't change without confirming with the client)
- 1-bedroom villa — Rp 150,000
- 2-bedroom villa — Rp 180,000
- 3-bedroom villa — Rp 250,000
- Premium / 4+ bedroom — Rp 450,000
- Deep cleaning — Rp 300,000–600,000 (by size)
- Exterior glass — Rp 100,000 small / Rp 250,000 large or 2-storey
- Garden service — Rp 150,000–300,000 per visit
- Weekly bookings discount: 15%
- Monthly contract discount: 20%
- Selong Belanak transport: +Rp 50,000

---

## Assets

The reference page uses **no local images**. All visuals are CSS or inline SVG icons (Feather-style 1.7 stroke). The only external image URL is the Unsplash photo used for the OG preview meta tag.

**Pending assets the client needs to deliver:**
1. Final logo SVG (currently a placeholder palm-leaf-ish swoosh inside a mint circle).
2. Photography for the `#gallery` section (currently hidden — `display:none`). Likely needs 6–9 images: team in action, villa interiors before/after, the team smiling on-location.
3. A self-hosted OG / Twitter share image at 1200×630 (currently uses an Unsplash URL).
4. Favicon set (not present in the reference).

Icons throughout (header brand, services, why-cards, footer socials, FAQ chevron) are inline SVG. Either keep them inline or move to an icon system the codebase already uses (e.g. `lucide-react`). The stroke width (1.7), linecap (round), linejoin (round) is consistent — preserve that.

---

## Implementation Checklist

- [ ] Set up project structure in target framework (components, pages, public assets).
- [ ] Wire up i18n; port `data-en` / `data-id` pairs to translation files (`en.json`, `id.json`).
- [ ] Bring tokens (colors, fonts, radii, shadows) into the codebase's theme config.
- [ ] Add Google Fonts (Fraunces + Hanken Grotesk) with `display=swap` and preconnect.
- [ ] Build header (with sticky behavior, scroll-state class, section counter, lang toggle, mobile drawer).
- [ ] Build hero with the WhatsApp CTA + "field notes" hero card.
- [ ] Build each section in order; respect alternating bg pattern (cream → paper → forest dark).
- [ ] Hook up scroll-reveal IntersectionObserver (`.reveal`, `.reveal-stagger`, word-reveal H2).
- [ ] Hook up scroll progress bar.
- [ ] Hook up section-active observer for the header counter.
- [ ] Hook up cursor accent (desktop only, respect `(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)`).
- [ ] Build contact form — compose WhatsApp URL from form values, open in new tab.
- [ ] Verify all `prefers-reduced-motion: reduce` paths actually disable motion.
- [ ] Replace logo + OG image + favicon when assets are delivered.
- [ ] Keep `#gallery` stubbed/hidden until photos arrive.
- [ ] Lighthouse pass: target ≥95 on Performance / Accessibility / Best Practices / SEO. No JS framework runtime > 100kb gzipped.
- [ ] Add `sitemap.xml` + `robots.txt`.

---

## Files in This Bundle

- `README.md` — this file
- `design_reference/index.html` — the full HTML prototype (single file, ~2300 lines, vanilla JS + CSS)

The HTML file is the source of truth for exact copy, colors, spacing, and interaction details. When in doubt, read the corresponding section in the reference.
