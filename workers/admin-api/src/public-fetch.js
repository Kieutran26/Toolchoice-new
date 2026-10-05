const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export function isPrivateAddress(address) {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (ip.includes(':')) return !/^2[0-9a-f]{3}:|^3[0-9a-f]{3}:/.test(ip) || ip.startsWith('2001:db8:');
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true;

  const [first, second, third] = octets;
  return first === 0
    || first === 10
    || first === 127
    || first >= 224
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && [0, 168].includes(second))
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 198 && [18, 19, 51].includes(second))
    || (first === 203 && second === 0 && third === 113);
}

export function publicUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw Object.assign(new Error('Link website không hợp lệ.'), { status: 400 });
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  const isInvalid = !['http:', 'https:'].includes(url.protocol)
    || url.username
    || url.password
    || url.port
    || !host.includes('.')
    || /(?:^|\.)(localhost|local|internal|test|invalid|example)$/.test(host)
    || host.includes(':')
    || /^[\d.]+$/.test(host);
  if (isInvalid) {
    throw Object.assign(new Error('Chỉ hỗ trợ tên miền website công khai qua HTTP/HTTPS.'), { status: 400 });
  }

  url.hash = '';
  return url;
}

async function assertPublicDns(host) {
  const results = await Promise.all(['A', 'AAAA'].map(async (type) => {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Không thể kiểm tra tên miền.');
    return (await response.json()).Answer || [];
  }));
  const addresses = results.flat().filter(item => [1, 28].includes(item.type));
  if (!addresses.length || addresses.some(item => isPrivateAddress(item.data))) {
    throw Object.assign(new Error('Tên miền không trỏ đến máy chủ công khai.'), { status: 400 });
  }
}

export async function readLimited(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body?.cancel();
    throw new Error('Nội dung vượt giới hạn tải.');
  }

  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error('Nội dung vượt giới hạn tải.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

export async function fetchPublic(value) {
  let url = publicUrl(value);
  for (let redirects = 0; redirects <= 4; redirects++) {
    await assertPublicDns(url.hostname);
    const response = await fetch(url.href, {
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
      headers: {
        'User-Agent': 'ToolChoice-Admin/1.0',
        Accept: 'text/html,image/*;q=0.9,*/*;q=0.5',
      },
    });
    if (REDIRECT_STATUSES.has(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) throw new Error('Website trả redirect thiếu địa chỉ.');
      url = publicUrl(new URL(location, url).href);
      continue;
    }
    return { response, url: url.href };
  }
  throw new Error('Website chuyển hướng quá nhiều lần.');
}
