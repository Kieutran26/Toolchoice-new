import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildToolEditorialReview, getToolSlug, getSafeWebsiteUrl } from '../src/lib/tool-content.js';
import { BLOG_POSTS } from '../src/data/blog-posts.js';
const raw = JSON.parse(fs.readFileSync(new URL('../src/data/tools-snapshot.json', import.meta.url)));
const records = raw.filter((item) => item.id !== 168).map((item) => ({
  id: item.id, name: item.name, category: String(item.category_text || 'Khác').split(';')[0].trim(),
  full_description: item.description, short_description: item.tagline,
  features: String(item.pros || '').split(/\r?\n|;|\u2022/).map((value) => value.trim()).filter(Boolean),
}));
test('catalogue descriptions and features are not padded with inferred product claims', () => {
  for (const tool of records) {
    const result = buildToolEditorialReview(tool, records);
    const description = String(tool.full_description || tool.short_description || '').trim();
    assert.deepEqual(result.overviewParagraphs, description ? [description] : []);
    assert.deepEqual(result.prosList, [...new Set(tool.features)]);
    assert.match(result.disclosure, /không phải báo cáo kiểm thử độc lập/);
    assert.ok(result.alternatives.every((item) => item.id !== tool.id));
  }
});
test('generated pages contain record facts, disclosure and no old template promises', () => {
  for (const tool of records) {
    const html = fs.readFileSync(new URL(`../dist/tool/${getToolSlug(tool)}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /không phải báo cáo kiểm thử độc lập/);
    assert.doesNotMatch(html, /Giao diện tập trung vào bài toán cốt lõi|với tốc độ xử lý nhanh|SoftwareApplication/);
  }
});
test('every guide linked from the homepage exists in the generated site', () => {
  const home = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const post of BLOG_POSTS) {
    assert.ok(home.includes(`/blog/${post.slug}`));
    assert.ok(fs.existsSync(new URL(`../dist/blog/${post.slug}/index.html`, import.meta.url)));
  }
  const ticker = fs.readFileSync(new URL('../src/components/layout/DataTicker.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(ticker, /99\.97|12ms|NEW TODAY|Math\.min/);
});

test('malformed catalogue URLs cannot become relative or executable links', () => {
  const invalid = raw.find((item) => item.id === 198);
  assert.ok(invalid);
  assert.equal(getSafeWebsiteUrl(invalid.link), '');
  assert.equal(getSafeWebsiteUrl('javascript:alert(1)'), '');
  assert.equal(getSafeWebsiteUrl('/login'), '');
  assert.equal(getSafeWebsiteUrl('https://cssgradient.io/'), 'https://cssgradient.io/');
  const html = fs.readFileSync(new URL('../dist/tool/' + getToolSlug(invalid) + '/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /href="Không cung cấp/);
  assert.match(html, /Website chính thức chưa có đường dẫn hợp lệ/);
});
test('worked example includes its code, rendered preview and reference sources', () => {
  const html = fs.readFileSync(new URL('../dist/blog/tu-bang-mau-den-css-gradient-vi-du-co-the-tai-hien/index.html', import.meta.url), 'utf8');
  assert.match(html, /background-image:linear-gradient/);
  assert.match(html, /developer.mozilla.org/);
  assert.match(html, /<pre/);
});
