export const TOOL_CATEGORIES = ['Thiết kế', 'AI', 'Lập trình', 'Năng suất', 'Marketing', 'Repo GitHub', 'Khác', 'Plugin Figma', 'Extension', 'Video', 'SEO & Analytics'];

export function parseReferral(value) {
  const result = { referral_code: '', referral_parameter: '', promotion_code: '' };
  try {
    const url = new URL(value);
    url.searchParams.forEach((code, key) => {
      if (!code.trim()) return;
      if (/^(ref|referral|referral_id|referral_code|ref_code|ref_id|reference|reference_id|refer|affiliate|affiliate_id|aff|aff_id|via|invite|invite_code|partner|partner_id|r)$/i.test(key) && !result.referral_code) {
        result.referral_code = code;
        result.referral_parameter = key;
      }
      if (/^(coupon|coupon_code|discount|discount_code|promo|promo_code|promotion_code)$/i.test(key) && !result.promotion_code) result.promotion_code = code;
    });
    const invite = url.pathname.match(/\/(?:ref|refer|referral|invite|affiliate)\/([^/]+)\/?$/i);
    if (invite && !result.referral_code) {
      result.referral_code = decodeURIComponent(invite[1]);
      result.referral_parameter = 'path';
    }
    const hash = url.hash.match(/^#(?:ref|referral|invite|affiliate)=([^&]+)/i);
    if (hash && !result.referral_code) {
      result.referral_code = decodeURIComponent(hash[1]);
      result.referral_parameter = 'hash';
    }
  } catch { /* A partially typed URL has no detected referral yet. */ }
  return result;
}

export function imageUrls(value) {
  if (Array.isArray(value)) return value.filter(url => typeof url === 'string' && url.trim()).map(url => url.trim());
  return String(value || '').split(/[\n,;]+/).map(url => url.trim()).filter(Boolean);
}
