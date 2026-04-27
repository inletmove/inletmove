/**
 * Inlet Move v2 — per-page Open Graph image generator.
 *
 * Renders 1200×630 PNG OG cards via SVG → sharp. One per page, plus a
 * default. Uses brand tokens from tailwind.config.ts (paper, ember,
 * pacific, inlet-deep) inline.
 *
 * Run from repo root:   node apps/marketing/scripts/generate-og.mjs
 *
 * Output: apps/marketing/public/og/<slug>.png
 *
 * Tweak the CARDS array to add new pages; each entry produces one .png.
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MARKETING_ROOT = resolve(__dirname, '..');
const OG_DIR = join(MARKETING_ROOT, 'public', 'og');

async function loadNeighborhoods() {
  const path = join(MARKETING_ROOT, 'src', 'content', 'neighborhoods.json');
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw).neighborhoods.filter((n) => n.active);
}

const STATIC_CARDS = [
  {
    slug: 'default',
    eyebrow: 'INLET MOVE CO.',
    title: 'Moving in Metro Vancouver,',
    titleEm: 'with care.',
    subtitle: '$150/hr · $300 minimum · Same-week local moves',
  },
  {
    slug: 'home',
    eyebrow: 'INLET MOVE CO.',
    title: 'Moving in Metro Vancouver,',
    titleEm: 'with care.',
    subtitle: 'Quote in 60 seconds. Real human follow-up within the hour.',
  },
  {
    slug: 'quote',
    eyebrow: 'GET A MOVING QUOTE',
    title: 'A moving quote in',
    titleEm: '60 seconds.',
    subtitle: 'Hourly billing from $150/hr · $300 minimum · same-week available',
  },
  {
    slug: 'about',
    eyebrow: 'ABOUT INLET MOVE CO.',
    title: 'Vancouver-based.',
    titleEm: 'Built on three ideas.',
    subtitle: 'Honest pricing · Careful handling · Complete documentation',
  },
  {
    slug: 'movers',
    eyebrow: 'SERVICE AREA',
    title: 'Where we',
    titleEm: 'work.',
    subtitle: 'Vancouver · Burnaby · Richmond · Surrey · North Van · Coquitlam',
  },
  {
    slug: 'colophon',
    eyebrow: 'COLOPHON',
    title: 'How this site',
    titleEm: 'was built.',
    subtitle: 'Powered by MoverOS · Advertised by Demandra',
  },
  {
    slug: 'thanks',
    eyebrow: 'QUOTE RECEIVED',
    title: 'Got it.',
    titleEm: 'Thank you.',
    subtitle: 'A real human follows up within the hour.',
  },
  {
    slug: 'legal-privacy',
    eyebrow: 'LEGAL · PRIVACY',
    title: 'Privacy policy',
    titleEm: '',
    subtitle: 'How Inlet Move Co. handles your information.',
  },
  {
    slug: 'legal-terms',
    eyebrow: 'LEGAL · TERMS',
    title: 'Terms of service',
    titleEm: '',
    subtitle: 'The rules of working with Inlet Move Co.',
  },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Render a 1200×630 SVG OG card. Title + italic accent + subtitle. */
function buildSvg({ eyebrow, title, titleEm, subtitle }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050810"/>
      <stop offset="100%" stop-color="#0E1F36"/>
    </linearGradient>
    <radialGradient id="g1" cx="0.25" cy="0.3" r="0.5">
      <stop offset="0%" stop-color="#1F7A8C" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#1F7A8C" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="0.85" cy="0.85" r="0.4">
      <stop offset="0%" stop-color="#E76F51" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#E76F51" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>

  <!-- Brand mark -->
  <g transform="translate(70, 60)">
    <text x="0" y="0" font-family="Hanken Grotesk, system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="600" letter-spacing="3" fill="#B8BCC2">
      INLET MOVE CO.
    </text>
    <line x1="0" y1="14" x2="48" y2="14" stroke="#E76F51" stroke-width="2"/>
  </g>

  <!-- Eyebrow -->
  <text x="70" y="240" font-family="Hanken Grotesk, system-ui, -apple-system, sans-serif"
        font-size="20" font-weight="600" letter-spacing="4" fill="#1F7A8C">
    ${escapeXml(eyebrow)}
  </text>

  <!-- Title (regular) -->
  <text x="70" y="320" font-family="Fraunces, Georgia, serif"
        font-size="78" font-weight="500" fill="#F4F1ED">
    ${escapeXml(title)}
  </text>

  <!-- Title accent (italic) -->
  ${titleEm
    ? `<text x="70" y="410" font-family="Fraunces, Georgia, serif"
              font-size="78" font-style="italic" font-weight="500" fill="#F5A48F">
         ${escapeXml(titleEm)}
       </text>`
    : ''}

  <!-- Subtitle -->
  <text x="70" y="${titleEm ? 478 : 388}" font-family="Hanken Grotesk, system-ui, -apple-system, sans-serif"
        font-size="24" font-weight="400" fill="#B8BCC2">
    ${escapeXml(subtitle)}
  </text>

  <!-- Footer rule + handle -->
  <line x1="70" y1="546" x2="1130" y2="546" stroke="#1F4D7A" stroke-width="1"/>
  <text x="70" y="582" font-family="JetBrains Mono, SF Mono, monospace"
        font-size="16" font-weight="500" letter-spacing="1" fill="#6B7080">
    inletmove.ca · $150/hr · $300 min · same-week local moves
  </text>
</svg>`;
}

async function ensureDir(p) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function renderCard(card) {
  const svg = buildSvg(card);
  const png = await sharp(Buffer.from(svg))
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  const out = join(OG_DIR, `${card.slug}.png`);
  await writeFile(out, png);
  return out;
}

async function main() {
  console.log('— Inlet Move v2 OG image generator —');
  await ensureDir(OG_DIR);

  const neighborhoods = await loadNeighborhoods();

  // Static cards
  for (const card of STATIC_CARDS) {
    const out = await renderCard(card);
    console.log(`  [og] ${card.slug}.png — ${out}`);
  }

  // Per-neighborhood cards
  for (const n of neighborhoods) {
    const card = {
      slug: n.slug,
      eyebrow: `MOVERS IN ${n.region.toUpperCase()}`,
      title: `Movers in`,
      titleEm: n.display_name,
      subtitle: `${n.city} · $150/hr · $300 minimum · same-week available`,
    };
    const out = await renderCard(card);
    console.log(`  [og] ${n.slug}.png — ${out}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
