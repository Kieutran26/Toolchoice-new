#!/usr/bin/env node
// Reads mapping-urls.json (produced by scripts/migrate-to-r2.mjs) and prints
// UPDATE statements that would swap Supabase Storage URLs for R2 URLs across
// public.tools (logo_url, gallery_images), public.articles (banner_image,
// author_avatar) and public.deals (logo). Read-only against the database:
// it never executes SQL, it only prints it and writes update-db-urls.sql
// for manual review/execution.

import { readFile, writeFile } from 'node:fs/promises';

for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // optional file, ignore if missing
  }
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env var: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const STORAGE_HOST = new URL(SUPABASE_URL).hostname;
const escapedHost = STORAGE_HOST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Object names in this project can contain literal spaces (not %20-encoded),
// e.g. ".../brand/logos/Blush Design.webp" - so only stop at the delimiters
// actually used between multiple URLs in one field (comma/semicolon/newline)
// or a quote, never at plain whitespace.
const SUPABASE_URL_REGEX = new RegExp(`https?://${escapedHost}/storage/v1/object/public/[^,;\\n"']+`, 'g');

const TABLE_CONFIGS = [
  { table: 'tools', idColumn: 'id', idIsString: false, columns: ['logo_url', 'gallery_images'] },
  { table: 'articles', idColumn: 'id', idIsString: true, columns: ['banner_image', 'author_avatar'] },
  { table: 'deals', idColumn: 'id', idIsString: true, columns: ['logo'] },
];

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function decodeSafe(url) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

// mapping-urls.json keys are raw (unencoded) object paths from the Supabase
// Storage list API, but the same URL can be stored in the DB either raw
// ("Blush Design.webp") or percent-encoded ("Blush%20Design.webp") depending
// on how it was originally saved. Build a decoded-key fallback so both forms
// resolve to the same R2 URL.
function buildDecodedMapping(mapping) {
  const decoded = new Map();
  for (const [key, value] of Object.entries(mapping)) {
    decoded.set(decodeSafe(key), value);
  }
  return decoded;
}

function replaceUrls(text, mapping, decodedMapping) {
  if (!text) return { result: text, changed: false, unmapped: [] };

  const unmapped = [];
  let changed = false;
  const result = text.replace(SUPABASE_URL_REGEX, (match) => {
    // The regex can swallow trailing whitespace before a newline/EOF (since
    // spaces are allowed mid-URL for unencoded filenames); strip it for the
    // mapping lookup and re-attach it to the replacement so formatting
    // outside the URL itself is preserved.
    const trailingWs = /\s+$/.exec(match)?.[0] || '';
    const trimmed = trailingWs ? match.slice(0, -trailingWs.length) : match;

    const newUrl = mapping[trimmed] || decodedMapping.get(decodeSafe(trimmed));
    if (newUrl) {
      changed = true;
      return newUrl + trailingWs;
    }
    unmapped.push(trimmed);
    return match;
  });

  return { result, changed, unmapped };
}

async function fetchRows(table, columns, filterColumns) {
  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
  url.searchParams.set('select', columns.join(','));
  const orExpr = filterColumns.map((col) => `${col}.ilike.*${STORAGE_HOST}*`).join(',');
  url.searchParams.set('or', `(${orExpr})`);

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch ${table} failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function main() {
  let mapping;
  try {
    mapping = JSON.parse(await readFile('mapping-urls.json', 'utf-8'));
  } catch {
    console.error('mapping-urls.json not found. Run scripts/migrate-to-r2.mjs first.');
    process.exit(1);
  }

  const decodedMapping = buildDecodedMapping(mapping);
  const statements = [];
  const unmappedUrls = new Set();
  const perTableChanged = {};

  for (const config of TABLE_CONFIGS) {
    const rows = await fetchRows(config.table, [config.idColumn, ...config.columns], config.columns);
    let changedCount = 0;

    for (const row of rows) {
      const setClauses = [];

      for (const col of config.columns) {
        const { result, changed, unmapped } = replaceUrls(row[col], mapping, decodedMapping);
        unmapped.forEach((u) => unmappedUrls.add(u));
        if (changed) {
          setClauses.push(`${col} = ${sqlString(result)}`);
        }
      }

      if (setClauses.length > 0) {
        changedCount += 1;
        const idValue = config.idIsString ? sqlString(row[config.idColumn]) : row[config.idColumn];
        statements.push(`UPDATE public.${config.table} SET ${setClauses.join(', ')} WHERE ${config.idColumn} = ${idValue};`);
      }
    }

    perTableChanged[config.table] = changedCount;
  }

  const sqlOutput = statements.length > 0 ? statements.join('\n') : '-- No rows need updating.';
  await writeFile('update-db-urls.sql', `${sqlOutput}\n`);

  console.log(sqlOutput);
  console.log(`\n${statements.length} UPDATE statement(s) generated for:`);
  for (const [table, count] of Object.entries(perTableChanged)) {
    console.log(`  - ${table}: ${count} row(s)`);
  }
  console.log('\nSQL written to update-db-urls.sql for review. This script did NOT modify the database.');

  if (unmappedUrls.size > 0) {
    console.log(`\nWarning: ${unmappedUrls.size} Supabase Storage URL(s) found in the DB with no matching entry in mapping-urls.json:`);
    for (const u of unmappedUrls) console.log(`  - ${u}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
