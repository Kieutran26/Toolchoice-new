// Explicit integration check: reads production data, creates no tools.
import fs from 'node:fs';
const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => { const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')]; }));
const base = env.VITE_ADMIN_API_URL || 'https://toolchoice-admin-api.nguyenngockieutran.workers.dev';
const response = await fetch(base + '/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
  body: JSON.stringify({ email: env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || 'admin@toolchoice.vn', password: env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD }),
});
const session = await response.json();
console.log('login', response.status, Boolean(session.token));
if (!session.token) throw new Error('Login failed');
const headers = { Authorization: 'Bearer ' + session.token, 'Content-Type': 'application/json', Origin: 'http://localhost:3000' };
try {
  for (const path of ['/tools', '/images']) {
    const result = await fetch(base + path, { headers });
    const data = await result.json();
    console.log(path, result.status, Array.isArray(data) ? data.length : data.entries?.length);
  }
  const ai = await fetch(base + '/analyze', {
    method: 'POST', headers, body: JSON.stringify({ link: 'https://amicro.vercel.app/?ref=toolchoice' }), signal: AbortSignal.timeout(90000),
  });
  console.log('AI', ai.status, JSON.stringify(await ai.json()));
  if (!ai.ok) process.exitCode = 1;
} finally {
  console.log('logout', (await fetch(base + '/logout', { method: 'POST', headers })).status);
  console.log('revoked', (await fetch(base + '/session', { headers })).status);
}
