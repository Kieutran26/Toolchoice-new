import { useEffect } from 'react';

export const SITE_ORIGIN = 'https://www.toolchoice.site';

export default function SEOHead({
  title,
  description,
  canonicalPath = '/',
  robots = 'index, follow',
  ogType = 'website',
  ogImage = `${SITE_ORIGIN}/logo.png`,
  jsonLd = null,
}) {
  useEffect(() => {
    const fullTitle = title
      ? title.includes('Toolchoice') || title.includes('ToolChoice')
        ? title
        : `${title} | Toolchoice`
      : 'Toolchoice - Danh mục công cụ AI, phần mềm tiện ích và cẩm nang lựa chọn';

    const fullDescription =
      description ||
      'Toolchoice là nền tảng tổng hợp thông tin, tính năng và hướng dẫn lựa chọn các công cụ AI, thiết kế, lập trình, năng suất tốt nhất.';

    const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${SITE_ORIGIN}${normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+$/, '')}`;

    document.title = fullTitle;

    const setMeta = (selector, attrName, attrValue, content) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', fullDescription);
    setMeta('meta[name="robots"]', 'name', 'robots', robots);

    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', fullDescription);
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);

    setMeta('meta[property="twitter:url"]', 'property', 'twitter:url', canonicalUrl);
    setMeta('meta[property="twitter:title"]', 'property', 'twitter:title', fullTitle);
    setMeta('meta[property="twitter:description"]', 'property', 'twitter:description', fullDescription);
    setMeta('meta[property="twitter:image"]', 'property', 'twitter:image', ogImage);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    let ldScript = document.head.querySelector('script[data-seo-jsonld="true"]');
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.setAttribute('data-seo-jsonld', 'true');
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }
  }, [title, description, canonicalPath, robots, ogType, ogImage, jsonLd]);

  return null;
}
