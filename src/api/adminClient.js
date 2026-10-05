const API_URL = (import.meta.env.VITE_ADMIN_API_URL || '').replace(/\/$/, '');
const SESSION_KEY = 'toolchoice_admin_session';

export function getAdminSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (value?.token && value.expiresAt > Date.now()) return value;
  } catch { /* Invalid or expired browser state never grants admin access. */ }
  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('admin-session-expired'));
}

export async function adminRequest(path, options = {}) {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ API admin (VITE_ADMIN_API_URL).');
  const session = getAdminSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(120000)]) : AbortSignal.timeout(120000),
    headers: { ...(session ? { Authorization: `Bearer ${session.token}` } : {}), ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/login') clearAdminSession();
    throw new Error(result.error || `Yêu cầu admin thất bại (${response.status}).`);
  }
  return result;
}

export const adminJson = (path, body, method = 'POST', signal) => adminRequest(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });

export async function loginAdmin(email, password) {
  const session = await adminJson('/login', { email, password });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function logoutAdmin() {
  try { await adminJson('/logout', {}); } finally { clearAdminSession(); }
}

export async function uploadAdminImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Chọn ảnh PNG, JPEG, WebP hoặc GIF.');
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('Ảnh phải nhỏ hơn 10 MB.');
  const preview = URL.createObjectURL(file);
  try {
    await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { image.naturalWidth ? resolve() : reject(new Error('Ảnh không có kích thước hợp lệ.')); };
      image.onerror = () => reject(new Error('Không thể đọc ảnh. File có thể đã hỏng.'));
      image.src = preview;
    });
  } finally { URL.revokeObjectURL(preview); }
  return adminRequest('/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
}
