# The Hill — Claude Code Build Brief

## What this is

A handoff brief for building **The Hill's** website in production code, based on a finalized design and copy doc.

Use this brief alongside two other inputs:
1. **`the-hill-copy-working-doc.md`** — the canonical source of truth for every word on the site, every design decision, and every TODO. Read this first.
2. **The Claude Design export** — the visual reference. The user can either share a fresh HTML export from Claude Design or screenshots, depending on what's most current.

## Project goals

Build a single-page website (homepage only, for v1) that:
- Faithfully translates the Claude Design visual into clean, performant production code.
- Uses real, modern frameworks and is deployable to a static host (Netlify, Vercel, or Cloudflare Pages).
- Wires the dual-channel signup form (email or WhatsApp) to a third-party form provider.
- Is responsive on mobile (most likely traffic source — Instagram referrals on phones).
- Is accessible (WCAG AA at minimum, body text contrast checked).
- Is owned by the user as a real codebase they can iterate on with Claude Code in future sessions.

This is not a CMS-driven site. Content is in code. When the user wants to add a real "Letters" section in future, that's a separate session.

## Recommended stack

The recommended stack for this project, in order of preference:

1. **Astro** — best fit. Static-first, minimal JS, excellent typography handling, supports MDX if Letters become a thing later. Easy to deploy.
2. **Next.js (App Router, static export)** — overkill for v1 but more familiar to developers if the user later hires one.
3. **Plain HTML + CSS + a tiny bit of JS** — simplest, no build step. Acceptable but loses long-term iteration ergonomics.

Default to Astro unless the user requests otherwise.

## Design fidelity requirements

The Claude Design output is the visual specification. Match it precisely:

- **Typography**: serif display (likely Cormorant or similar) for headlines, with the italic gold treatment on emphasized words. Body copy in a complementary system or sans face.
- **Color tokens**:
  - Deep Forest (background): the dark green used everywhere
  - Harvest Gold: the gold used for italic emphasis and accents
  - Sage tones: for body copy on dark backgrounds and secondary labels
  - Light/cream tones: for any light-mode sections (the Production "Sharing the abundance" panel renders on a light background per recent screenshots)
- Confirm exact hex values from the Claude Design export's CSS variables — don't approximate.
- **Layout**: viewport-relative spacing in the hero so it compresses gracefully on laptops (the meta row must stay above the fold on a 1366×768 viewport).
- **Animations**: minimal. The brand voice is restrained. A subtle reveal-on-scroll for sections is fine. No parallax, no auto-playing video, no aggressive hover states.

## Site structure

Sections in order, top to bottom (per the working doc):

1. **Navigation** — sticky or static, designer's call. Items: Why · The Farm · Building · The Land · Letters (Letters is conditional — see "Letters section" below). CTA: "Follow the Hill" linking to Subscribe.
2. **Hero** — eyebrow + headline + meta row + scroll cue. Headline has italic gold treatment on "disconnected" and "our answer." Meta row third column ("Slowly, slowly, then all at once") is italic gold and weighted ~50% of row width.
3. **Manifesto** — four paragraphs, italic emphasis preserved per the doc.
4. **Locate** — eyebrow + headline + 2 body paragraphs + 3-column meta row + island map (left side on desktop, stacked above text on mobile).
5. **Production ("The Farm")** — eyebrow + headline + intro + four panels (garden, forest, ponds, animals) + visual break + "Sharing the abundance" closing block (mini-headline + lead + two rows + closing line).
6. **Building** — headline + intro + 5 numbered rows.
7. **Gallery** — headline + caption + 6 images with captions. Note image 6 may be a styled placeholder.
8. **Letters** — see "Letters section" below.
9. **Big Quote** — gold quote mark + two-line italic quote, no attribution.
10. **Subscribe ("Stay close")** — eyebrow + headline + lead + dual-channel form + Instagram CTA + fine print.
11. **Footer** — wordmark + tagline + links + copyright + meta line.

## Letters section

Per the working doc, the Letters section is **deferred** — the user is writing the first real letter separately and the previous featured-post content was a Claude Design fabrication.

For v1 launch, do one of:
- **Hide the section entirely** — remove from nav and footer too. Simplest. Recommended if the user hasn't published a first letter yet.
- **Render a stripped section** — eyebrow + headline + intro paragraph only, with the featured post block removed. Use if the user wants the section visible as a placeholder for "letters coming."

Ask the user which they prefer at session start.

## Form implementation — most important task

The Subscribe form is the one piece of real interactivity on the site. Treat it carefully.

### Required behavior

- **Channel chooser** at the top: two options, [Email] | [WhatsApp]. One must be selected; default Email.
- **Conditional contact field** below the chooser:
  - If Email: standard email input, validated for format.
  - If WhatsApp: phone number input with country code selector, default +62 (Indonesia), supports international codes.
- **Two optional chip groups** (multi-select):
  - Q1 "I am..." — 5 options
  - Q2 "I'm drawn to..." — 5 options
- Submit button disabled until the contact field has a valid value. Chips never gate submission.

### Backend

The user has not yet committed to a specific form provider. Recommend one of these and let them choose:

- **Tally** — supports conditional logic, free tier generous, easy webhook routing.
- **Fillout** — similar to Tally, slightly more polished.
- **Formspark** — simpler, posts to a webhook of your choice.
- **Custom Cloudflare Worker / Vercel Function** — most flexible but requires the user to manage the endpoint.

For Phase 1 — and this is per the working doc — submissions can route to a Google Sheet or Airtable. Email signups get manually added to an ESP (Buttondown, Beehiiv, or MailerLite). WhatsApp signups get manually added to a WhatsApp Business app broadcast list on the team's phone. No fancy WhatsApp API tool until the list is large enough to need one (~150+ contacts).

Build the form so the submit handler produces this shape:

```json
{
  "channel": "email" | "whatsapp",
  "contact": "string",
  "i_am": ["array of selected Q1 values"],
  "drawn_to": ["array of selected Q2 values"],
  "submitted_at": "ISO timestamp"
}
```

Then post that to whatever endpoint the user picks.

### Microcopy

All form copy is in the working doc, Section 9 (Subscribe). Use it verbatim.

## Assets needed

The user needs to provide before code can fully ship:

- **Logo SVG** — current mushroom-with-roots mark, or a replacement if they decide to swap it.
- **Photography** — the gallery images and any photos used in Production. Real, sized, optimized.
- **Favicon** — usually forgotten. Generate from the logo.
- **OG image** — for social sharing previews. Recommend a hero crop with the headline and a subtle background.

If assets aren't available at build time, use clearly-labeled placeholders with the file path the developer expects, e.g. `/public/images/gallery/01-flock-mid-morning.jpg`.

## Accessibility checklist

- All images have meaningful alt text (working doc has alt text written for the gallery).
- Body-copy contrast on dark backgrounds meets WCAG AA. The previous Claude Design build had a contrast bug on the Locate body copy — verify this doesn't carry over.
- Form labels are properly associated with their inputs (`<label for="">` or wrapping).
- The site is keyboard-navigable through nav, form, and any links.
- Reduced-motion media query respected (any reveal-on-scroll animations should disable when `prefers-reduced-motion: reduce`).

## SEO basics

- `<title>`: "The Hill — a place being built, with intention."
- Meta description: derived from the hero eyebrow + headline.
- OG title, OG description, OG image: same as above plus image.
- `lang="en"` on html.
- Sitemap (Astro generates this automatically with the right integration).

## Domain & deploy

- Domain: `thehill.id` (per the email in the footer — confirm with user).
- Deploy target: user's preference. Recommend **Cloudflare Pages** or **Netlify** for static-first hosting with form handling. Both have free tiers more than sufficient for this scale of traffic.

## Out of scope for v1

- Multi-page site (no /letters, /about, /contact pages — those come later).
- CMS for letters (later).
- E-commerce / produce ordering (later, after weekly bags become a real thing).
- Booking flow for long-table dinners (later — for v1 this is handled via the Subscribe list).
- Multilingual (English only for v1; the audience is bilingual but the site doesn't need to be at launch).

## Working sequence

A reasonable order for the build session:

1. Read the working doc end-to-end. Read this brief. Confirm understanding with the user.
2. Confirm: stack choice (Astro?), Letters section disposition (hide or strip?), form provider (Tally? Fillout? Custom?).
3. Scaffold the project, set up design tokens, install fonts.
4. Build top-to-bottom: nav → hero → manifesto → locate → production → building → gallery → (letters?) → big quote → subscribe → footer.
5. Wire the form to the chosen provider.
6. QA: contrast, mobile, keyboard, reduced-motion.
7. Configure deploy target.
8. Hand back a working URL.

## What to bring back to the user

- A live deployable site at a temporary URL.
- The full repo structure documented.
- A short README explaining how to update copy in the future.
- A list of what's still TODO before they point a real domain at it.

## Tone for the session

The user has spent significant time getting the copy and design exactly right. They will be sensitive to "improvements" that aren't asked for — don't paraphrase locked copy, don't substitute fonts to be helpful, don't add features that weren't requested. The voice is restrained on purpose. Match that posture in the build.
