/**
 * Inlet Move v2 — stock photo acquisition script
 *
 * Downloads curated Pexels photos (public CDN URLs) and emits AVIF + WebP +
 * JPEG renditions sized for v2 marketing-site usage. No API key required —
 * the URLs are direct CDN hits (Pexels permits this for license-compliant
 * downloads with attribution maintained in the credit register below).
 *
 * Run from repo root:   node apps/marketing/scripts/fetch-stock.mjs
 * Or from apps/marketing: node scripts/fetch-stock.mjs
 *
 * Idempotent: skips already-downloaded raws and already-processed renditions.
 *
 * Output layout:
 *   apps/marketing/public/images/stock/raw/<name>.jpg          (original from Pexels)
 *   apps/marketing/public/images/stock/<name>-{1280,1920}.{avif,webp,jpg}  (responsive)
 *   apps/marketing/public/images/maya/scene-{1..5}-...jpg / .webp / .avif  (placeholders)
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MARKETING_ROOT = resolve(__dirname, '..');
const STOCK_DIR = join(MARKETING_ROOT, 'public', 'images', 'stock');
const STOCK_RAW = join(STOCK_DIR, 'raw');
const MAYA_DIR = join(MARKETING_ROOT, 'public', 'images', 'maya');
const HOOD_DIR = join(MARKETING_ROOT, 'public', 'images', 'neighborhoods');

const PEXELS_CDN = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;

/**
 * Curated picks. Each entry:
 *   id        — Pexels photo ID (verified via search 2026-04-27)
 *   name      — output basename (kebab-case)
 *   target    — 'stock' | 'maya' | 'hood'
 *   alt       — narrative description of what the photo actually shows
 *   widths    — responsive widths to emit (defaults to [1280, 1920])
 *   credit    — photographer or 'pexels-public' for attribution register
 */
const PICKS = [
  // — Cargo / vans —
  { id: 4620555,  name: 'cargo-van-urban',     target: 'stock', alt: 'White cargo vans parked on a city street under daylight.', credit: 'Pexels public CDN' },
  { id: 32976307, name: 'delivery-van-sunny',  target: 'stock', alt: 'White delivery van on a sunlit suburban street.', credit: 'Pexels public CDN' },
  { id: 7843987,  name: 'van-interior-boxes',  target: 'stock', alt: 'Brown cardboard boxes loaded inside a delivery van.', credit: 'Pexels public CDN' },

  // — Crew / carrying —
  { id: 7464244,  name: 'crew-carrying',       target: 'stock', alt: 'Two movers carrying cardboard boxes in a bright room with large windows.', credit: 'Pexels public CDN' },
  { id: 7464702,  name: 'fragile-box',         target: 'stock', alt: 'Hands holding a cardboard box labeled fragile, indicating careful handling during a move.', credit: 'Pexels public CDN' },
  { id: 7464687,  name: 'movers-uniform',      target: 'stock', alt: 'Two movers in matching uniforms carrying boxes inside a bright new home.', credit: 'Pexels public CDN' },

  // — Boxes / room atmospherics —
  { id: 4568698,  name: 'boxes-doorway',       target: 'stock', alt: 'Stack of cardboard boxes by a white wooden door, ready for moving day.', credit: 'Pexels public CDN' },
  { id: 4569338,  name: 'boxes-sunlit-room',   target: 'stock', alt: 'Stack of moving boxes in a sunlit room, signalling a fresh start in a new apartment.', credit: 'Pexels public CDN' },
  { id: 7464509,  name: 'box-bedroom-label',   target: 'stock', alt: 'Cardboard box labeled "Bedroom" placed indoors, ready for moving.', credit: 'Pexels public CDN' },

  // — Vancouver scenery —
  { id: 29072584, name: 'vancouver-skyline',   target: 'stock', alt: 'Vancouver skyline with the North Shore mountains and harbour marina visible behind glass towers.', credit: 'Pexels public CDN' },
  { id: 21837543, name: 'north-van-mountains', target: 'stock', alt: 'North Vancouver waterfront positioned between coastal mountains and the inlet.', credit: 'Pexels public CDN' },
  { id: 30996166, name: 'west-van-mist',       target: 'stock', alt: 'Misty layered mountains rising above West Vancouver in soft daylight.', credit: 'Pexels public CDN' },

  // — Senior + family —
  { id: 8871545,  name: 'senior-couple',       target: 'stock', alt: 'Senior couple seated together at home, calm and at ease.', credit: 'Pexels public CDN' },
  { id: 7464495,  name: 'couple-moving-in',    target: 'stock', alt: 'Couple smiling while carrying moving boxes into their new home.', credit: 'Pexels public CDN' },
  { id: 4554235,  name: 'couple-unpacking',    target: 'stock', alt: 'Couple seated on the floor of their new home unpacking cardboard boxes in the kitchen.', credit: 'Pexels public CDN' },

  // — Maya placeholders (per overnight Override 2 — NOT real Maya) —
  // Alt text deliberately describes the photo, never claims this is the named persona.
  {
    id: 12911771, name: 'scene-1-form', target: 'maya',
    alt: 'Customer at home seated at a wooden desk with an open laptop, soft daylight, plants in soft focus — placeholder editorial photo; AI-generated Maya character lands in a follow-up session.',
    credit: 'Pexels public CDN',
  },
  {
    id: 7705916, name: 'scene-2-photo-scan', target: 'maya',
    alt: 'Customer at home holding a smartphone in a bright living room — placeholder editorial photo; AI-generated Maya character lands in a follow-up session.',
    credit: 'Pexels public CDN',
  },
  {
    id: 9052124, name: 'scene-3-quote-received', target: 'maya',
    alt: 'Customer seated on a sofa looking at a smartphone, calm afternoon daylight — placeholder editorial photo; AI-generated Maya character lands in a follow-up session.',
    credit: 'Pexels public CDN',
  },
  {
    id: 7464495, name: 'scene-4-move-day', target: 'maya',
    alt: 'Customer at the doorway of a new home holding moving boxes — placeholder editorial photo; AI-generated Maya character lands in a follow-up session.',
    credit: 'Pexels public CDN',
  },
  {
    id: 4554238, name: 'scene-5-settled', target: 'maya',
    alt: 'Customer in a new apartment with cardboard boxes around her, beginning to settle in — placeholder editorial photo; AI-generated Maya character lands in a follow-up session.',
    credit: 'Pexels public CDN',
  },
];

const OUT_DIRS = { stock: STOCK_DIR, maya: MAYA_DIR, hood: HOOD_DIR };

const RESPONSIVE_WIDTHS = [1280, 1920];

async function ensureDir(p) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function fetchToBuffer(url) {
  const res = await fetch(url, {
    headers: {
      // Pexels returns a denial without a UA header.
      'User-Agent': 'inletmove-marketing/2.0 (https://inletmove.ca; +static-marketing-build)',
      'Accept': 'image/jpeg,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`Tiny file (${buf.length} B) — likely an error page, not an image: ${url}`);
  return buf;
}

async function processOne(pick) {
  const outDir = OUT_DIRS[pick.target];
  await ensureDir(outDir);
  await ensureDir(STOCK_RAW);

  const rawPath = join(STOCK_RAW, `${pick.id}-${pick.name}.jpg`);

  // Download original if missing
  let raw;
  if (existsSync(rawPath)) {
    raw = await sharp(rawPath).toBuffer();
    process.stdout.write(`  [cache] ${pick.name}\n`);
  } else {
    process.stdout.write(`  [fetch] ${pick.name} (id=${pick.id})\n`);
    raw = await fetchToBuffer(PEXELS_CDN(pick.id));
    await writeFile(rawPath, raw);
  }

  // Emit responsive renditions
  for (const w of RESPONSIVE_WIDTHS) {
    const base = pick.target === 'maya' ? pick.name : pick.name;
    const targets = [
      { ext: 'jpg',  pipeline: (s) => s.jpeg({ quality: 80, progressive: true, mozjpeg: true }) },
      { ext: 'webp', pipeline: (s) => s.webp({ quality: 78 }) },
      { ext: 'avif', pipeline: (s) => s.avif({ quality: 55, effort: 4 }) },
    ];
    for (const { ext, pipeline } of targets) {
      const outFile = join(outDir, `${base}-${w}.${ext}`);
      if (existsSync(outFile)) continue;
      const pipe = sharp(raw).resize({ width: w, withoutEnlargement: true });
      const buf = await pipeline(pipe).toBuffer();
      await writeFile(outFile, buf);
    }
  }

  // Emit a single non-responsive default jpg at 1920w for fallback alt usage
  if (pick.target === 'maya') {
    const fallback = join(outDir, `${pick.name}.jpg`);
    if (!existsSync(fallback)) {
      const buf = await sharp(raw).resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer();
      await writeFile(fallback, buf);
    }
  }
}

async function writeCreditRegister() {
  const path = join(STOCK_DIR, 'CREDITS.md');
  const lines = [
    '# Stock photography credit register',
    '',
    '> Inlet Move marketing site v2 polish. All images sourced from Pexels public',
    '> CDN under the [Pexels License](https://www.pexels.com/license/) which permits',
    '> commercial and non-commercial use without attribution. We credit anyway.',
    '',
    '| Pexels ID | File basename | Target slot | Description |',
    '|---|---|---|---|',
    ...PICKS.map(
      (p) => `| ${p.id} | \`${p.name}\` | \`${p.target}\` | ${p.alt.replace(/\|/g, '\\|')} |`,
    ),
    '',
    '_Last updated: 2026-04-27 by autonomous v2 polish session._',
    '',
  ];
  await writeFile(path, lines.join('\n'));
}

async function main() {
  console.log('— Inlet Move v2 stock photography fetcher —');
  console.log(`  Marketing root: ${MARKETING_ROOT}`);
  console.log(`  Picks: ${PICKS.length}\n`);

  for (const pick of PICKS) {
    try {
      await processOne(pick);
    } catch (err) {
      console.error(`  [error] ${pick.name}: ${err.message}`);
    }
  }

  await writeCreditRegister();
  console.log('\nDone. Credit register at apps/marketing/public/images/stock/CREDITS.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
