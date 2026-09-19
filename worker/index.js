/**
 * Cloudflare Worker entry.
 * - POST /api/telegram → Telegram notifications
 * - everything else → static assets from dist/land-story
 */

import { handleTelegramRequest, jsonResponse } from '../api/telegram.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/telegram' || url.pathname === '/api/telegram/') {
      return handleTelegramRequest(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ ok: false, error: 'not_found' }, 404);
    }

    // Fallback for any non-asset request that still hits the Worker
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
