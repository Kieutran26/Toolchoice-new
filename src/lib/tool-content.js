import { removeVietnameseTones } from './utils.js';

export function slugifyText(text = '') {
  return removeVietnameseTones(String(text || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getToolSlug(tool) {
  if (!tool) return '';
  const base = slugifyText(tool.name) || 'cong-cu';
  return `${base}-${tool.id}`;
}

export function findToolBySlug(tools = [], slugParam = '') {
  if (!slugParam || !Array.isArray(tools) || tools.length === 0) return null;
  const clean = String(slugParam).toLowerCase().trim();

  // 1. Exact match on getToolSlug(tool)
  const exact = tools.find((t) => getToolSlug(t) === clean);
  if (exact) return exact;

  // 2. Match trailing -<id>
  const idMatch = clean.match(/-(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const byId = tools.find((t) => Number(t.id) === id);
    if (byId) return byId;
  }

  // 3. Match pure numeric ID
  if (/^\d+$/.test(clean)) {
    const byNumeric = tools.find((t) => Number(t.id) === Number(clean));
    if (byNumeric) return byNumeric;
  }

  // 4. Match by base name slug
  return tools.find((t) => slugifyText(t.name) === clean) || null;
}

export function getPricingLabelVi(pricing) {
  if (pricing === 'free') return 'Miễn phí';
  if (pricing === 'paid') return 'Trả phí';
  return 'Có gói dùng thử / Freemium';
}


// Render record-backed information only; category membership is not product evidence.
export function buildToolEditorialReview(tool, allTools = []) {
  const primaryCategory = tool.category || tool.categories?.[0] || 'Khác';
  const categoriesJoined = (tool.categories?.length ? tool.categories : [primaryCategory]).join(', ');
  const description = String(tool.full_description || tool.short_description || '').trim();
  const features = [...new Set((tool.features || []).map((item) => String(item).trim()).filter(Boolean))];
  return {
    primaryCategory, categoriesJoined, pricingLabel: getPricingLabelVi(tool.pricing),
    overviewParagraphs: description ? [description] : [],
    prosList: features,
    disclosure: 'Đây là hồ sơ thông tin từ danh mục Toolchoice, không phải báo cáo kiểm thử độc lập. Tính năng và nhãn giá có thể thay đổi; các liên kết có thể chứa mã giới thiệu. Chúng tôi không tự suy ra tốc độ, độ ổn định hoặc ưu nhược điểm từ danh mục hay giá.',
    alternatives: allTools.filter((other) => other.id !== tool.id && (other.category === primaryCategory || other.categories?.includes(primaryCategory)))
      .slice(0, 4).map((other) => ({ id: other.id, name: other.name, slug: getToolSlug(other),
        pricingLabel: getPricingLabelVi(other.pricing), shortDescription: other.short_description || other.full_description || '' })),
  };
}

export function getSafeWebsiteUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}
