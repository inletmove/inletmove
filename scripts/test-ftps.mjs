#!/usr/bin/env node
/**
 * Isolated FTPS connection test — diagnoses 530 / auth issues without
 * running the full deploy pipeline.
 *
 * - Reads creds from apps/marketing/.env.local via dotenv
 * - Connects with basic-ftp using the SAME options as deploy-marketing.mjs
 * - Logs every FTP command/reply (verbose) with the password redacted
 * - On success: lists /public_html and prints OK
 * - On failure: prints precise error code, message, and which step failed
 *
 * Usage (from repo root):
 *   node scripts/test-ftps.mjs
 *   node scripts/test-ftps.mjs --combo B    # try alternative auth combo
 *   node scripts/test-ftps.mjs --combo B --password-from-env  # uses env, never logged
 *
 * Combos (--combo flag):
 *   A  user=$HOSTINGER_USER             host=$HOSTINGER_HOST           (default)
 *   B  user=$HOSTINGER_USER             host=217.196.55.191
 *   C  user=u475505275                  host=$HOSTINGER_HOST
 *   D  user=u475505275                  host=217.196.55.191
 *   E  user=marketing@inletmove.ca      host=$HOSTINGER_HOST
 */

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ftp from 'basic-ftp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const envPath = join(repoRoot, 'apps', 'marketing', '.env.local');
loadEnv({ path: envPath });

const args = process.argv.slice(2);
const comboArgIdx = args.indexOf('--combo');
const combo = comboArgIdx >= 0 ? args[comboArgIdx + 1]?.toUpperCase() : 'A';

const password = process.env.HOSTINGER_PASSWORD;
if (!password) {
  console.error('✗ HOSTINGER_PASSWORD missing from env');
  process.exit(1);
}

const ALT_HOST = '217.196.55.191';
const COMBOS = {
  A: { user: process.env.HOSTINGER_USER, host: process.env.HOSTINGER_HOST },
  B: { user: process.env.HOSTINGER_USER, host: ALT_HOST },
  C: { user: 'u475505275', host: process.env.HOSTINGER_HOST },
  D: { user: 'u475505275', host: ALT_HOST },
  E: { user: 'marketing@inletmove.ca', host: process.env.HOSTINGER_HOST },
};

const sel = COMBOS[combo];
if (!sel || !sel.user || !sel.host) {
  console.error(`✗ Unknown combo: ${combo}. Valid: A B C D E`);
  process.exit(1);
}

console.log(`— FTPS test — combo ${combo} —`);
console.log(`  host: ${sel.host}`);
console.log(`  user: ${sel.user}`);
console.log(`  pw:   <${password.length} chars>`);
console.log(`  port: ${process.env.HOSTINGER_PORT ?? 21}`);
console.log(`  protocol: ftps (explicit TLS), rejectUnauthorized=false`);

const client = new ftp.Client(/* timeout */ 20_000);

// Custom log function — redact the PASS argument so the password never
// appears in our session output.
client.ftp.log = (msg) => {
  let safe = String(msg);
  // Lines like ">   PASS hunter2" or "> PASS xxx"
  safe = safe.replace(/(PASS\s+).+$/gim, '$1<redacted>');
  process.stderr.write(`  [ftp] ${safe}\n`);
};
client.ftp.verbose = true;

async function main() {
  try {
    await client.access({
      host: sel.host,
      port: process.env.HOSTINGER_PORT ? Number(process.env.HOSTINGER_PORT) : 21,
      user: sel.user,
      password,
      secure: true,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log(`\n✓ Authenticated as ${sel.user}@${sel.host}`);

    // Try to list / and /public_html so we know what's there
    console.log('\n— pwd —');
    console.log(`  ${await client.pwd()}`);

    console.log('\n— list / —');
    const root = await client.list('/');
    for (const e of root) console.log(`  ${e.type === 2 ? 'd' : '-'} ${e.size.toString().padStart(8)} ${e.name}`);

    console.log('\n— list /public_html —');
    try {
      const pub = await client.list('/public_html');
      for (const e of pub.slice(0, 10)) console.log(`  ${e.type === 2 ? 'd' : '-'} ${e.size.toString().padStart(8)} ${e.name}`);
      if (pub.length > 10) console.log(`  …${pub.length - 10} more`);
    } catch (err) {
      console.log(`  (list failed: ${err.message})`);
    }

    console.log('\nOK');
    process.exit(0);
  } catch (err) {
    console.error(`\n✗ FAILED on combo ${combo}`);
    console.error(`  message: ${err.message}`);
    if (err.code !== undefined) console.error(`  code: ${err.code}`);
    if (err.errno !== undefined) console.error(`  errno: ${err.errno}`);
    process.exit(2);
  } finally {
    if (!client.closed) client.close();
  }
}

main();
