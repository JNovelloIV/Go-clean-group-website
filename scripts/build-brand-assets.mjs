// Build favicon set + OG image from brand PNGs.
// Run manually whenever the source brand assets change.
//
// Usage:
//   npm install --no-save sharp fontkit png-to-ico
//   node scripts/build-brand-assets.mjs
//
// Inputs:  public/images/mark-gold-no-roots.png (favicons)
//          public/images/mark-gold.png          (OG image)
//          public/fonts/cormorant-garamond.woff2 (OG tagline)
// Outputs: public/{favicon-16.png,favicon-32.png,favicon.ico,
//                  apple-touch-icon.png,og-image.png}

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

await buildFavicons();
await buildOg();
console.log('Done.');
