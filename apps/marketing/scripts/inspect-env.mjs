/**
 * One-shot env inspector — reads .env.local, validates each value's shape
 * WITHOUT ever logging the password value.
 *
 * Run from apps/marketing: node scripts/inspect-env.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env.local');

const raw = readFileSync(ENV_PATH);
const text = raw.toString('utf-8');

console.log('--- file metadata ---');
console.log(`  total bytes: ${raw.length}`);
console.log(`  line endings: ${text.includes('\r\n') ? 'CRLF' : (text.includes('\n') ? 'LF' : 'none')}`);
console.log(`  starts with BOM: ${raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf}`);
console.log(`  starts with UTF-16 BOM: ${(raw[0] === 0xff && raw[1] === 0xfe) || (raw[0] === 0xfe && raw[1] === 0xff)}`);

const lines = text.split(/\r?\n/);
console.log('\n--- per-line shape (masked values) ---');
for (const [i, line] of lines.entries()) {
  if (!line.trim()) continue;
  const eqIdx = line.indexOf('=');
  if (eqIdx < 0) {
    console.log(`  L${i + 1}: malformed (no =): ${JSON.stringify(line)}`);
    continue;
  }
  const key = line.slice(0, eqIdx);
  const value = line.slice(eqIdx + 1);

  // Detect suspicious chars in the VALUE (last char especially)
  const lastByte = Buffer.from(value).slice(-1)[0];
  const hasTrailingCR = lastByte === 0x0d;
  const hasTrailingLF = lastByte === 0x0a;
  const hasTrailingSpace = lastByte === 0x20;
  const hasTrailingTab = lastByte === 0x09;

  // Detect suspicious chars anywhere in the value (printable-ASCII test)
  const suspicious = [];
  for (const b of Buffer.from(value)) {
    if (b < 0x20 || b > 0x7e) suspicious.push(`0x${b.toString(16).padStart(2, '0')}`);
  }

  if (key === 'HOSTINGER_PASSWORD') {
    console.log(
      `  L${i + 1}: ${key}=<${value.length} chars, ` +
        `trailingCR=${hasTrailingCR} trailingLF=${hasTrailingLF} ` +
        `trailingSpace=${hasTrailingSpace} trailingTab=${hasTrailingTab} ` +
        `nonAsciiBytes=[${suspicious.join(',') || 'none'}]>`,
    );
  } else {
    // Other keys — print value (no secrets here) plus shape diagnostics
    console.log(
      `  L${i + 1}: ${key}=${JSON.stringify(value)} ` +
        `(trailingCR=${hasTrailingCR} trailingSpace=${hasTrailingSpace} ` +
        `nonAsciiBytes=[${suspicious.join(',') || 'none'}])`,
    );
  }
}

// Also test what the actual `dotenv` package would parse it to
try {
  const { config } = await import('dotenv');
  const parsed = config({ path: ENV_PATH }).parsed ?? {};
  console.log('\n--- as parsed by dotenv ---');
  for (const [k, v] of Object.entries(parsed)) {
    if (k === 'HOSTINGER_PASSWORD') {
      const buf = Buffer.from(v);
      const last = buf.slice(-1)[0];
      console.log(
        `  ${k}=<${v.length} chars, lastByte=0x${(last ?? 0).toString(16).padStart(2, '0')}>`,
      );
    } else {
      console.log(`  ${k}=${JSON.stringify(v)}`);
    }
  }
} catch (e) {
  console.log(`(dotenv import failed: ${e.message})`);
}
