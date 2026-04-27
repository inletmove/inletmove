#!/usr/bin/env node
/**
 * Deploy apps/marketing/dist/ to Hostinger via SFTP or FTP(S).
 *
 * Reads creds from apps/marketing/.env.local. The .env.local file is
 * gitignored — never commit real values.
 *
 * Required env:
 *   HOSTINGER_HOST              ftp.example.com or 145.x.x.x
 *   HOSTINGER_USER              u123456789
 *   HOSTINGER_PASSWORD          ********
 *
 * Optional env (with defaults):
 *   HOSTINGER_PROTOCOL          'sftp' (default) | 'ftp' | 'ftps'
 *   HOSTINGER_PORT              22 for sftp, 21 for ftp/ftps
 *   HOSTINGER_REMOTE_DIR        /public_html
 *   HOSTINGER_LOCAL_DIR         apps/marketing/dist
 *
 * Behavior:
 *   - Walks the local dist/ tree and uploads every file.
 *   - Creates remote directories as needed (idempotent).
 *   - Does NOT delete remote files that aren't in dist/. The first deploy
 *     onto a fresh public_html is therefore safe; subsequent deploys
 *     overwrite. To clear stale files, do that manually in Hostinger's
 *     File Manager once.
 *
 * Usage:
 *   pnpm deploy:marketing
 */

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import SftpClient from 'ssh2-sftp-client';
import * as ftp from 'basic-ftp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '..');
const envPath  = join(repoRoot, 'apps', 'marketing', '.env.local');

loadEnv({ path: envPath });

const {
  HOSTINGER_HOST,
  HOSTINGER_USER,
  HOSTINGER_PASSWORD,
  HOSTINGER_PROTOCOL = 'sftp',
  HOSTINGER_PORT,
  HOSTINGER_REMOTE_DIR = '/public_html',
  HOSTINGER_LOCAL_DIR = 'apps/marketing/dist',
} = process.env;

if (!HOSTINGER_HOST || !HOSTINGER_USER || !HOSTINGER_PASSWORD) {
  console.error('✗ Missing SFTP credentials.');
  console.error(`  Expected env vars in ${envPath}:`);
  console.error('  HOSTINGER_HOST, HOSTINGER_USER, HOSTINGER_PASSWORD');
  process.exit(1);
}

const protocol  = HOSTINGER_PROTOCOL.toLowerCase();
const port      = HOSTINGER_PORT ? Number(HOSTINGER_PORT) : (protocol === 'sftp' ? 22 : 21);
const localRoot = resolve(repoRoot, HOSTINGER_LOCAL_DIR);
const remoteRoot = HOSTINGER_REMOTE_DIR.replace(/\\/g, '/');

console.log(`→ Deploying ${HOSTINGER_LOCAL_DIR}/  →  ${HOSTINGER_HOST}:${remoteRoot}/  (${protocol})`);

// Walk the local dist/ tree and yield {localPath, remotePath} pairs.
async function* walk(dir, baseLocal, baseRemote) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const local = join(dir, entry.name);
    const rel   = relative(baseLocal, local).split(sep).join(posix.sep);
    const remote = posix.join(baseRemote, rel);
    if (entry.isDirectory()) {
      yield { kind: 'dir', remote };
      yield* walk(local, baseLocal, baseRemote);
    } else if (entry.isFile()) {
      yield { kind: 'file', local, remote };
    }
  }
}

async function deploySftp() {
  const client = new SftpClient();
  await client.connect({
    host: HOSTINGER_HOST,
    port,
    username: HOSTINGER_USER,
    password: HOSTINGER_PASSWORD,
    readyTimeout: 20000,
  });

  let dirCount = 0;
  let fileCount = 0;
  let totalBytes = 0;

  for await (const item of walk(localRoot, localRoot, remoteRoot)) {
    if (item.kind === 'dir') {
      try {
        await client.mkdir(item.remote, true);
      } catch (err) {
        if (!String(err).includes('exists')) throw err;
      }
      dirCount++;
    } else {
      const buf = await readFile(item.local);
      await client.put(buf, item.remote);
      fileCount++;
      totalBytes += buf.length;
      process.stdout.write(`  ${item.remote}\n`);
    }
  }

  await client.end();
  return { dirCount, fileCount, totalBytes };
}

async function deployFtp(secure) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  await client.access({
    host: HOSTINGER_HOST,
    port,
    user: HOSTINGER_USER,
    password: HOSTINGER_PASSWORD,
    secure,
    // Hostinger's FTPS cert is for *.hstgr.io (internal), not the user-facing
    // ftp.<domain>. Disable strict cert validation. Acceptable here because
    // (a) we know the destination, (b) creds are deploy-scoped, (c) one-shot
    // upload — not an ongoing trust relationship.
    secureOptions: { rejectUnauthorized: false },
  });

  await client.ensureDir(remoteRoot);
  await client.cd(remoteRoot);

  const before = process.hrtime.bigint();
  const tracker = (info) => {
    if (info.type === 'upload') {
      process.stdout.write(`  ${info.name}\n`);
    }
  };
  client.trackProgress(tracker);
  await client.uploadFromDir(localRoot, remoteRoot);
  client.trackProgress();
  client.close();
  const elapsed = Number(process.hrtime.bigint() - before) / 1e9;
  return { elapsed };
}

try {
  if (protocol === 'sftp') {
    const { dirCount, fileCount, totalBytes } = await deploySftp();
    console.log(`✓ Done. ${fileCount} files, ${dirCount} dirs, ${(totalBytes / 1024).toFixed(1)} KiB.`);
  } else if (protocol === 'ftp' || protocol === 'ftps') {
    const { elapsed } = await deployFtp(protocol === 'ftps');
    console.log(`✓ Done in ${elapsed.toFixed(1)}s.`);
  } else {
    throw new Error(`Unknown HOSTINGER_PROTOCOL: ${protocol} (use sftp, ftp, or ftps)`);
  }
} catch (err) {
  console.error(`✗ Deploy failed: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(2);
}
