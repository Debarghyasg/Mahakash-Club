// routes/spacenews.js
// Proxies TheSpaceDevs' Spaceflight News API (SNAPI) so the browser never
// has to hit a third-party host directly (avoids CORS issues, adds caching).
//
// IMPORTANT FIX: the previous version pointed at
//   https://api.thespacedevs.com/v2.3.0/articles/
// which is wrong — that host/path serves the *Launch Library 2* API
// (rockets, launches, agencies), not news articles, hence the 404.
// The real Spaceflight News API lives on a different domain entirely:
//   https://api.spaceflightnewsapi.net/v4/articles/
// Docs: https://api.spaceflightnewsapi.net/v4/docs/

// NOTE: The old NODE_TLS_REJECT_UNAUTHORIZED='0' workaround has been
// removed. It disabled certificate verification for the ENTIRE Node
// process, not just this one request — a real MITM exposure. If your AV
// or corporate proxy intercepts HTTPS with its own cert, trust it properly:
//   set NODE_EXTRA_CA_CERTS=C:\path\to\that-ca.pem
// (export the CA from your AV/proxy settings first). Do not re-add the bypass.

const express = require('express');
const router = express.Router();

const BASE_URL = 'https://api.spaceflightnewsapi.net/v4/articles/';

// Small in-memory cache — SNAPI is free/unauthenticated and best not
// hammered by frequent polling + searches.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // key -> { expires, data }

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function setCached(key, data) {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, data });
}

// GET /api/space-news?search=black+hole&limit=9&offset=0
router.get('/space-news', async (req, res) => {
  try {
    const { search = '', limit = 9, offset = 0 } = req.query;

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      ordering: '-published_at', // newest first
    });

    // SNAPI has no generic "search" filter — use title_contains instead.
    if (search.trim()) {
      params.set('title_contains', search.trim());
    }

    const cacheKey = params.toString();
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const apiRes = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '');
      console.error('Upstream error', apiRes.status, apiRes.statusText, body);

      if (apiRes.status === 429) {
        return res.status(429).json({
          error: 'Rate limited by upstream API. Please wait a moment and try again.',
        });
      }

      return res.status(apiRes.status).json({
        error: 'Upstream API error',
        status: apiRes.status,
      });
    }

    const data = await apiRes.json();

    const articles = data.results.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      url: a.url,
      imageUrl: a.image_url,
      newsSite: a.news_site,
      publishedAt: a.published_at,
    }));

    const payload = { count: data.count, articles };
    setCached(cacheKey, payload);

    res.json(payload);
  } catch (err) {
    console.error('Space news fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch space news' });
  }
});

module.exports = router;