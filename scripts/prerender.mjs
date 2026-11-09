import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOG_POSTS } from '../src/data/blog-posts.js';
import { CATEGORY_EDITORIAL_GUIDES } from '../src/data/category-guides.js';
import { buildToolEditorialReview, getToolSlug, getPricingLabelVi } from '../src/lib/tool-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITE_ORIGIN = 'https://www.toolchoice.site';

const CATEGORY_SLUGS = [
  { slug: 'ai', name: 'AI' },
  { slug: 'thiet-ke', name: 'Thiết kế' },
  { slug: 'lap-trinh', name: 'Lập trình' },
  { slug: 'nang-suat', name: 'Năng suất' },
  { slug: 'marketing', name: 'Marketing' },
  { slug: 'repo-github', name: 'Repo GitHub' },
  { slug: 'plugin-figma', name: 'Plugin Figma' },
  { slug: 'extension', name: 'Extension' },
  { slug: 'video', name: 'Video' },
  { slug: 'seo-analytics', name: 'SEO & Analytics' },
  { slug: 'khac', name: 'Khác' },
];

function escapeHtml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePricing(pricingType = '') {
  const normalized = String(pricingType || '').toLowerCase();
  if (normalized.includes('trả phí') || normalized.includes('tra phi') || normalized.includes('paid')) {
    return 'paid';
  }
  if (normalized.includes('free trial') || normalized.includes('freemium')) {
    return 'freemium';
  }
  return 'free';
}

function firstImage(galleryImages) {
  return (
    String(galleryImages || '')
      .split(/[\n,;]+/)
      .map((url) => url.trim())
      .find(Boolean) || ''
  );
}

function listFromText(text) {
  return String(text || '')
    .split(/\r?\n|;|\u2022/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCategories(categoryText) {
  const categories = String(categoryText || '')
    .split(';')
    .map((category) => {
      const trimmed = category.trim();
      if (trimmed === 'SEO') return 'SEO & Analytics';
      if (trimmed === 'Video & Audio') return 'Video';
      return trimmed;
    })
    .filter(Boolean);

  const unique = Array.from(new Set(categories));
  return unique.length > 0 ? unique : ['Khác'];
}

function normalizeTool(tool) {
  const categories = splitCategories(tool.category_text);
  return {
    id: tool.id,
    name: tool.name,
    short_description: tool.tagline || tool.description,
    full_description: tool.description,
    category: categories[0],
    categories,
    pricing: normalizePricing(tool.pricing_type),
    feature_image_url: firstImage(tool.gallery_images),
    logo_url: tool.logo_url,
    website_url: tool.link,
    referral_offer: tool.referral_offer || '',
    has_promotion: Boolean(tool.has_promotion),
    promotion_code: tool.promotion_code || '',
    promotion_description: tool.promotion_description || '',
    features: listFromText(tool.pros),
    created_date: tool.created_at,
  };
}

function renderSharedHeaderHtml() {
  return `
    <header style="padding:16px 24px;border-bottom:1px solid #e2e8f0;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;">
      <a href="/" style="font-weight:700;font-size:18px;text-decoration:none;color:inherit;">TOOLCHOICE</a>
      <nav aria-label="Điều hướng chính" style="display:flex;flex-wrap:wrap;gap:14px;font-size:14px;">
        <a href="/">Tất cả công cụ</a>
        <a href="/category/ai">Công cụ AI</a>
        <a href="/category/thiet-ke">Thiết kế</a>
        <a href="/category/lap-trinh">Lập trình</a>
        <a href="/category/nang-suat">Năng suất</a>
        <a href="/category/marketing">Marketing</a>
        <a href="/deals">Deals &amp; Ưu đãi</a>
        <a href="/blog">Blog &amp; Cẩm nang</a>
        <a href="/choosing-tools.html">Cách chọn công cụ</a>
        <a href="/about.html">Giới thiệu</a>
        <a href="/contact.html">Liên hệ</a>
        <a href="/terms.html">Điều khoản</a>
        <a href="/privacy.html">Quyền riêng tư</a>
      </nav>
    </header>
  `;
}

function renderSharedFooterHtml() {
  return `
    <footer style="padding:32px 24px;border-top:1px solid #e2e8f0;margin-top:48px;font-size:13px;line-height:1.6;">
      <div style="max-width:1100px;margin:0 auto;">
        <p><strong>Toolchoice (https://www.toolchoice.site)</strong> — Nền tảng tiếng Việt tổng hợp, đánh giá ưu nhược điểm, hướng dẫn sử dụng thực tế và so sánh các công cụ AI, thiết kế, lập trình, năng suất và marketing.</p>
        <p>Liên hệ hỗ trợ &amp; góp ý nội dung: <a href="mailto:support@toolchoice.site">support@toolchoice.site</a></p>
        <nav aria-label="Liên kết bắt buộc và chính sách" style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px;">
          <a href="/">Trang chủ</a>
          <a href="/blog">Blog &amp; Cẩm nang</a>
          <a href="/deals">Deals &amp; Ưu đãi</a>
          <a href="/choosing-tools.html">Hướng dẫn chọn công cụ</a>
          <a href="/about.html">Giới thiệu</a>
          <a href="/contact.html">Liên hệ</a>
          <a href="/privacy.html">Chính sách quyền riêng tư &amp; Cookie</a>
          <a href="/terms.html">Điều khoản sử dụng</a>
          <a href="/sitemap.xml">Sitemap XML</a>
        </nav>
      </div>
    </footer>
  `;
}

function buildPageHtml(templateHtml, { title, description, canonicalPath, ogType = 'website', ogImage = `${SITE_ORIGIN}/logo.png`, jsonLd, bodyHtml }) {
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath.replace(/\/+$/, '')}`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeCanonical = escapeHtml(canonicalUrl);
  const safeOgImage = escapeHtml(ogImage);

  let html = templateHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeOgImage}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="twitter:description" content="${safeDesc}" />`
  );

  if (jsonLd) {
    const ldTag = `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(jsonLd)}</script>\n  </head>`;
    html = html.replace('</head>', ldTag);
  }

  const fullRootInner = `
    <div class="prerendered-view" style="max-width:1100px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;line-height:1.65;">
      ${renderSharedHeaderHtml()}
      <main style="padding:24px;">
        ${bodyHtml}
      </main>
      ${renderSharedFooterHtml()}
    </div>
  `;

  html = html.replace('<div id="root"></div>', `<div id="root">${fullRootInner}</div>`);
  return html;
}

function writeRouteHtml(routePath, htmlContent) {
  const cleanRoute = routePath.replace(/^\/+|\/+$/g, '');
  const targetFile = cleanRoute
    ? path.join(DIST_DIR, cleanRoute, 'index.html')
    : path.join(DIST_DIR, 'index.html');
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, htmlContent, 'utf8');
}

function renderToolListHtml(tools) {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:20px;">
      ${tools
        .map((t) => {
          const slug = getToolSlug(t);
          return `
            <article style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
              <h3 style="margin:0 0 8px 0;font-size:17px;">
                <a href="/tool/${slug}">${escapeHtml(t.name)}</a>
              </h3>
              <p style="font-size:12px;color:#475569;margin:0 0 8px 0;">
                Danh mục: ${escapeHtml(t.categories.join(', '))} · Mô hình giá: <strong>${escapeHtml(getPricingLabelVi(t.pricing))}</strong>
              </p>
              <p style="font-size:14px;margin:0 0 12px 0;">${escapeHtml(t.short_description)}</p>
              <a href="/tool/${slug}" style="font-size:13px;font-weight:600;">Đọc bài đánh giá, ưu nhược điểm &amp; hướng dẫn →</a>
            </article>
          `;
        })
        .join('\n')}
    </div>
  `;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist directory does not exist. Run vite build first.');
  }

  const templateHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const rawSnapshot = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'src/data/tools-snapshot.json'), 'utf8')
  );
  const tools = rawSnapshot.map(normalizeTool).filter((t) => t.id !== 168);

  const sitemapUrls = new Set([
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/deals`,
    `${SITE_ORIGIN}/blog`,
    `${SITE_ORIGIN}/about.html`,
    `${SITE_ORIGIN}/contact.html`,
    `${SITE_ORIGIN}/privacy.html`,
    `${SITE_ORIGIN}/terms.html`,
    `${SITE_ORIGIN}/choosing-tools.html`,
  ]);

  // 1. Prerender Home (/)
  const homeBody = `
    <section>
      <h1>Toolchoice — Nền tảng đánh giá, so sánh &amp; hướng dẫn sử dụng công cụ AI, Thiết kế, Lập trình</h1>
      <p>Khám phá hơn ${tools.length} công cụ phần mềm được chọn lọc và phân tích chuyên sâu bằng tiếng Việt. Mỗi công cụ trên Toolchoice đều có bài đánh giá riêng biệt về tính năng, ưu nhược điểm thực tế, hướng dẫn sử dụng 4 bước và bảng so sánh trực tiếp với các giải pháp thay thế.</p>
      <h2>Chuyên mục Cẩm nang &amp; Hướng dẫn thực chiến nổi bật</h2>
      <ul>
        ${BLOG_POSTS.map(
          (post) =>
            `<li><a href="/blog/${post.slug}"><strong>${escapeHtml(post.title)}</strong></a> — ${escapeHtml(post.excerpt)}</li>`
        ).join('\n')}
      </ul>
      <h2>Khám phá theo Danh mục chuyên môn</h2>
      <ul>
        ${CATEGORY_SLUGS.map((cat) => {
          const guide = CATEGORY_EDITORIAL_GUIDES[cat.name];
          return `<li><a href="/category/${cat.slug}"><strong>${escapeHtml(cat.name)}</strong></a>: ${escapeHtml(guide?.subtitle || '')}</li>`;
        }).join('\n')}
      </ul>
      <h2>Danh sách công cụ nổi bật &amp; mới cập nhật (${tools.length} công cụ)</h2>
      ${renderToolListHtml(tools.slice(0, 120))}
    </section>
  `;

  const homeHtml = buildPageHtml(templateHtml, {
    title: 'Toolchoice - Nền tảng đánh giá, so sánh & khám phá công cụ AI, phần mềm tiện ích',
    description:
      'Toolchoice là nền tảng tiếng Việt tổng hợp, đánh giá ưu nhược điểm, hướng dẫn sử dụng thực tế và so sánh hơn 360 công cụ AI, thiết kế, lập trình, năng suất và marketing.',
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Toolchoice',
      url: SITE_ORIGIN,
      description:
        'Nền tảng tiếng Việt tổng hợp, đánh giá ưu nhược điểm, hướng dẫn sử dụng và so sánh các công cụ AI, phần mềm tiện ích.',
    },
    bodyHtml: homeBody,
  });
  writeRouteHtml('/', homeHtml);

  // 2. Prerender Category Pages (/category/:slug)
  for (const cat of CATEGORY_SLUGS) {
    const guide = CATEGORY_EDITORIAL_GUIDES[cat.name] || CATEGORY_EDITORIAL_GUIDES['Khác'];
    const catTools = tools.filter((t) => t.categories.includes(cat.name));
    const routePath = `/category/${cat.slug}`;
    sitemapUrls.add(`${SITE_ORIGIN}${routePath}`);

    const catBody = `
      <article>
        <p><a href="/">Trang chủ</a> / Danh mục ${escapeHtml(cat.name)}</p>
        <h1>${escapeHtml(guide.title)}</h1>
        <p>${escapeHtml(guide.subtitle)}</p>
        <p>${escapeHtml(guide.intro)}</p>
        <h2>Tiêu chí đánh giá và lựa chọn công cụ ${escapeHtml(cat.name)}</h2>
        <ul>
          ${guide.criteria.map((c) => `<li>${escapeHtml(c)}</li>`).join('\n')}
        </ul>
        <p><strong>Lời khuyên thực tế:</strong> ${escapeHtml(guide.workflowTip)}</p>
        <h2>Danh sách ${catTools.length} công cụ thuộc nhóm ${escapeHtml(cat.name)}</h2>
        ${renderToolListHtml(catTools)}
      </article>
    `;

    const catHtml = buildPageHtml(templateHtml, {
      title: `${guide.title} — Đánh giá, Ưu nhược điểm & So sánh | Toolchoice`,
      description: guide.subtitle,
      canonicalPath: routePath,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: guide.title,
        description: guide.subtitle,
        url: `${SITE_ORIGIN}${routePath}`,
      },
      bodyHtml: catBody,
    });
    writeRouteHtml(routePath, catHtml);
  }

  // 3. Prerender Pricing Filter Pages
  const pricingRoutes = [
    { slug: 'mien-phi', key: 'free', label: 'Miễn phí' },
    { slug: 'free-trial', key: 'freemium', label: 'Có gói dùng thử / Freemium' },
    { slug: 'tra-phi', key: 'paid', label: 'Trả phí' },
  ];
  for (const pr of pricingRoutes) {
    const prTools = tools.filter((t) => t.pricing === pr.key);
    const routePath = `/pricing/${pr.slug}`;
    sitemapUrls.add(`${SITE_ORIGIN}${routePath}`);

    const prHtml = buildPageHtml(templateHtml, {
      title: `Danh sách công cụ ${pr.label} tốt nhất — Đánh giá & So sánh | Toolchoice`,
      description: `Tổng hợp ${prTools.length} công cụ và phần mềm thuộc nhóm ${pr.label} trên Toolchoice, kèm phân tích ưu nhược điểm và hướng dẫn sử dụng.`,
      canonicalPath: routePath,
      bodyHtml: `
        <section>
          <h1>Danh sách công cụ ${escapeHtml(pr.label)} (${prTools.length} công cụ)</h1>
          <p>Tổng hợp các công cụ thuộc mô hình giá ${escapeHtml(pr.label)} đã được phân loại và đánh giá chi tiết trên Toolchoice.</p>
          ${renderToolListHtml(prTools.slice(0, 100))}
        </section>
      `,
    });
    writeRouteHtml(routePath, prHtml);
  }

  // 4. Prerender Deals (/deals)
  const deals = tools.filter((t) => t.has_promotion || t.referral_offer || t.promotion_code);
  const dealsHtml = buildPageHtml(templateHtml, {
    title: 'Deals, Mã Giảm Giá & Ưu Đãi Công Cụ AI, Phần Mềm | Toolchoice',
    description:
      'Tổng hợp mã giảm giá (Promo Codes), ưu đãi dùng thử mở rộng (Referral Offers) và kinh nghiệm tối ưu chi phí thuê bao phần mềm SaaS, công cụ AI trên Toolchoice.',
    canonicalPath: '/deals',
    bodyHtml: `
      <article>
        <h1>Deals, Mã giảm giá &amp; Ưu đãi Phần mềm trên Toolchoice</h1>
        <p>Danh sách tổng hợp các chương trình khuyến mãi, mã giảm giá và ưu đãi giới thiệu chính thức từ các nhà phát triển công cụ AI, thiết kế và năng suất.</p>
        <h2>Các ưu đãi đang hoạt động (${deals.length} công cụ)</h2>
        ${renderToolListHtml(deals)}
        <h2>Nguyên tắc cần kiểm tra trước khi đăng ký gói khuyến mãi</h2>
        <ul>
          <li>Kiểm tra chu kỳ gia hạn tự động (Auto-Renewal) và mức giá áp dụng sau khi hết thời gian khuyến mãi đầu tiên.</li>
          <li>Đối chiếu số lượng lượt sử dụng (credits) và quyền thương mại đối với kết quả đầu ra.</li>
          <li>Đọc kỹ chính sách hoàn tiền (Refund Policy) và thử nghiệm xuất dữ liệu trên gói miễn phí trước khi nâng cấp.</li>
        </ul>
      </article>
    `,
  });
  writeRouteHtml('/deals', dealsHtml);

  // 5. Prerender Blog Index (/blog) & Individual Blog Posts (/blog/:slug)
  const blogIndexHtml = buildPageHtml(templateHtml, {
    title: 'Blog & Cẩm nang Đánh giá, So sánh Công cụ AI & Phần mềm | Toolchoice',
    description:
      'Các bài viết hướng dẫn thực chiến cách lựa chọn, kết hợp và tối ưu hóa công cụ AI, thiết kế UI/UX, lập trình, PKM và marketing cho công việc hàng ngày.',
    canonicalPath: '/blog',
    bodyHtml: `
      <section>
        <h1>Blog &amp; Cẩm nang lựa chọn, so sánh và ứng dụng công cụ thực chiến</h1>
        <p>Tuyển tập các bài viết hướng dẫn chuyên sâu giúp bạn xây dựng quy trình làm việc hiệu quả, so sánh công cụ khách quan và bảo vệ an toàn dữ liệu.</p>
        ${BLOG_POSTS.map(
          (post) => `
            <article style="border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px;">
              <p style="font-size:12px;color:#475569;margin:0 0 6px 0;">${escapeHtml(post.category)} · ${escapeHtml(post.readingTime)} · Cập nhật: ${escapeHtml(post.publishedAt)}</p>
              <h2 style="margin:0 0 8px 0;"><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h2>
              <p>${escapeHtml(post.excerpt)}</p>
              <ul>
                ${post.keyTakeaways.map((k) => `<li>${escapeHtml(k)}</li>`).join('\n')}
              </ul>
              <p><a href="/blog/${post.slug}">Đọc toàn bộ bài viết →</a></p>
            </article>
          `
        ).join('\n')}
      </section>
    `,
  });
  writeRouteHtml('/blog', blogIndexHtml);

  for (const post of BLOG_POSTS) {
    const routePath = `/blog/${post.slug}`;
    sitemapUrls.add(`${SITE_ORIGIN}${routePath}`);

    const postBody = `
      <article>
        <p><a href="/blog">Blog &amp; Cẩm nang</a> / ${escapeHtml(post.category)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p><em>Chuyên mục: ${escapeHtml(post.category)} · Thời lượng: ${escapeHtml(post.readingTime)} · Ngày đăng: ${escapeHtml(post.publishedAt)}</em></p>
        <p>${escapeHtml(post.excerpt)}</p>
        <section style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <h2>Tóm tắt nội dung cốt lõi (Key Takeaways)</h2>
          <ul>
            ${post.keyTakeaways.map((k) => `<li>${escapeHtml(k)}</li>`).join('\n')}
          </ul>
        </section>
        ${post.sections
          .map(
            (sec) => `
            <section>
              <h2>${escapeHtml(sec.heading)}</h2>
              ${(sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
              ${
                sec.bullets
                  ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n')}</ul>`
                  : ''
              }
              ${
                sec.comparisonTable
                  ? `
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;" border="1">
                      <caption>${escapeHtml(sec.comparisonTable.caption || '')}</caption>
                      <thead>
                        <tr>${sec.comparisonTable.headers.map((h) => `<th style="padding:8px;">${escapeHtml(h)}</th>`).join('')}</tr>
                      </thead>
                      <tbody>
                        ${sec.comparisonTable.rows
                          .map(
                            (row) =>
                              `<tr>${row.map((cell) => `<td style="padding:8px;">${escapeHtml(cell)}</td>`).join('')}</tr>`
                          )
                          .join('\n')}
                      </tbody>
                    </table>
                  `
                  : ''
              }
            </section>
          `
          )
          .join('\n')}
      </article>
    `;

    const postHtml = buildPageHtml(templateHtml, {
      title: `${post.title} | Toolchoice`,
      description: post.excerpt,
      canonicalPath: routePath,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { '@type': 'Organization', name: 'Ban biên tập Toolchoice', url: SITE_ORIGIN },
        mainEntityOfPage: `${SITE_ORIGIN}${routePath}`,
      },
      bodyHtml: postBody,
    });
    writeRouteHtml(routePath, postHtml);
  }

  // 6. Prerender Every Individual Tool Review Page (/tool/:slug)
  for (const tool of tools) {
    const slug = getToolSlug(tool);
    const routePath = `/tool/${slug}`;
    sitemapUrls.add(`${SITE_ORIGIN}${routePath}`);

    const review = buildToolEditorialReview(tool, tools);

    const toolBody = `
      <article>
        <p><a href="/">Trang chủ</a> / <a href="/category/${
          CATEGORY_SLUGS.find((c) => c.name === tool.category)?.slug || 'khac'
        }">${escapeHtml(tool.category)}</a> / ${escapeHtml(tool.name)}</p>
        <h1>${escapeHtml(tool.name)} — Đánh giá tính năng, ưu nhược điểm &amp; hướng dẫn sử dụng</h1>
        <p><strong>Mô hình giá:</strong> ${escapeHtml(review.pricingLabel)} · <strong>Danh mục:</strong> ${escapeHtml(review.categoriesJoined)}</p>
        <p>${escapeHtml(tool.short_description)}</p>
        ${
          tool.website_url
            ? `<p><a href="${escapeHtml(tool.website_url)}" rel="noopener noreferrer" target="_blank">Truy cập trang chủ chính thức của ${escapeHtml(tool.name)}</a></p>`
            : ''
        }

        <h2>1. Tổng quan &amp; Phân tích chuyên sâu về ${escapeHtml(tool.name)}</h2>
        ${review.overviewParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}

        <h2>2. Phân tích Ưu điểm &amp; Nhược điểm cần lưu ý</h2>
        <h3>Ưu điểm nổi bật</h3>
        <ul>
          ${review.prosList.map((pro) => `<li>${escapeHtml(pro)}</li>`).join('\n')}
        </ul>
        <h3>Nhược điểm &amp; Hạn chế cần lưu ý</h3>
        <ul>
          ${review.consList.map((con) => `<li>${escapeHtml(con)}</li>`).join('\n')}
        </ul>

        <h2>3. Hướng dẫn sử dụng ${escapeHtml(tool.name)} hiệu quả từng bước</h2>
        <ol>
          ${review.howToSteps
            .map((s) => `<li><strong>${escapeHtml(s.step)}:</strong> ${escapeHtml(s.detail)}</li>`)
            .join('\n')}
        </ol>

        <h2>4. Đối tượng phù hợp &amp; Trường hợp sử dụng</h2>
        <ul>
          ${review.useCases
            .map((u) => `<li><strong>${escapeHtml(u.title)}:</strong> ${escapeHtml(u.description)}</li>`)
            .join('\n')}
        </ul>

        ${
          review.alternatives.length > 0
            ? `
          <h2>5. So sánh ${escapeHtml(tool.name)} với các công cụ thay thế cùng phân khúc</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;" border="1">
            <thead>
              <tr>
                <th style="padding:8px;">Tên công cụ</th>
                <th style="padding:8px;">Mô hình giá</th>
                <th style="padding:8px;">Điểm mạnh chính</th>
              </tr>
            </thead>
            <tbody>
              ${review.alternatives
                .map(
                  (alt) => `
                  <tr>
                    <td style="padding:8px;"><a href="/tool/${alt.slug}">${escapeHtml(alt.name)}</a></td>
                    <td style="padding:8px;">${escapeHtml(alt.pricingLabel)}</td>
                    <td style="padding:8px;">${escapeHtml(alt.shortDescription)}</td>
                  </tr>
                `
                )
                .join('\n')}
            </tbody>
          </table>
        `
            : ''
        }

        <h2>6. Câu hỏi thường gặp (FAQ) về ${escapeHtml(tool.name)}</h2>
        ${review.faqs
          .map(
            (faq) => `
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          `
          )
          .join('\n')}
      </article>
    `;

    const toolHtml = buildPageHtml(templateHtml, {
      title: `Đánh giá ${tool.name}: Tính năng, Ưu nhược điểm, Hướng dẫn & So sánh | Toolchoice`,
      description: `Đánh giá chi tiết ${tool.name} (${review.pricingLabel}): ${tool.short_description} Phân tích ưu nhược điểm, hướng dẫn sử dụng từng bước và so sánh công cụ thay thế.`,
      canonicalPath: routePath,
      ogType: 'article',
      ogImage: tool.feature_image_url || `${SITE_ORIGIN}/logo.png`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: review.categoriesJoined,
        operatingSystem: 'Web, Cloud',
        description: tool.full_description || tool.short_description,
        url: `${SITE_ORIGIN}${routePath}`,
      },
      bodyHtml: toolBody,
    });
    writeRouteHtml(routePath, toolHtml);
  }

  // 7. Write complete sitemap.xml to both public/ and dist/
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(sitemapUrls)
  .map((loc) => `  <url><loc>${escapeHtml(loc)}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  console.log(
    `Prerendered: 1 Home + ${CATEGORY_SLUGS.length} Categories + ${pricingRoutes.length} Pricing + 1 Deals + ${
      BLOG_POSTS.length + 1
    } Blog pages + ${tools.length} Tool Review pages = ${sitemapUrls.size} total canonical URLs in sitemap.xml`
  );
}

main();
