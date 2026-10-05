import test from 'node:test';
import assert from 'node:assert/strict';
import { auditImages, decodeImage } from '../../../src/lib/image-audit.js';

test('image audit detects invalid HTTP 200 responses and checks shared URLs once', async () => {
  const original = globalThis.Image;
  let requests = 0;
  globalThis.Image = class {
    set src(value) { if (value) { requests++; queueMicrotask(() => this.onerror?.()); } }
  };
  try {
    const results = await auditImages([{ id: 1, url: 'https://images.com/broken.png' }, { id: 2, url: 'https://images.com/broken.png' }], {
      verifyFailure: async () => ({ ok: false, status: 200, reason: 'File hỏng' }),
    });
    assert.equal(requests, 1);
    assert.equal(results.length, 2);
    assert.ok(results.every(row => row.state === 'broken'));
  } finally { globalThis.Image = original; }
});

test('decoded images are valid and timeouts remain uncertain', async () => {
  const original = globalThis.Image;
  globalThis.Image = class {
    naturalWidth = 100; naturalHeight = 80;
    set src(value) { if (value.includes('good')) queueMicrotask(() => this.onload?.()); }
  };
  try {
    assert.equal((await decodeImage('https://images.com/good.png')).state, 'valid');
    assert.equal((await decodeImage('https://images.com/slow.png', { timeout: 1 })).state, 'unreachable');
    assert.equal((await decodeImage('')).state, 'broken');
    const controller = new AbortController(); controller.abort();
    assert.equal((await decodeImage('https://images.com/slow.png', { signal: controller.signal })).state, 'cancelled');
  } finally { globalThis.Image = original; }
});
