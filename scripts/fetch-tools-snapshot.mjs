import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rwphopolciuwrmmzztpm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cGhvcG9sY2l1d3JtbXp6dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODYxNDcsImV4cCI6MjA3ODY2MjE0N30._O7Q0NsrEXNDcUbc_xBJwpt_FDBIkiiwErxXFWyJCro';

const TOOL_COLUMNS = [
  'id',
  'name',
  'tagline',
  'description',
  'category_text',
  'pricing_type',
  'pros',
  'link',
  'gallery_images',
  'logo_url',
  'referral_offer',
  'referral_code',
  'referral_parameter',
  'has_promotion',
  'promotion_code',
  'promotion_description',
  'is_featured',
  'is_best_choice',
  'created_at',
  'status',
].join(',');

async function main() {
  const url = new URL('/rest/v1/tools', SUPABASE_URL);
  url.searchParams.set('select', TOOL_COLUMNS);
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '1000');

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tools from Supabase: ${response.status}`);
  }

  const rawTools = await response.json();
  const filtered = rawTools.filter((t) => t.id !== 168);

  const outDir = path.resolve(__dirname, '../src/data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'tools-snapshot.json');
  fs.writeFileSync(outFile, JSON.stringify(filtered, null, 2), 'utf8');
  console.log(`Saved ${filtered.length} tools to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
