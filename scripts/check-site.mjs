// Whole-site check on the built dist/. Plain node, no packages.
// Usage: npm run build && npm run check
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const SITE_HOST = "gocleangroup.com";
const ALLOWED = [
  "wa.me", "instagram.com", "facebook.com", "maps.google.com", "goo.gl", "g.page",
  "google.com", "g.co", "maps.app.goo.gl", "search.google.com",
  "fonts.googleapis.com", "fonts.gstatic.com", "www.w3.org", SITE_HOST,
];
const hostOk = (h) => ALLOWED.some((a) => h === a || h.endsWith("." + a));

// BOOKING_URL is read from src/config.ts (single source).
const cfg = readFileSync(new URL("../src/config.ts", import.meta.url), "utf8");
const m = cfg.match(/BOOKING_URL:\s*string\s*\|\s*null\s*=\s*(null|"([^"]+)")/);
if (!m) { console.error("FAIL: cannot read BOOKING_URL from src/config.ts"); process.exit(1); }
const bookingUrl = m[2] ?? null;
const bookingHost = bookingUrl ? new URL(bookingUrl).host : null;

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const pages = walk(DIST).filter((f) => f.endsWith(".html"));
if (!pages.length) { console.error("FAIL: no HTML in dist/. Run npm run build first."); process.exit(1); }

const errors = [];
for (const file of pages) {
  const rel = file.slice(DIST.length);
  const html = readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((x) => x[1]));
  const hrefs = [...html.matchAll(/<a\b[^>]*?\shref=["']([^"']*)["']/g)].map((x) => x[1]);

  for (const h of hrefs) {
    if (h.startsWith("#")) {
      if (h.length > 1 && !ids.has(h.slice(1))) errors.push(`${rel}: anchor ${h} has no target`);
    } else if (/^https?:\/\//.test(h)) {
      const host = new URL(h).host;
      if (!hostOk(host) && host !== bookingHost) errors.push(`${rel}: link to disallowed host ${host} (${h})`);
    }
  }
  const text = html.toLowerCase();
  for (const bad of ["bukti transfer", "proof of payment", "payment proof"]) {
    if (text.includes(bad)) errors.push(`${rel}: contains "${bad}"`);
  }
  const bookLinks = hrefs.filter((h) => /\/book(\/|\?|#|$)/.test(h) && /^https?:/.test(h));
  if (!bookingUrl && (bookLinks.length || /id=["']book["']/.test(html)))
    errors.push(`${rel}: booking link/section present while BOOKING_URL is null`);
  if (bookingUrl && !bookLinks.some((h) => h.startsWith(bookingUrl)))
    errors.push(`${rel}: BOOKING_URL set but no booking link found`);
}

if (errors.length) { console.error(errors.map((e) => "FAIL: " + e).join("\n")); process.exit(1); }
console.log(`OK: ${pages.length} page(s) checked. BOOKING_URL=${bookingUrl ?? "null"}`);
