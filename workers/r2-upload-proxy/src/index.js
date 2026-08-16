// Cloudflare Worker: authenticated proxy for uploading new tool/article
// images straight to R2. Uses the native R2 bucket binding, so no R2 access
// key/secret ever exists in this Worker or in the browser bundle.

const ALLOWED_CONTENT_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/svg+xml', 'svg'],
]);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Token, X-Filename',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = env.CORS_ALLOW_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!env.UPLOAD_TOKEN || request.headers.get('X-Upload-Token') !== env.UPLOAD_TOKEN) {
      return jsonResponse({ error: 'Unauthorized' }, 401, origin);
    }

    const contentType = request.headers.get('Content-Type') || '';
    const ext = ALLOWED_CONTENT_TYPES.get(contentType);
    if (!ext) {
      return jsonResponse({ error: `Unsupported content type: ${contentType}` }, 400, origin);
    }

    const maxBytes = Number(env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength === 0 || contentLength > maxBytes) {
      return jsonResponse({ error: `File must be between 1 and ${maxBytes} bytes` }, 413, origin);
    }

    const key = `uploads/${crypto.randomUUID()}.${ext}`;

    await env.BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const publicUrl = `${env.PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    return jsonResponse({ url: publicUrl }, 200, origin);
  },
};
