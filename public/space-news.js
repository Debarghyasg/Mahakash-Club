// public/space-news.js
// Fetches live space/astrophysics news from your backend proxy,
// renders it into cards matching your existing .blog-card style,
// supports search, and auto-refreshes on an interval.

(function () {
  const GRID_ID = 'live-news-grid';
  const SEARCH_INPUT_ID = 'news-search-input';
  const SEARCH_BTN_ID = 'news-search-btn';
  const STATUS_ID = 'news-status';
  const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

  let currentSearch = '';
  let refreshTimer = null;

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function cardTemplate(article) {
    const img = article.imageUrl || '';
    return `
      <article class="blog-card news-card">
        <div class="card-image">
          ${img ? `<img src="${img}" alt="${escapeHtml(article.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : ''}
        </div>
        <div class="card-content">
          <span class="card-category">${escapeHtml(article.newsSite || 'Space News')}</span>
          <h3 class="card-title">${escapeHtml(article.title)}</h3>
          <p class="card-excerpt">${escapeHtml(truncate(article.summary, 160))}</p>
          <div class="card-meta">
            <span>${timeAgo(article.publishedAt)}</span>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">Read More</a>
          </div>
        </div>
      </article>
    `;
  }

  function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n).trim() + '…' : str;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  async function loadNews(search = '') {
    const grid = document.getElementById(GRID_ID);
    const status = document.getElementById(STATUS_ID);
    if (!grid) return;

    if (status) status.textContent = 'Loading latest discoveries…';

    try {
      const params = new URLSearchParams({ limit: '9' });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/space-news?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();

      if (!data.articles || data.articles.length === 0) {
        grid.innerHTML = '';
        if (status) status.textContent = 'No articles found. Try a different search.';
        return;
      }

      grid.innerHTML = data.articles.map(cardTemplate).join('');
      if (status) {
        status.textContent = search
          ? `Showing results for "${search}"`
          : `Updated ${new Date().toLocaleTimeString()}`;
      }
    } catch (err) {
      console.error('Failed to load space news:', err);
      if (status) status.textContent = 'Could not load news right now. Retrying shortly…';
    }
  }

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      // Only auto-refresh when the user isn't mid-search
      loadNews(currentSearch);
    }, AUTO_REFRESH_MS);
  }

  function init() {
    const searchInput = document.getElementById(SEARCH_INPUT_ID);
    const searchBtn = document.getElementById(SEARCH_BTN_ID);

    // Initial load
    loadNews();
    startAutoRefresh();

    if (searchBtn && searchInput) {
      const runSearch = () => {
        currentSearch = searchInput.value;
        loadNews(currentSearch);
      };
      searchBtn.addEventListener('click', runSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSearch();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();