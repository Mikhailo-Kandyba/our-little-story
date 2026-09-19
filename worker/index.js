/**
 * Cloudflare Worker entry.
 * - /api/telegram → Telegram notifications (api/telegram.js)
 * - everything else → static assets from dist/land-story (env.ASSETS)
 *
 * Requires wrangler.jsonc assets.run_worker_first = true so API routes are not
 * answered as static-asset 404s before this script runs.
 */

import { handleTelegramRequest, jsonResponse } from '../api/telegram.js';

function normalizePath(pathname) {
  if (!pathname) {
    return '/';
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    // API first — never fall through to ASSETS for /api/*
    if (path === '/api/telegram') {
      return handleTelegramRequest(request, env);
    }

    if (path.startsWith('/api/')) {
      return jsonResponse({ ok: false, error: 'not_found' }, 404);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse({ ok: false, error: 'assets_unavailable' }, 500);
  }
};
