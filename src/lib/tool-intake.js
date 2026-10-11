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

const SHARED_HOSTS = new Set([
  'github.com',
  'gitlab.com',
  'figma.com',
  'notion.so',
  'notion.site',
  'chrome.google.com',
  'chromewebstore.google.com',
  'huggingface.co',
  'twitter.com',
  'x.com',
  'facebook.com',
  'medium.com',
  'substack.com',
  'youtube.com',
]);

export function parseToolUrl(val) {
  try {
    const raw = String(val || '').trim();
    if (!raw) return null;
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.replace(/\/+$/, '').toLowerCase();
    return { host, path, href: url.href };
  } catch {
    return null;
  }
}

export function cleanToolName(val) {
  return String(val || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function findDuplicateTool(tools = [], { name = '', link = '' } = {}, excludeId = null) {
  if (!Array.isArray(tools) || (!name && !link)) return null;

  const targetUrl = parseToolUrl(link);
  const targetName = cleanToolName(name);

  for (const t of tools) {
    if (excludeId && String(t.id) === String(excludeId)) continue;

    // 1. Kiểm tra trùng link / domain
    if (targetUrl?.host) {
      const toolUrl = parseToolUrl(t.link || t.website_url || t.raw_link);
      if (toolUrl && toolUrl.host === targetUrl.host) {
        if (SHARED_HOSTS.has(targetUrl.host)) {
          if (toolUrl.path && targetUrl.path && toolUrl.path === targetUrl.path) {
            return {
              tool: t,
              reason: 'link',
              message: `Trùng liên kết trên ${targetUrl.host} với "${t.name}" (ID #${t.id})`,
            };
          }
        } else {
          return {
            tool: t,
            reason: 'link',
            message: `Trùng tên miền ${targetUrl.host} với công cụ "${t.name}" (ID #${t.id})`,
          };
        }
      }
    }

    // 2. Kiểm tra trùng tên công cụ
    if (targetName && targetName.length >= 3) {
      const toolName = cleanToolName(t.name);
      if (toolName && toolName === targetName) {
        return {
          tool: t,
          reason: 'name',
          message: `Trùng tên với công cụ "${t.name}" (ID #${t.id})`,
        };
      }
    }
  }

  return null;
}

export function auditDuplicateTools(tools = []) {
  if (!Array.isArray(tools) || tools.length === 0) return [];

  const hostGroups = new Map();
  const nameGroups = new Map();

  for (const t of tools) {
    const url = parseToolUrl(t.link || t.website_url || t.raw_link);
    if (url?.host) {
      const isShared = SHARED_HOSTS.has(url.host);
      const key = isShared && url.path ? `${url.host}:${url.path}` : (isShared ? null : url.host);
      if (key) {
        if (!hostGroups.has(key)) hostGroups.set(key, []);
        hostGroups.get(key).push(t);
      }
    }

    const nameKey = cleanToolName(t.name);
    if (nameKey && nameKey.length >= 3) {
      if (!nameGroups.has(nameKey)) nameGroups.set(nameKey, []);
      nameGroups.get(nameKey).push(t);
    }
  }

  const duplicates = [];
  const processedPairKeys = new Set();

  for (const [key, group] of hostGroups.entries()) {
    if (group.length > 1) {
      const ids = group.map(x => x.id).sort().join('-');
      processedPairKeys.add(ids);
      duplicates.push({
        id: `host:${key}`,
        type: 'host',
        key,
        title: `Cùng tên miền: ${key}`,
        tools: group,
      });
    }
  }

  for (const [key, group] of nameGroups.entries()) {
    if (group.length > 1) {
      const ids = group.map(x => x.id).sort().join('-');
      if (!processedPairKeys.has(ids)) {
        processedPairKeys.add(ids);
        duplicates.push({
          id: `name:${key}`,
          type: 'name',
          key,
          title: `Trùng tên công cụ: "${group[0].name}"`,
          tools: group,
        });
      }
    }
  }

  return duplicates;
}

