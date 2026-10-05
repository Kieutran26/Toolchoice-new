import { allRows, database } from './database.js';
import { fetchPublic, publicUrl, readLimited } from './public-fetch.js';
import { imageUrls } from '../../../src/lib/tool-intake.js';

export const IMAGE_FIELDS = { tools: ['logo_url', 'gallery_images'], articles: ['banner_image', 'author_avatar', 'content'], deals: ['logo'] };

export function imageType(bytes) {
  const b = bytes;
  if (b.length < 40) return '';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v) && new TextDecoder().decode(b.slice(-8, -4)) === 'IEND') return 'image/png';
  if (b[0] === 255 && b[1] === 216 && b.at(-2) === 255 && b.at(-1) === 217) return 'image/jpeg';
  const header = new TextDecoder().decode(b.slice(0, 12));
  if (/^GIF8[79]a/.test(header) && b.at(-1) === 59) return 'image/gif';
  if (header.startsWith('RIFF') && header.endsWith('WEBP') && new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(4, true) + 8 === b.length) return 'image/webp';
  return '';
}

export async function upload(request, env) {
  const bytes = await readLimited(request, 10 * 1024 * 1024);
  const type = imageType(bytes);
  if (!type) throw Object.assign(new Error('Ảnh hỏng hoặc không thuộc định dạng PNG/JPEG/WebP/GIF.'), { status: 400 });
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[type];
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } });
  return { url: `${env.PUBLIC_URL.replace(/\/$/, '')}/${key}` };
}

export async function imageInventory(env) {
  const entries = [];
  const add = (table, row, field, urls, label) => urls.forEach((url, index) => entries.push({ table, id: row.id, name: row.name || row.title || row.tool_name || String(row.id), field, url, index, label }));
  const [tools, articles, deals] = await Promise.all([allRows(env, 'tools', 'id,name,logo_url,gallery_images'), allRows(env, 'articles', 'id,title,banner_image,author_avatar,content'), allRows(env, 'deals', 'id,tool_name,logo')]);
  for (const row of tools) {
    const logo = imageUrls(row.logo_url);
    add('tools', row, 'logo_url', logo.length ? logo : [''], 'Logo');
    const gallery = imageUrls(row.gallery_images);
    add('tools', row, 'gallery_images', gallery.length ? gallery : [''], 'Gallery');
  }
  for (const row of articles) {
    for (const field of ['banner_image', 'author_avatar']) {
      const urls = imageUrls(row[field]);
      add('articles', row, field, urls.length ? urls : [''], field === 'banner_image' ? 'Ảnh bài viết' : 'Avatar');
    }
    const embedded = [...String(row.content || '').matchAll(/<img\b[^>]*src=["']([^"']+)["']|!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/gi)].map(m => m[1] || m[2]);
    add('articles', row, 'content', embedded, 'Ảnh trong nội dung');
  }
  for (const row of deals) {
    const urls = imageUrls(row.logo);
    add('deals', row, 'logo', urls.length ? urls : [''], 'Logo ưu đãi');
  }
  const site = env.SITE_URL || 'https://www.toolchoice.site';
  for (const [id, name, url] of [
    ['logo', 'Logo website', `${site}/logo.png`],
    ['favicon', 'Biểu tượng website', `${site}/favicon.png`],
    ['unikorn', 'Huy hiệu Unikorn', 'https://unikorn.vn/api/widgets/badge/toolchoice?theme=light'],
  ]) entries.push({ table: 'site', id, name, field: id, url, label: 'Ảnh giao diện' });
  return { entries, checkedAt: new Date().toISOString() };
}

export async function checkImage(url) {
  try {
    const { response } = await fetchPublic(url);
    if (!response.ok) { await response.body?.cancel(); return { ok: false, reason: `HTTP ${response.status}`, status: response.status }; }
    const contentType = response.headers.get('content-type') || '';
    const bytes = await readLimited(response, 10 * 1024 * 1024);
    const valid = imageType(bytes) || (/image\/svg\+xml/i.test(contentType) && /<svg[\s>]/i.test(new TextDecoder().decode(bytes))) || (/image\/(?:x-icon|vnd.microsoft.icon)/i.test(contentType) && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1);
    return { ok: Boolean(valid), reason: valid ? 'File có chữ ký ảnh hợp lệ; cần xác minh hiển thị trong trình duyệt.' : 'HTTP 200 nhưng nội dung không phải ảnh hợp lệ.', bytes: bytes.length, contentType, status: response.status };
  } catch (error) { return { ok: false, reason: error.message }; }
}

export async function replaceImage(body, env) {
  if (!IMAGE_FIELDS[body.table]?.includes(body.field) || !body.id || body.oldUrl === undefined) throw Object.assign(new Error('Vị trí ảnh không hợp lệ.'), { status: 400 });
  publicUrl(body.newUrl);
  if (!body.newUrl.startsWith(`${env.PUBLIC_URL.replace(/\/$/, '')}/uploads/`)) throw Object.assign(new Error('Chọn ảnh vừa upload lên Cloudflare.'), { status: 400 });
  const key = new URL(body.newUrl).pathname.slice(1);
  if (!await env.BUCKET.head(key)) throw Object.assign(new Error('Ảnh thay thế chưa được upload.'), { status: 400 });
  const rows = await database(env, body.table, { select: `id,${body.field}`, id: `eq.${body.id}` });
  if (!rows.length) throw Object.assign(new Error('Không tìm thấy bản ghi.'), { status: 404 });
  const old = rows[0][body.field];
  const index = body.index ?? 0;
  if (!Number.isInteger(index) || index < 0) throw Object.assign(new Error('Vị trí ảnh không hợp lệ.'), { status: 400 });
  let next;
  if (body.field === 'content') {
    let matches = 0;
    let position = 0;
    next = String(old || '').replace(/<img\b[^>]*src=["']([^"']+)["']|!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/gi, (match, htmlUrl, markdownUrl) => {
      const url = htmlUrl || markdownUrl;
      const current = position++;
      if (!body.oldUrl || url !== body.oldUrl || current !== index) return match;
      matches++;
      return htmlUrl
        ? match.replace(/(src=["'])([^"']+)(["'])$/i, (_, prefix, value, quote) => prefix + body.newUrl + quote)
        : match.replace(/^(!\[[^\]]*\]\()([^\s)]+)/, (_, prefix) => prefix + body.newUrl);
    });
    if (!matches) throw Object.assign(new Error('Ảnh đã thay đổi. Hãy quét lại.'), { status: 409 });
  } else {
    const urls = imageUrls(old);
    if (!urls.length && body.oldUrl === '' && index === 0) next = body.newUrl;
    else {
      if (urls[index] !== body.oldUrl) throw Object.assign(new Error('Ảnh đã thay đổi. Hãy quét lại.'), { status: 409 });
      next = urls.map((url, position) => position === index ? body.newUrl : url).join('\n');
    }
  }
  const updated = await database(env, body.table, { id: `eq.${body.id}`, [body.field]: old === null ? 'is.null' : `eq.${old}` }, 'PATCH', { [body.field]: next });
  if (!updated.length) throw Object.assign(new Error('Dữ liệu vừa được sửa ở phiên khác. Hãy quét lại.'), { status: 409 });
  return { success: true };
}
