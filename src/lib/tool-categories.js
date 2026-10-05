import { Bot, Boxes, Brain, Code2, Github, Layers, Megaphone, Palette, Puzzle, Search, Sparkles, Video as VideoIcon, Zap } from 'lucide-react';
import { removeVietnameseTones } from './utils';

export const ALL_CATEGORY_ID = 'all';

export const TOP_CATEGORIES = [
  'Thiết kế',
  'AI',
  'Lập trình',
  'Năng suất',
  'Marketing',
  'Repo GitHub',
  'Khác',
  'Plugin Figma',
  'Extension',
  'Video',
  'SEO & Analytics'
];

const CATEGORY_ICON_RULES = [
  { match: ['AI'], icon: Brain },
  { match: ['Thiết kế'], icon: Palette },
  { match: ['Lập trình'], icon: Code2 },
  { match: ['Repo GitHub'], icon: Github },
  { match: ['Plugin Figma'], icon: Puzzle },
  { match: ['Extension'], icon: Puzzle },
  { match: ['Marketing'], icon: Megaphone },
  { match: ['Năng suất'], icon: Zap },
  { match: ['Video'], icon: VideoIcon },
  { match: ['SEO'], icon: Search },
];

export function getCategoryIcon(category = '') {
  const rule = CATEGORY_ICON_RULES.find(({ match }) => match.some((term) => category.includes(term)));
  return rule?.icon || Sparkles;
}

export function getCategoryLabel(category = '') {
  return category || 'Khác';
}

const CATEGORY_SLUGS_MAP = {
  'thiet-ke': 'Thiết kế',
  'ai': 'AI',
  'lap-trinh': 'Lập trình',
  'nang-suat': 'Năng suất',
  'marketing': 'Marketing',
  'repo-github': 'Repo GitHub',
  'khac': 'Khác',
  'plugin-figma': 'Plugin Figma',
  'extension': 'Extension',
  'video': 'Video',
  'video-audio': 'Video',
  'seo-analytics': 'SEO & Analytics',
  'seo': 'SEO & Analytics'
};

export function categoryToSlug(category = '') {
  if (!category) return '';
  if (category === ALL_CATEGORY_ID) return ALL_CATEGORY_ID;
  
  for (const [slug, name] of Object.entries(CATEGORY_SLUGS_MAP)) {
    if (name.toLowerCase() === category.toLowerCase()) {
      return slug;
    }
  }

  return removeVietnameseTones(category)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function slugToCategory(slug = '', availableCategories = []) {
  if (!slug) return '';
  if (slug === ALL_CATEGORY_ID) return ALL_CATEGORY_ID;
  
  const normalizedSlug = slug.toLowerCase();
  if (CATEGORY_SLUGS_MAP[normalizedSlug]) {
    return CATEGORY_SLUGS_MAP[normalizedSlug];
  }

  const dynamicMatch = availableCategories.find(
    (cat) => categoryToSlug(cat) === normalizedSlug
  );
  return dynamicMatch || slug;
}

const PRICING_TO_SLUG_MAP = {
  'free': 'mien-phi',
  'freemium': 'free-trial',
  'paid': 'tra-phi'
};

const SLUG_TO_PRICING_MAP = {
  'mien-phi': 'free',
  'free': 'free',
  'free-trial': 'freemium',
  'freemium': 'freemium',
  'tra-phi': 'paid',
  'paid': 'paid'
};

export function pricingToSlug(pricing = '') {
  return PRICING_TO_SLUG_MAP[pricing] || '';
}

export function slugToPricing(slug = '') {
  if (!slug) return null;
  return SLUG_TO_PRICING_MAP[slug.toLowerCase()] || null;
}

export function buildCategoryOptions(categoryCounts = {}) {
  const isLoaded = Object.keys(categoryCounts).length > 0;

  // Lọc và chỉ hiển thị đúng 11 danh mục được chọn
  const categories = TOP_CATEGORIES.map(category => ({
    id: category,
    label: getCategoryLabel(category),
    icon: getCategoryIcon(category),
    count: isLoaded ? (categoryCounts[category] || 0) : null,
  }));

  if (isLoaded) {
    categories.sort((a, b) => (b.count || 0) - (a.count || 0));
  }

  // Danh sách gồm 'Tất cả công cụ' + 11 danh mục chuyên môn (tổng cộng 12 mục)
  return [
    { id: ALL_CATEGORY_ID, label: 'Tất cả công cụ', icon: Layers, count: null },
    ...categories,
  ];
}
