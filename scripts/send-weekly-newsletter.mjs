#!/usr/bin/env node
/**
 * Script gửi bản tin 8 công cụ mới nhất mỗi tuần cho subscribers.
 * 
 * Cách dùng:
 * 1. Xem trước email (không gửi thật):
 *    node scripts/send-weekly-newsletter.mjs --preview
 * 
 * 2. Gửi thử nghiệm cho 1 email cá nhân:
 *    node scripts/send-weekly-newsletter.mjs --to=your-email@gmail.com
 * 
 * 3. Gửi thật cho toàn bộ người đăng ký:
 *    node scripts/send-weekly-newsletter.mjs
 */

import { writeFile } from 'node:fs/promises';

// Đọc file .env
for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file không bắt buộc
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Toolchoice <onboarding@resend.dev>';
// Lọc các công cụ mới thêm từ ngày 01/10/2026
const NEWSLETTER_SINCE_DATE = process.env.NEWSLETTER_SINCE_DATE || '2026-10-01T00:00:00.000Z';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Lỗi: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

// Xử lý tham số dòng lệnh
const args = process.argv.slice(2);
const isPreviewOnly = args.includes('--preview');
const toParam = args.find(a => a.startsWith('--to='))?.split('=')[1];

async function getWeekly8Tools() {
  const url = new URL('/rest/v1/tools', SUPABASE_URL);
  url.searchParams.set('select', 'id,name,tagline,description,pricing_type,link,logo_url,gallery_images,created_at');
  
  // Chỉ lấy các tool tạo từ mốc thời gian quy định (từ 01/10/2026)
  if (NEWSLETTER_SINCE_DATE) {
    url.searchParams.set('created_at', `gte.${NEWSLETTER_SINCE_DATE}`);
  }

  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '8'); // Luôn cố định tối đa 8 tool mới nhất

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không thể lấy danh sách tools từ Supabase: ${res.status}`);
  }

  const tools = await res.json();
  return tools;
}

async function getActiveSubscribers() {
  const url = new URL('/rest/v1/newsletter_subscribers', SUPABASE_URL);
  url.searchParams.set('select', 'id,email,status');
  url.searchParams.set('status', 'eq.active');

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không thể lấy danh sách subscribers: ${res.status}`);
  }

  const subscribers = await res.json();
  return subscribers;
}

function normalizePricing(pricingType = '') {
  const normalized = (pricingType || '').toLowerCase();
  if (normalized.includes('trả phí') || normalized.includes('paid')) {
    return { label: 'TRẢ PHÍ', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
  }
  if (normalized.includes('free trial') || normalized.includes('freemium')) {
    return { label: 'FREEMIUM', bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
  }
  return { label: 'MIỄN PHÍ', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
}

function generateNewsletterHtml(tools) {
  const toolCardsHtml = tools.map((tool, idx) => {
    const pricing = normalizePricing(tool.pricing_type);
    const shortDesc = tool.tagline || (tool.description ? tool.description.slice(0, 100) + '...' : '');
    const logoUrl = tool.logo_url || 'https://pub-1bcef6e2a41541759b3b023a0c59fd5e.r2.dev/logos/default.png';
    const link = tool.link || 'https://toolchoice.site';
    const indexStr = String(idx + 1).padStart(2, '0');

    return `
      <tr>
        <td style="padding: 14px 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="44" valign="top" style="padding-right: 14px;">
                <img src="${logoUrl}" alt="${tool.name}" width="44" height="44" style="border-radius: 7px; object-fit: cover; display: block; border: 1px solid #f4f4f5;" onerror="this.src='https://placehold.co/44x44/f4f4f5/71717a?text=AI';" />
              </td>
              <td valign="top">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #a1a1aa; margin-right: 6px;">
                        ${indexStr}.
                      </span>
                      <span style="font-size: 14px; font-weight: 700; color: #09090b; letter-spacing: -0.2px;">
                        ${tool.name}
                      </span>
                      <span style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background-color: ${pricing.bg}; color: ${pricing.text}; border: 1px solid ${pricing.border}; margin-left: 6px; vertical-align: middle; letter-spacing: 0.5px;">
                        ${pricing.label}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #52525b; padding-top: 4px; line-height: 1.45;">
                      ${shortDesc}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 8px;">
                      <a href="${link}" target="_blank" style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #09090b; text-decoration: none; border-bottom: 1px solid #18181b; padding-bottom: 1px;">
                        Khám phá công cụ &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Các công cụ AI mới cập nhật tuần này - Toolchoice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e4e4e7;">
          
          <!-- Top Clean Header -->
          <tr>
            <td style="padding: 24px 28px 20px 28px; border-bottom: 1px solid #f4f4f5;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; letter-spacing: 1.5px; color: #15803d; font-weight: 700; text-transform: uppercase;">
                      TOOLCHOICE // WEEKLY DISPATCH
                    </div>
                    <h1 style="color: #09090b; font-size: 20px; font-weight: 700; margin: 8px 0 4px 0; letter-spacing: -0.4px;">
                      Các công cụ AI mới nổi bật tuần này
                    </h1>
                    <p style="color: #71717a; font-size: 13px; margin: 0; line-height: 1.45;">
                      Tuyển chọn những công cụ AI mới và hữu ích nhất gửi đến hòm thư của bạn.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tools List Section -->
          <tr>
            <td style="padding: 20px 24px 12px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${toolCardsHtml}
              </table>

              <!-- Bottom CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">
                <tr>
                  <td align="center" style="padding: 16px 0 10px 0;">
                    <a href="https://toolchoice.site" target="_blank" style="background-color: #306D29; color: #ffffff; padding: 12px 28px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; font-weight: 700; border-radius: 6px; text-decoration: none; display: inline-block; letter-spacing: 0.6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                      XEM THÊM CÔNG CỤ TẠI TOOLCHOICE &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 18px 24px; text-align: center; border-top: 1px solid #f4f4f5;">
              <p style="font-size: 12px; color: #71717a; margin: 0 0 6px 0; line-height: 1.5;">
                Bạn nhận được email này vì đã đăng ký nhận tin tại <a href="https://toolchoice.site" style="color: #306D29; text-decoration: none; font-weight: 600;">Toolchoice.site</a>
              </p>
              <p style="font-size: 11px; color: #a1a1aa; margin: 0; line-height: 1.5;">
                Nếu không muốn tiếp tục nhận email này, bạn có thể <a href="https://toolchoice.site?action=unsubscribe" style="color: #71717a; text-decoration: underline;">hủy đăng ký tại đây</a> bất kỳ lúc nào.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendViaResend(toEmails, subject, htmlContent) {
  if (!RESEND_API_KEY) {
    throw new Error('Thiếu RESEND_API_KEY trong file .env');
  }

  const results = [];
  for (const email of toEmails) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [email],
          subject: subject,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(`❌ Gửi thất bại tới ${email}:`, data);
        results.push({ email, success: false, error: data });
      } else {
        console.log(`✅ Đã gửi email thành công tới: ${email} (ID: ${data.id})`);
        results.push({ email, success: true, id: data.id });
      }
    } catch (e) {
      console.error(`❌ Ngoại lệ khi gửi tới ${email}:`, e.message);
      results.push({ email, success: false, error: e.message });
    }
  }

  return results;
}

async function main() {
  console.log('🚀 Bắt đầu quy trình gửi bản tin tuần...');

  // 1. Lấy đúng 8 tool mới nhất (luôn cố định 8 tool dù database có bao nhiêu tool)
  const tools = await getWeekly8Tools();
  console.log(`📦 Đã lấy thành công đúng ${tools.length} công cụ mới nhất:`);
  tools.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} (${t.pricing_type || 'N/A'})`));

  // 2. Tạo template HTML
  const html = generateNewsletterHtml(tools);

  // 3. Nếu là chế độ xem trước (--preview)
  if (isPreviewOnly) {
    await writeFile('preview-newsletter.html', html, 'utf-8');
    console.log('\n📄 ĐÃ TẠO FILE XEM TRƯỚC: preview-newsletter.html');
    console.log('👉 Bạn có thể mở file preview-newsletter.html bằng trình duyệt để xem giao diện email.');
    return;
  }

  // 4. Xác định danh sách email nhận
  let targetEmails = [];
  if (toParam) {
    targetEmails = [toParam];
    console.log(`\n🎯 Chế độ gửi thử nghiệm cho 1 email: ${toParam}`);
  } else {
    const subscribers = await getActiveSubscribers();
    targetEmails = subscribers.map(s => s.email).filter(Boolean);
    console.log(`\n👥 Tổng số subscribers đang active: ${targetEmails.length}`);
  }

  if (targetEmails.length === 0) {
    console.log('⚠️ Không có email nào để gửi.');
    return;
  }

  // 5. Gửi email
  if (!RESEND_API_KEY) {
    console.log('\n⚠️ Chưa cấu hình RESEND_API_KEY trong .env');
    console.log('👉 Đã tự động lưu email mẫu vào preview-newsletter.html');
    await writeFile('preview-newsletter.html', html, 'utf-8');
    console.log('💡 Để gửi thật, hãy đăng ký miễn phí tại https://resend.com, lấy API Key và thêm vào .env:');
    console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxxx');
    return;
  }

  const subject = `Các công cụ AI mới nổi bật tuần này — Toolchoice`;
  await sendViaResend(targetEmails, subject, html);
  console.log('\n🎉 Hoàn thành quy trình gửi bản tin!');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
