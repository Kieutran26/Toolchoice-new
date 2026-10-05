import { authenticate, login } from './auth.js';
import { allRows, database, toolPayload } from './database.js';
import { analyzeWebsite } from './research.js';
import { checkImage, imageInventory, replaceImage, upload } from './images.js';
import { readLimited } from './public-fetch.js';

async function jsonBody(request) {
  try { return JSON.parse(new TextDecoder().decode(await readLimited(request, 64000))); }
  catch { throw Object.assign(new Error('Dữ liệu gửi lên không hợp lệ hoặc quá lớn.'), { status: 400 }); }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    if (origin && allowed.includes(origin)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Max-Age': '600' });
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowed.includes(origin)) return reply({ error: 'Origin không được phép.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';
    try {
      if (path === '/health' && request.method === 'GET') return reply({ ready: Boolean(env.ADMIN_PASSWORD_HASH && env.SESSION_SECRET && env.SUPABASE_SERVICE_ROLE_KEY && env.AI && env.BUCKET) });
      if (path === '/login' && request.method === 'POST') {
        if (!env.LOGIN_LIMITER) return reply({ error: 'Chưa cấu hình bảo vệ đăng nhập.' }, 503);
        const limited = await env.LOGIN_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
        if (!limited.success) return reply({ error: 'Quá nhiều lần đăng nhập. Thử lại sau một phút.' }, 429);
        return reply(await login(await jsonBody(request), env));
      }
      const session = await authenticate(request, env);
      if (path === '/session' && request.method === 'GET') return reply({ email: session.email, expiresAt: session.expiresAt });
      if (path === '/logout' && request.method === 'POST') {
        await env.BUCKET.put(`admin-sessions/revoked/${session.id}`, JSON.stringify({ expiresAt: session.expiresAt }));
        return reply({ success: true });
      }
      if (path === '/analyze' && request.method === 'POST') {
        if (!env.AI_LIMITER || !(await env.AI_LIMITER.limit({ key: session.email })).success) return reply({ error: 'AI đang nhận quá nhiều yêu cầu. Thử lại sau một phút.' }, 429);
        return reply(await analyzeWebsite((await jsonBody(request)).link, env));
      }
      if (path === '/upload' && request.method === 'POST') return reply(await upload(request, env));
      if (path === '/images' && request.method === 'GET') return reply(await imageInventory(env));
      if (path === '/images/check' && request.method === 'POST') return reply(await checkImage((await jsonBody(request)).url));
      if (path === '/images/replace' && request.method === 'POST') return reply(await replaceImage(await jsonBody(request), env));
      if (path === '/tools' && request.method === 'GET') return reply(await allRows(env, 'tools', '*'));
      if (path === '/tools' && request.method === 'POST') return reply((await database(env, 'tools', {}, 'POST', toolPayload(await jsonBody(request))))[0], 201);
      const match = path.match(/^\/tools\/(\d+)$/);
      if (match && request.method === 'PATCH') {
        const rows = await database(env, 'tools', { id: `eq.${match[1]}` }, 'PATCH', toolPayload(await jsonBody(request)));
        return rows.length ? reply(rows[0]) : reply({ error: 'Không tìm thấy tool.' }, 404);
      }
      if (match && request.method === 'DELETE') {
        const rows = await database(env, 'tools', { id: `eq.${match[1]}` }, 'DELETE');
        return rows.length ? reply({ success: true }) : reply({ error: 'Không tìm thấy tool.' }, 404);
      }
      return reply({ error: 'Không tìm thấy chức năng.' }, 404);
    } catch (error) {
      return reply({ error: error.status ? error.message : 'Không thể hoàn tất yêu cầu. Website hoặc dịch vụ có thể đang lỗi; hãy thử lại hoặc nhập thủ công.' }, error.status || 502);
    }
  },
};
