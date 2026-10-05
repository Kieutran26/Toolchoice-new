/** @param {string} url @param {{signal?: AbortSignal, timeout?: number}} [options] */
export function decodeImage(url, { signal, timeout = 15000 } = {}) {
  return new Promise(resolve => {
    if (!url) return resolve({ ok: false, state: 'broken', reason: 'Chưa có ảnh ở vị trí này.' });
    let settled = false;
    const image = new Image();
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      image.onload = image.onerror = null;
      image.src = '';
      resolve(result);
    };
    const abort = () => finish({ ok: false, state: 'cancelled', reason: 'Đã dừng quét.' });
    const timer = setTimeout(() => finish({ ok: false, state: 'unreachable', reason: 'Quá thời gian tải ảnh; cần kiểm tra lại.' }), timeout);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) return abort();
    image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0 ? { ok: true, state: 'valid', width: image.naturalWidth, height: image.naturalHeight } : { ok: false, state: 'broken', reason: 'Ảnh không có kích thước hợp lệ.' });
    image.onerror = () => finish({ ok: false, state: 'unreachable', reason: 'Trình duyệt không hiển thị được ảnh: có thể do file hỏng, mạng hoặc máy chủ chặn.' });
    image.referrerPolicy = 'no-referrer';
    image.src = url;
  });
}

/**
 * @param {Array<any>} entries
 * @param {{signal?: AbortSignal, onProgress?: (value: any) => void, verifyFailure?: (url: string, signal?: AbortSignal) => Promise<any>}} [options]
 */
export async function auditImages(entries, { signal, onProgress, verifyFailure } = {}) {
  const grouped = new Map();
  for (const entry of entries) {
    if (!grouped.has(entry.url)) grouped.set(entry.url, []);
    grouped.get(entry.url).push(entry);
  }
  const urls = [...grouped.keys()];
  const results = [];
  let index = 0;
  let completed = 0;
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, async () => {
    while (index < urls.length && !signal?.aborted) {
      const url = urls[index++];
      const result = await decodeImage(url, { signal });
      if (result.state === 'cancelled') break;
      if (!result.ok && url && verifyFailure && !signal?.aborted) {
        try {
          const evidence = await verifyFailure(url, signal);
          if (!evidence.ok && evidence.status === 200) Object.assign(result, { state: 'broken', reason: evidence.reason });
          else if (evidence.status) result.reason += ` Máy chủ: HTTP ${evidence.status}.`;
        } catch { /* Browser failures remain visible even if server diagnostics fail. */ }
      }
      for (const entry of grouped.get(url)) results.push({ ...entry, ...result });
      completed++;
      onProgress?.({ completed, total: urls.length, results: [...results] });
    }
  }));
  return results;
}
