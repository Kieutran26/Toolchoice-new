const encoder = new TextEncoder();
const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decode = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function sessionKey(env) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) throw Object.assign(new Error('Chưa cấu hình xác thực admin.'), { status: 503 });
  return crypto.subtle.importKey('raw', encoder.encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return encode(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256));
}

export async function login(body, env) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) throw Object.assign(new Error('Chưa cấu hình tài khoản admin.'), { status: 503 });
  const [salt, expected] = env.ADMIN_PASSWORD_HASH.split(':');
  const actual = await passwordHash(String(body.password || '').slice(0, 1024), salt);
  const key = await sessionKey(env);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expected));
  const matches = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(actual));
  if (!matches || String(body.email || '').trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) throw Object.assign(new Error('Email hoặc mật khẩu không chính xác.'), { status: 401 });
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  const payload = encode(encoder.encode(JSON.stringify({ email: env.ADMIN_EMAIL, expiresAt, id: crypto.randomUUID() })));
  const token = `${payload}.${encode(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))}`;
  return { token, email: env.ADMIN_EMAIL, expiresAt };
}

export async function authenticate(request, env) {
  try {
    const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) throw new Error();
    if (!await crypto.subtle.verify('HMAC', await sessionKey(env), decode(signature), encoder.encode(payload))) throw new Error();
    const session = JSON.parse(new TextDecoder().decode(decode(payload)));
    if (session.email !== env.ADMIN_EMAIL || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) throw new Error();
    if (await env.BUCKET.head(`admin-sessions/revoked/${session.id}`)) throw new Error();
    return session;
  } catch { throw Object.assign(new Error('Phiên admin hết hạn. Vui lòng đăng nhập lại.'), { status: 401 }); }
}
