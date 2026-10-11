import { fetchPublic, readLimited, publicUrl } from './public-fetch.js';
import { parseReferral, TOOL_CATEGORIES } from '../../../src/lib/tool-intake.js';

const MINIMUM_PAGE_TEXT_LENGTH = 100;
const MAXIMUM_PAGE_TEXT_LENGTH = 16000;
const MAXIMUM_RESEARCH_PAGES = 2;

function textField(value, key, maxLength) {
  return typeof value[key] === 'string' ? value[key].trim().slice(0, maxLength) : '';
}

export function pageContent(html, url) {
  // Title extraction with fallbacks
  const title = (
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    || html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i)?.[1]
    || ''
  ).trim();

  // Robust meta description (matches regardless of attribute order)
  const description = (
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1]
    || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i)?.[1]
    || html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i)?.[1]
    || ''
  ).trim();

  // Extract core headings (h1, h2, h3) where key value propositions live
  const headings = [];
  for (const match of html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const headingText = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (headingText && headingText.length > 3 && headingText.length < 200 && !headings.includes(headingText)) {
      headings.push(headingText);
    }
  }

  // Extract key bullet points / features
  const features = [];
  for (const match of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const liText = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (liText && liText.length > 10 && liText.length < 250 && !features.includes(liText)) {
      features.push(liText);
    }
  }

  // Strip scripts, styles, navigation, footer and other noise
  const cleanHtml = html
    .replace(/<(script|style|noscript|svg|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp);/g, ' ')
    .replace(/&(?:amp);/g, '&')
    .replace(/&(?:quot);/g, '"')
    .replace(/&(?:#39|apos);/g, "'")
    .replace(/&(?:lt);/g, '<')
    .replace(/&(?:gt);/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const link = new URL(match[1].replace(/&amp;/g, '&'), url);
      const isRelevant = /pricing|features|about|docs/i.test(link.pathname + match[2]);
      if (link.origin === new URL(url).origin && isRelevant && !links.includes(link.href)) {
        links.push(link.href);
      }
    } catch { /* Invalid external links are not research sources. */ }
  }

  return {
    title,
    description,
    headings: headings.slice(0, 12),
    features: features.slice(0, 10),
    text: cleanHtml.slice(0, MAXIMUM_PAGE_TEXT_LENGTH),
    links: links.slice(0, MAXIMUM_RESEARCH_PAGES),
  };
}

export async function readPage(url, env = {}) {
  const result = await fetchPublic(url);
  if (!result.response.ok) {
    await result.response.body?.cancel();
    throw Object.assign(new Error(`Website trả lỗi HTTP ${result.response.status}.`), { status: 422 });
  }

  const contentType = result.response.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    await result.response.body?.cancel();
    throw new Error('Link không trả về trang HTML.');
  }

  const html = new TextDecoder().decode(await readLimited(result.response, 1000000));
  let content = pageContent(html, result.url);
  if (content.text.length < MINIMUM_PAGE_TEXT_LENGTH && env.BROWSER) {
    const origin = new URL(result.url).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rendered = await env.BROWSER.quickAction('content', {
      url: result.url,
      gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
      allowRequestPattern: [`^${origin}(?:/|$)`],
      rejectResourceTypes: ['image', 'media', 'font'],
    });
    if (!rendered.ok) throw Object.assign(new Error('Không thể đọc website chạy JavaScript. Hãy thử lại hoặc nhập thủ công.'), { status: 422 });
    const bytes = await readLimited(rendered, 2000000);
    const text = new TextDecoder().decode(bytes);
    let renderedHtml = text;
    if (/application\/json/i.test(rendered.headers.get('content-type') || '')) {
      const data = JSON.parse(text);
      renderedHtml = typeof data.result === 'string' ? data.result : '';
    }
    content = pageContent(renderedHtml, result.url);
  }
  if (content.text.length < MINIMUM_PAGE_TEXT_LENGTH) {
    throw Object.assign(new Error('Website không cung cấp đủ nội dung để AI phân tích. Bạn có thể nhập thủ công.'), { status: 422 });
  }
  return { url: result.url, ...content };
}

export function normalizeDraft(value, originalLink) {
  if (!value || typeof value !== 'object') throw new Error('AI trả kết quả không hợp lệ. Vui lòng thử lại.');

  const pros = Array.isArray(value.pros)
    ? value.pros
        .filter(item => typeof item === 'string' && item.trim())
        .map(item => item.trim().replace(/^[-*•]\s*/, ''))
        .slice(0, 8)
        .join('\n')
    : textField(value, 'pros', 8000);

  const categories = Array.isArray(value.categories)
    ? [...new Set(value.categories.filter(category => TOOL_CATEGORIES.includes(category)))]
    : [];

  let rawPricing = String(value.pricing_type || '').trim();
  let pricingType = 'Unknown';
  if (/^free$/i.test(rawPricing)) {
    pricingType = 'Free';
  } else if (/^(freemium|free\s*trial)$/i.test(rawPricing)) {
    pricingType = 'Freemium';
  } else if (/^paid$/i.test(rawPricing)) {
    pricingType = 'Paid';
  }

  let name = textField(value, 'name', 200);
  // Clean off extraneous domain suffixes or SEO slogans if included
  name = name.replace(/\s*[-–|:]\s+.*$/, '').replace(/\.(com|io|ai|net|org|app|dev|co)$/i, '').trim();

  const draft = {
    name,
    tagline: textField(value, 'tagline', 500),
    description: textField(value, 'description', 16000),
    pros: pros.slice(0, 8000),
    pricing_type: pricingType,
    categories,
    referral_offer: textField(value, 'referral_offer', 2000),
    promotion_description: textField(value, 'promotion_description', 2000),
    ...parseReferral(originalLink),
  };

  if (!draft.name || !draft.tagline || !draft.description) throw new Error('AI chưa tìm đủ thông tin. Hãy thử lại hoặc bổ sung thủ công.');
  if (!draft.categories.length) draft.categories = ['Khác'];
  draft.has_promotion = Boolean(draft.promotion_code || draft.promotion_description);
  return draft;
}

export async function analyzeWebsite(originalLink, env, notes = '') {
  if (!env.AI) throw Object.assign(new Error('Chưa cấu hình Cloudflare Workers AI.'), { status: 503 });
  const url = publicUrl(originalLink);
  url.search = '';
  const first = await readPage(url.href, env);
  const pages = [first];
  const warnings = [];
  for (const link of first.links) {
    try { pages.push(await readPage(link, env)); } catch (error) { warnings.push(`Không đọc được ${link}: ${error.message}`); }
  }

  const trimmedNotes = typeof notes === 'string' ? notes.trim().slice(0, 1000) : '';

  const system = `Bạn là chuyên gia biên tập nội dung công nghệ cho danh mục công cụ trực tuyến ToolChoice (website dành cho người đi làm, designer, developer, marketer và sinh viên Việt Nam).

Nhiệm vụ: Đọc thông tin website được cung cấp và viết bài giới thiệu công cụ bằng tiếng Việt CHUẨN XÁC, DỄ HIỂU, TỰ NHIÊN, CÓ TÍNH ỨNG DỤNG CAO và TRÁNH MỌI TỪ NGỮ CHUNG CHUNG SÁO RỖNG.

YÊU CẦU CHI TIẾT CHO TỪNG TRƯỜNG DỮ LIỆU:

1. "name" (Tên công cụ):
- Chỉ lấy TÊN THƯƠNG HIỆU GỐC của sản phẩm (Ví dụ: "Jitter", "Cursor", "Canva", "Midjourney", "v0").
- TUYỆT ĐỐI BỎ các từ bổ trợ, khẩu hiệu, đuôi miền hoặc từ khóa SEO (Bỏ ".com", ".io", "- Official Site", "Best Tool for...").

2. "tagline" (Khẩu hiệu giới thiệu ngắn gọn):
- Đúng 1 câu súc tích (12 - 25 từ), truyền tải ngay: [Công cụ là gì] + [Làm được gì nổi bật nhất / Giải quyết vấn đề gì] + [Dành cho ai].
- Giữ nguyên các thuật ngữ kỹ thuật phổ biến (UI/UX, motion design, vector, API, prompt, plugin...) nếu cần, KHÔNG dịch gượng ép (Ví dụ: ĐỪNG dịch "motion design" thành "hoạt hình chuyển động", ĐỪNG dịch "collaborative" thành "hợp tác").
- TUYỆT ĐỐI TRÁNH câu khẩu hiệu sáo rỗng vô nghĩa như: "Nền tảng tiên tiến nâng tầm trải nghiệm...", "Giải pháp toàn diện tối ưu hóa hiệu quả...".

3. "description" (Mô tả chi tiết chuyên sâu):
- Bắt buộc chia thành đúng 2 đến 3 đoạn văn ngắn gọn, mạch lạc, phân tách nhau bằng đúng 2 dấu xuống dòng (\\n\\n). Tổng độ dài khoảng 120 - 250 từ.
- Đoạn 1 (Định vị & Bài toán): Công cụ là gì, hoạt động ở đâu (web, extension, app, desktop), ra đời để giải quyết vấn đề khó khăn nào của người dùng (hoặc thay thế/bổ trợ phần mềm nào).
- Đoạn 2 (Tính năng cốt lõi & Cơ chế hoạt động): Trình bày cụ thể 2-3 tính năng hoặc công nghệ nổi bật nhất có trên website (ví dụ: kéo thả trực quan, plugin liên kết với Figma, xuất video độ phân giải cao, thư viện mẫu phong phú...). Nói rõ cách người dùng thao tác thực tế.
- Đoạn 3 (Đối tượng phù hợp & Lợi ích): Công cụ phù hợp cho đối tượng nào (designer, lập trình viên, content creator, marketer...) và mang lại giá trị thiết thực gì (tiết kiệm thời gian, không cần kỹ năng chuyên sâu phức tạp...).

4. "pros" (Ưu điểm / Tính năng nổi bật):
- Mảng gồm 4 đến 6 gạch đầu dòng ngắn gọn, súc tích.
- MỖI GẠCH ĐẦU DÒNG PHẢI LÀ MỘT TÍNH NĂNG KỸ THUẬT HOẶC ĐIỂM MẠNH CỤ THỂ CÓ BẰNG CHỨNG TRÊN TRANG (Ví dụ: "Tích hợp plugin Figma, đồng bộ thiết kế nhanh chóng", "Hỗ trợ xuất định dạng MP4, GIF và Lottie JSON", "Cung cấp sẵn hơn 100+ template hoạt họa bản quyền", "Có gói miễn phí sử dụng trực tiếp trên trình duyệt không cần cài đặt").
- NGHIÊM CẤM các câu chung chung như: "Dễ sử dụng", "Giao diện thân thiện", "Hiệu suất cao", "Đầy đủ tính năng", "Tiết kiệm thời gian".

5. "categories" (Danh mục phù hợp):
- Chọn từ 1 đến 3 danh mục thực sự liên quan nhất từ danh sách: ${JSON.stringify(TOOL_CATEGORIES)}.
- ĐẶC BIỆT LƯU Ý: Chỉ chọn "AI" nếu công cụ thực sự tích hợp trí tuệ nhân tạo (Generative AI, AI models, machine learning). Đừng chọn "AI" cho các công cụ đồ họa hoặc tiện ích truyền thống.

6. "pricing_type" (Hình thức thanh toán):
- Chọn một trong các giá trị: "Free" (hoàn toàn miễn phí/open-source), "Freemium" (có gói miễn phí dùng được + có gói trả phí hoặc có Free Trial/Credits đăng ký), "Paid" (chỉ có trả phí), "Unknown" (website không nêu rõ thông tin giá).

7. "referral_offer" và "promotion_description":
- "referral_offer": Nếu website có ưu đãi cụ thể khi đăng ký (như tặng credit, dùng thử Pro 14 ngày), ghi ngắn gọn. Nếu không có để chuỗi rỗng "".
- "promotion_description": Nếu có giảm giá công khai trên trang thì ghi rõ, không có để chuỗi rỗng "".

NGUYÊN TẮC HÀNH VĂN (TONE OF VOICE):
- Tự nhiên, trong sáng, gãy gọn, văn phong của chuyên gia công nghệ Việt Nam đánh giá phần mềm.
- Không dịch nguyên văn từng từ tiếng Anh (word-by-word translation).
- Cấm hoàn toàn các từ quảng cáo quá đà (buzzwords): "đột phá", "vô song", "thay đổi cuộc chơi", "đỉnh cao", "hoàn hảo".

VÍ DỤ MẪU:
Dữ liệu website: Jitter (https://jitter.video)
Đầu ra JSON:
{
  "name": "Jitter",
  "tagline": "Công cụ thiết kế chuyển động (motion design) trực quan trên web, tạo hoạt ảnh UI/UX và video ngắn nhanh chóng.",
  "description": "Jitter là nền tảng thiết kế hoạt ảnh và motion design hoạt động trực tiếp trên trình duyệt, giúp người dùng tạo ra các video chuyển động chuyên nghiệp mà không cần dùng đến các phần mềm kỹ thuật phức tạp như After Effects.\\n\\nĐiểm mạnh nổi bật của Jitter là khả năng liên kết mượt mà với Figma; bạn có thể nhập trực tiếp các khung thiết kế vào không gian làm việc chỉ với một cú nhấp chuột và bắt đầu làm chuyển động. Công cụ cung cấp thư viện template phong phú cho nút bấm, text và bài đăng mạng xã hội, đồng thời hỗ trợ xuất file linh hoạt dưới dạng MP4, GIF và Lottie JSON dành cho lập trình viên.\\n\\nJitter đặc biệt phù hợp cho các UI/UX Designer muốn tạo hiệu ứng tương tác mẫu, cũng như Marketer và Content Creator cần dựng video ngắn bắt mắt trong thời gian ngắn.",
  "pros": [
    "Tích hợp plugin Figma giúp đồng bộ trực tiếp thiết kế vào Jitter không bị lỗi định dạng",
    "Thư viện template chuyển động phong phú cho văn bản, nút tương tác và mạng xã hội",
    "Hỗ trợ xuất video chuẩn MP4, ảnh động GIF và định dạng Lottie JSON cho lập trình viên",
    "Chạy mượt mà trực tiếp trên nền tảng web, không cần cài đặt phần mềm nặng máy"
  ],
  "categories": ["Thiết kế", "Video"],
  "pricing_type": "Freemium",
  "referral_offer": "",
  "promotion_description": ""
}

Trả về DUY NHẤT một JSON object hợp lệ theo schema trên.`;

  const websiteInput = {
    website_url: first.url,
    ...(trimmedNotes ? { editor_notes: trimmedNotes } : {}),
    main_page: {
      title: first.title,
      meta_description: first.description,
      key_headings: first.headings,
      key_features_detected: first.features,
      content: first.text.slice(0, 10000),
    },
    sub_pages: pages.slice(1).map(page => ({
      url: page.url,
      title: page.title,
      meta_description: page.description,
      key_headings: page.headings,
      content: page.text.slice(0, 5000),
    })),
  };

  const result = await env.AI.run(env.AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(websiteInput) },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2200,
    temperature: 0.2,
  });

  const raw = result.response;
  let value;
  try {
    value = typeof raw === 'string'
      ? JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''))
      : raw;
  } catch {
    throw new Error('AI không trả JSON hợp lệ. Vui lòng thử lại.');
  }

  return {
    draft: normalizeDraft(value, originalLink),
    sources: pages.map(page => ({
      url: page.url,
      title: page.title || new URL(page.url).hostname,
    })),
    warnings,
  };
}
