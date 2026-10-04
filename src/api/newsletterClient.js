const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rwphopolciuwrmmzztpm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cGhvcG9sY2l1d3JtbXp6dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODYxNDcsImV4cCI6MjA3ODY2MjE0N30._O7Q0NsrEXNDcUbc_xBJwpt_FDBIkiiwErxXFWyJCro';

/**
 * Đăng ký email nhận cập nhật 8 công cụ mới mỗi tuần
 * @param {string} rawEmail - Email người dùng nhập
 * @param {string} source - Nguồn đăng ký (sidebar, footer, modal...)
 * @returns {Promise<{ success: boolean, message: string, alreadySubscribed?: boolean }>}
 */
export async function subscribeNewsletter(rawEmail, source = 'sidebar') {
  if (!rawEmail || typeof rawEmail !== 'string') {
    throw new Error('Vui lòng nhập địa chỉ email.');
  }

  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Địa chỉ email không đúng định dạng.');
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Thiếu cấu hình kết nối cơ sở dữ liệu Supabase.');
  }

  const url = new URL('/rest/v1/newsletter_subscribers', SUPABASE_URL);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      // Dùng return=representation để nhận lại record được lưu
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      email,
      status: 'active'
    }),
  });

  if (response.ok) {
    return {
      success: true,
      message: 'Đăng ký thành công! Bạn sẽ nhận được các công cụ mới nhất mỗi tuần.',
      alreadySubscribed: false,
    };
  }

  const errText = await response.text();

  // Supabase trả về lỗi 409 khi email trùng (Unique constraint)
  if (response.status === 409 || errText.includes('duplicate key') || errText.includes('already exists')) {
    return {
      success: true,
      message: 'Email này đã có trong danh sách nhận tin hàng tuần rồi bạn nhé!',
      alreadySubscribed: true,
    };
  }

  throw new Error(`Không thể đăng ký: ${response.status} - ${errText}`);
}

/**
 * Lấy đúng 8 công cụ mới nhất cho bản tin tuần
 * @returns {Promise<Array>}
 */
export async function fetchWeekly8Tools() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  const url = new URL('/rest/v1/tools', SUPABASE_URL);
  url.searchParams.set('select', 'id,name,tagline,description,pricing_type,link,logo_url,gallery_images,created_at');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '8'); // Luôn cố định chỉ lấy 8 tool

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Lỗi tải 8 tool: ${response.status}`);
  }

  return await response.json();
}
