import { Bot, Boxes, Brain, Code2, Layers, Megaphone, Palette, Puzzle, Search, Sparkles, Zap } from 'lucide-react';

export const ALL_CATEGORY_ID = 'all';

const CATEGORY_ICON_RULES = [
  { match: ['AI'], icon: Brain },
  { match: ['Thi\u1ebft k\u1ebf'], icon: Palette },
  { match: ['L\u1eadp tr\u00ecnh'], icon: Code2 },
  { match: ['Plugin Figma'], icon: Puzzle },
  { match: ['Extension'], icon: Puzzle },
  { match: ['Element Canva'], icon: Boxes },
  { match: ['Marketing'], icon: Megaphone },
  { match: ['N\u0103ng su\u1ea5t'], icon: Zap },
  { match: ['Video & Audio'], icon: Bot },
  { match: ['SEO & Analytics'], icon: Search },
];

export function getCategoryIcon(category = '') {
  const rule = CATEGORY_ICON_RULES.find(({ match }) => match.some((term) => category.includes(term)));
  return rule?.icon || Sparkles;
}

export function getCategoryLabel(category = '') {
  return category || 'Kh\u00e1c';
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
    'Element Canva'
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
