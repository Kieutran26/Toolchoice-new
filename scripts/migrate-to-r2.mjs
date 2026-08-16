#!/usr/bin/env node
// One-time backfill: copies every object from Supabase Storage buckets
// "brand" and "article-images" into a Cloudflare R2 bucket, preserving the
// exact same flat path/filename (no per-bucket prefix), then writes
// mapping-urls.json ({ old_url: new_url }) for scripts/update-db-urls.mjs.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile } from 'node:fs/promises';

for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // optional file, ignore if missing
  }
}

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

const REQUIRED_ENV = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
};

for (const [key, value] of Object.entries(REQUIRED_ENV)) {
  if (!value) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const SOURCE_BUCKETS = ['brand', 'article-images'];
const CONCURRENCY = 8;
const PUBLIC_URL_BASE = R2_PUBLIC_URL.replace(/\/$/, '');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listSupabaseObjects(bucket, prefix = '') {
  const results = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix,
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    });

    if (!res.ok) {
      throw new Error(`List failed for ${bucket}/${prefix}: ${res.status} ${await res.text()}`);
    }

    const items = await res.json();
    if (items.length === 0) break;

    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      const isFolder = item.id === null && item.metadata === null;
      if (isFolder) {
        results.push(...(await listSupabaseObjects(bucket, path)));
      } else {
        results.push(path);
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return results;
}

async function downloadSupabaseObject(bucket, path) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${await res.text()}`);
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType };
}

function encodeR2Url(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function runWithConcurrency(items, limit, worker) {
  let index = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    while (index < items.length) {
      const current = index++;
      await worker(items[current], current);
    }
  });
  await Promise.all(runners);
}

async function migrateBucket(bucket, mapping, failures, usedKeys) {
  console.log(`\nListing files in bucket "${bucket}"...`);
  const paths = await listSupabaseObjects(bucket);
  console.log(`Found ${paths.length} files in "${bucket}".`);

  let done = 0;
  await runWithConcurrency(paths, CONCURRENCY, async (path) => {
    done += 1;
    const label = `[${bucket}] ${done}/${paths.length}`;
    try {
      // Flat key: same relative path as in Supabase, no per-bucket prefix.
      // Buckets are migrated one at a time (not concurrently), so this
      // check safely catches cross-bucket filename collisions.
      if (usedKeys.has(path)) {
        throw new Error(`Key collision: "${path}" already uploaded from another bucket`);
      }
      usedKeys.add(path);

      const { buffer, contentType } = await downloadSupabaseObject(bucket, path);

      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: path,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }));

      const oldUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
      const newUrl = `${PUBLIC_URL_BASE}/${encodeR2Url(path)}`;
      mapping[oldUrl] = newUrl;

      console.log(`${label} OK   ${path}`);
    } catch (err) {
      failures.push({ bucket, path, error: err.message });
      console.error(`${label} FAIL ${path}: ${err.message}`);
    }
  });
}

async function main() {
  const mapping = {};
  const failures = [];
  const usedKeys = new Set();

  for (const bucket of SOURCE_BUCKETS) {
    await migrateBucket(bucket, mapping, failures, usedKeys);
  }

  await writeFile('mapping-urls.json', JSON.stringify(mapping, null, 2));

  console.log(`\nDone. ${Object.keys(mapping).length} file(s) migrated, ${failures.length} failed.`);
  if (failures.length > 0) {
    console.log('Failures:');
    for (const f of failures) {
      console.log(`  - ${f.bucket}/${f.path}: ${f.error}`);
    }
  }
  console.log('Mapping written to mapping-urls.json');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
