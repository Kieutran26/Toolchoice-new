const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rwphopolciuwrmmzztpm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cGhvcG9sY2l1d3JtbXp6dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODYxNDcsImV4cCI6MjA3ODY2MjE0N30._O7Q0NsrEXNDcUbc_xBJwpt_FDBIkiiwErxXFWyJCro';
import { adminJson, adminRequest, uploadAdminImage } from './adminClient';

const TOOL_COLUMNS = [
  'id',
  'name',
  'tagline',
  'description',
  'category_text',
  'pricing_type',
  'pros',
  'link',
  'gallery_images',
  'logo_url',
  'referral_offer',
  'referral_code',
  'referral_parameter',
  'has_promotion',
  'promotion_code',
  'promotion_description',
  'is_featured',
  'is_best_choice',
  'created_at',
  'status',
].join(',');

function normalizePricing(pricingType = '') {
  const normalized = pricingType.toLowerCase();

  if (normalized.includes('trả phí') || normalized.includes('tra phi') || normalized.includes('paid')) {
    return 'paid';
  }

  if (normalized.includes('free trial') || normalized.includes('freemium')) {
    return 'freemium';
  }

  return 'free';
}

function firstImage(galleryImages) {
  return String(galleryImages || '')
    .split(/[\n,;]+/)
    .map((url) => url.trim())
    .find(Boolean) || '';
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

export function normalizeTool(tool) {
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
    referral_code: tool.referral_code || '',
    referral_parameter: tool.referral_parameter || '',
    has_promotion: Boolean(tool.has_promotion),
    promotion_code: tool.promotion_code || '',
    promotion_description: tool.promotion_description || '',
    has_api: false,
    is_trending: Boolean(tool.is_featured || tool.is_best_choice),
    features: listFromText(tool.pros),
    created_date: tool.created_at,

    // Expose raw database values for forms
    raw_tagline: tool.tagline || '',
    raw_description: tool.description || '',
    raw_category_text: tool.category_text || '',
    raw_pricing_type: tool.pricing_type || '',
    raw_pros: tool.pros || '',
    raw_link: tool.link || '',
    raw_gallery_images: tool.gallery_images || '',
    raw_referral_offer: tool.referral_offer || '',
    raw_referral_code: tool.referral_code || '',
    raw_referral_parameter: tool.referral_parameter || '',
    raw_is_featured: Boolean(tool.is_featured),
    raw_is_best_choice: Boolean(tool.is_best_choice),
    raw_status: tool.status || 'approved',
  };
}

export async function listTools(limit = 200) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables.');
  }

  const url = new URL('/rest/v1/tools', SUPABASE_URL);
  url.searchParams.set('select', TOOL_COLUMNS);
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load tools from Supabase: ${response.status}`);
  }

  const tools = await response.json();
  return tools.map(normalizeTool).filter(t => t.id !== 168);
}

export async function listAdminTools() {
  return (await adminRequest('/tools')).map(normalizeTool);
}

export async function createTool(toolData) {
  return normalizeTool(await adminJson('/tools', { ...toolData, status: toolData.status || 'approved' }));
}

export async function updateTool(id, toolData) {
  return normalizeTool(await adminJson('/tools/' + id, toolData, 'PATCH'));
}

export async function deleteTool(id) {
  await adminRequest('/tools/' + id, { method: 'DELETE' });
  return true;
}

export async function uploadImage(file) {
  return (await uploadAdminImage(file)).url;
}
