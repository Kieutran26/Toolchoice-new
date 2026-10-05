import { publicUrl } from './public-fetch.js';
import { imageUrls, parseReferral } from '../../../src/lib/tool-intake.js';

const FIELD_LIMITS = {
  name: 200,
  tagline: 500,
  description: 16000,
  pricing_type: 100,
  category_text: 1000,
  pros: 8000,
  link: 4000,
  logo_url: 4000,
  gallery_images: 16000,
  referral_offer: 2000,
  referral_code: 1000,
  referral_parameter: 100,
  promotion_code: 1000,
  promotion_description: 2000,
};

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function database(env, table, query = {}, method = 'GET', body) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_URL) {
    throw Object.assign(new Error('Chưa cấu hình cơ sở dữ liệu admin.'), { status: 503 });
  }

  const url = new URL(`/rest/v1/${table}`, env.SUPABASE_URL);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  const response = await fetch(url, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.code === '23505' ? 'Tool hoặc đường dẫn này đã tồn tại.' : 'Không thể lưu/đọc dữ liệu. Kiểm tra cấu hình và trường dữ liệu.';
    throw Object.assign(new Error(message), { status: response.status >= 500 ? 502 : 400 });
  }
  return response.status === 204 ? [] : response.json();
}

export async function allRows(env, table, select) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const page = await database(env, table, { select, order: 'id.asc', limit: 500, offset });
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}

export function toolPayload(body) {
  const required = ['name', 'tagline', 'link', 'category_text'];
  if (required.some(key => typeof body[key] !== 'string' || !body[key].trim())) {
    throw badRequest('Nhập tên, link, mô tả ngắn và danh mục.');
  }
  publicUrl(body.link);
  if (body.pricing_type === 'Unknown') {
    throw badRequest('Chọn hình thức thanh toán trước khi lưu; AI chưa xác minh được giá.');
  }
  for (const value of [body.logo_url, ...imageUrls(body.gallery_images)].filter(Boolean)) {
    publicUrl(value);
  }

  const payload = {};
  for (const [key, maxLength] of Object.entries(FIELD_LIMITS)) {
    if (body[key] !== undefined && body[key] !== null && typeof body[key] !== 'string') {
      throw badRequest(`Trường ${key} không hợp lệ.`);
    }
    if (String(body[key] || '').length > maxLength) {
      throw badRequest(`Trường ${key} quá dài.`);
    }
    payload[key] = body[key]?.trim() || null;
  }

  const referral = parseReferral(body.link);
  for (const key of ['referral_code', 'referral_parameter', 'promotion_code']) {
    if (!payload[key] && referral[key]) payload[key] = referral[key];
  }
  for (const key of ['is_featured', 'is_best_choice', 'has_promotion']) {
    payload[key] = body[key] === true;
  }
  payload.has_promotion = payload.has_promotion || Boolean(payload.promotion_code || payload.promotion_description);
  payload.status = ['approved', 'pending', 'rejected'].includes(body.status) ? body.status : 'approved';
  return payload;
}
