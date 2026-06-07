import { Bot, Boxes, Brain, Code2, Github, Layers, Megaphone, Palette, Puzzle, Search, Sparkles, Zap } from 'lucide-react';
import { removeVietnameseTones } from './utils';

export const ALL_CATEGORY_ID = 'all';

const CATEGORY_ICON_RULES = [
  { match: ['AI'], icon: Brain },
  { match: ['Thiết kế'], icon: Palette },
  { match: ['Lập trình'], icon: Code2 },
  { match: ['Repo Github'], icon: Github },
  { match: ['Plugin Figma'], icon: Puzzle },
  { match: ['Extension'], icon: Puzzle },
  { match: ['Marketing'], icon: Megaphone },
  { match: ['Năng suất'], icon: Zap },
  { match: ['Video & Audio'], icon: Bot },
  { match: ['SEO & Analytics'], icon: Search },
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
  'nang-suat': 'Năng suất',
  'lap-trinh': 'Lập trình',
  'plugin-figma': 'Plugin Figma',
  'repo-github': 'Repo Github',
  'marketing': 'Marketing',
  'extension': 'Extension',
  'video-audio': 'Video & Audio',
  'seo-analytics': 'SEO & Analytics',
  'khac': 'Khác'
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
  'free': 'mieng-phi',
  'freemium': 'free-trial',
  'paid': 'tra-phi'
};

const SLUG_TO_PRICING_MAP = {
  'mieng-phi': 'free',
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
  const keys = isLoaded ? Object.keys(categoryCounts) : [
    'Thiết kế',
    'AI',
    'Năng suất',
    'Lập trình',
    'Plugin Figma',
    'Khác',
    'Marketing',
    'Extension',
    'Video & Audio',
    'SEO & Analytics',
    'Repo Github'
  ];

  const categories = keys.map(category => ({
    id: category,
    label: getCategoryLabel(category),
    icon: getCategoryIcon(category),
    count: isLoaded ? (categoryCounts[category] || 0) : null,
  }));

  if (isLoaded) {
    categories.sort((a, b) => b.count - a.count);
  }

  return [
    { id: ALL_CATEGORY_ID, label: 'Tất cả công cụ', icon: Layers, count: null },
    ...categories,
  ];
}
