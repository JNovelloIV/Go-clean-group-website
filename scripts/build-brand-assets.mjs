// Build favicon set + OG image from brand PNGs.
// Run manually whenever the source brand assets change.
//
// Usage:
//   npm install --no-save sharp fontkit png-to-ico
//   node scripts/build-brand-assets.mjs
//
// Inputs:  public/images/mark-gold-no-roots.png (favicons)
//          public/images/mark-gold.png          (OG image)
//          public/images/horizontal-dark.png    (lockup, dark-fill bg)
//          public/fonts/cormorant-garamond.woff2 (OG tagline)
// Outputs: public/{favicon-16.png,favicon-32.png,favicon.ico,
//                  apple-touch-icon.png,og-image.png}
//          public/images/horizontal-dark-transparent.png
//            (chromakeyed version: dark-forest fill removed for use on
//             non-dark surfaces, e.g. the nav over a cream section)

import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import pngToIco from 'png-to-ico';

const FOREST = '#1A3514';
const CREAM  = '#F5F0E3';

const SRC = {
  noRoots: 'public/images/mark-gold-no-roots.png',
  full:    'public/images/mark-gold.png',
};

// ---------- Favicons ----------
// Square fit, transparent for PNG/ICO; deep-forest bg for apple-touch-icon
async function buildFavicons() {
  const sizes = [16, 32];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(SRC.noRoots)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    writeFileSync(`public/favicon-${size}.png`, buf);
    pngBuffers.push(buf);
    console.log(`✓ favicon-${size}.png`);
  }

  // Apple touch icon — solid forest bg (iOS handles transparency badly)
  await sharp(SRC.noRoots)
    .resize(160, 160, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: 10, bottom: 10, left: 10, right: 10,
      background: FOREST,
    })
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ apple-touch-icon.png (180x180, on forest)');

  // Multi-resolution favicon.ico (16+32)
  const icoBuf = await pngToIco(pngBuffers);
  writeFileSync('public/favicon.ico', icoBuf);
  console.log('✓ favicon.ico (16+32)');
}

// ---------- Render text to SVG path via fontkit ----------
function renderTextPath(fontPath, text, fontSize) {
  const font = fontkit.openSync(fontPath);
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(text);
  let x = 0;
  const parts = [];
  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i];
    const pos = run.positions[i];
    if (glyph.path && glyph.path.commands.length > 0) {
      // fontkit uses y-up; SVG y-down. Scale path and translate.
      const transformed = glyph.path.scale(scale, -scale).translate(x, 0);
      parts.push(transformed.toSVG());
    }
    x += pos.xAdvance * scale;
  }
  return { d: parts.join(' '), width: x };
}

// ---------- OG image ----------
async function buildOg() {
  const W = 1200, H = 630;
  const TAGLINE = 'A place being built, with intention.';
  const FONT_SIZE = 42;

  // Mark — scale full mark with roots into ~58% of canvas height
  const markTargetH = 360;
  const markMeta = await sharp(SRC.full).metadata();
  const markTargetW = Math.round(markTargetH * (markMeta.width / markMeta.height));
  const markBuf = await sharp(SRC.full)
    .resize(markTargetW, markTargetH, { fit: 'inside' })
    .png()
    .toBuffer();

  // Tagline — render via fontkit to SVG path
  const { d, width: textW } = renderTextPath(
    'public/fonts/cormorant-garamond.woff2',
    TAGLINE,
    FONT_SIZE
  );

  // Vertical layout (centered as a stack):
  //   mark top -> mark bottom -> gap -> text baseline
  const gap = 70;
  const textVisualH = FONT_SIZE * 0.78;       // approx cap-to-baseline
  const stackH = markTargetH + gap + textVisualH;
  const stackTop = Math.round((H - stackH) / 2);
  const markY = stackTop;
  const textBaselineY = stackTop + markTargetH + gap + textVisualH;

  // SVG holding just the text path (so we composite as one layer)
  const textSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <g transform="translate(${(W - textW) / 2}, ${textBaselineY})">
    <path d="${d}" fill="${CREAM}"/>
  </g>
</svg>`);

  await sharp({
    create: {
      width: W, height: H, channels: 3,
      background: FOREST,
    },
  })
    .composite([
      { input: markBuf, left: Math.round((W - markTargetW) / 2), top: markY },
      { input: textSvg, left: 0, top: 0 },
    ])
    .png()
    .toFile('public/og-image.png');
  console.log(`✓ og-image.png (${W}x${H}, mark ${markTargetW}x${markTargetH}, text ${Math.round(textW)}px wide)`);
}

// ---------- Lockup chromakey ----------
// horizontal-dark.png ships with a solid #1A3514 (deep-forest) fill
// behind the glyphs. On dark sections that's invisible; on cream
// sections (Production, share, BigQuote) the fill creates a visible
// rectangular boundary against the nav's color-mix(deep-forest 88%, T)
// surface. Generate a transparent-bg variant alongside the original.
async function buildTransparentLockup() {
  const SRC = 'public/images/horizontal-dark.png';
  const OUT = 'public/images/horizontal-dark-transparent.png';
  const BG = [26, 53, 20]; // #1A3514

  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);

  // Smooth chromakey + de-spill:
  //   alpha rises from 0 to 255 as the pixel diverges from BG.
  //   Edge pixels get the bg contribution subtracted out so they
  //   don't carry a green tint when composited on cream.
  const TRANSPARENT_BELOW = 12;   // dist <= this → fully transparent
  const OPAQUE_ABOVE      = 70;   // dist >= this → fully opaque
  const SPAN              = OPAQUE_ABOVE - TRANSPARENT_BELOW;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dr = r - BG[0], dg = g - BG[1], db = b - BG[2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    let alpha;
    if (dist <= TRANSPARENT_BELOW)      alpha = 0;
    else if (dist >= OPAQUE_ABOVE)      alpha = 255;
    else                                alpha = Math.round(((dist - TRANSPARENT_BELOW) / SPAN) * 255);

    if (alpha === 0) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
    } else if (alpha === 255) {
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255;
    } else {
      // Edge: rendered = α·fg + (1-α)·bg → fg = (rendered - (1-α)·bg) / α
      const af = alpha / 255;
      const inv = 1 - af;
      const cleanR = Math.max(0, Math.min(255, (r - inv * BG[0]) / af));
      const cleanG = Math.max(0, Math.min(255, (g - inv * BG[1]) / af));
      const cleanB = Math.max(0, Math.min(255, (b - inv * BG[2]) / af));
      out[i] = Math.round(cleanR);
      out[i + 1] = Math.round(cleanG);
      out[i + 2] = Math.round(cleanB);
      out[i + 3] = alpha;
    }
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(OUT);
  console.log(`✓ horizontal-dark-transparent.png (${info.width}x${info.height}, dark-forest fill keyed out + de-spilled)`);
}

await buildFavicons();
await buildOg();
await buildTransparentLockup();
console.log('Done.');
