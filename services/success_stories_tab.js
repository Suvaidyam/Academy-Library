(function () {
  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var PAGE_SIZE = 6;
  var DEFAULT_THUMBNAIL = '../assets/img/background-img/success-story.png';

  var state = { page: 1, totalPages: 1, totalCount: 0 };

  // ── API helpers ───────────────────────────────────────────────────────────

  function getFilterValues() {
    var out = {};
    document.querySelectorAll('.ss-filter').forEach(function (el) {
      var val = (el.value || '').trim();
      if (val) out[el.dataset.filter] = val;
    });
    return out;
  }

  function buildParams(extra) {
    var params = extra || {};
    var filters = getFilterValues();
    if (filters.keyword) params.search = filters.keyword;
    if (filters.year) params.year = filters.year;
    if (filters.author) params.author = filters.author;
    if (filters.theme) params.theme = filters.theme;
    if (filters.location) params.location = filters.location;
    if (filters.language) params.language = filters.language;
    return params;
  }

  async function apiFetch(params) {
    try {
      var url = new URL(API_BASE + '/api/method/success_stories_list');
      Object.keys(params).forEach(function (k) {
        url.searchParams.append(k, params[k]);
      });
      var res = await fetch(url);
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error('success_stories_list error:', e);
      return {};
    }
  }

  // ── Dropdown population ───────────────────────────────────────────────────

  function fillSelect(id, items, lower) {
    var sel = document.getElementById(id);
    if (!sel) return;
    items.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = lower ? String(v).toLowerCase() : v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  }

  async function loadMeta() {
    var data = await apiFetch({ meta: 1 });
    fillSelect('ss-year-select', data.years || []);
    fillSelect('ss-language-select', data.languages || [], true);
    fillSelect('ss-theme-select', data.themes || []);
  }

  // ── Card rendering ────────────────────────────────────────────────────────

  function extractYear(val) {
    if (!val) return '';
    var m = String(val).match(/\d{4}/);
    return m ? m[0] : '';
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildCardHTML(item) {
    var year = item.year
      ? String(item.year)
      : extractYear(item.date_of_creationpublication || item.date || item.publication_date || item.published_date || item.creation || item.modified || '');
    var title = item.title || 'Untitled';
    var desc = item.a_short_description_about_the_artifact || item.description || '';
    var author = item.author || '';
    var location = item.location || '';
    var language = item.language || '';
    var theme = item.theme || 'Success Story';
    var thumbnail = item.thumbnail ? (API_BASE + item.thumbnail) : DEFAULT_THUMBNAIL;
    var rawLink = item.attachment
      ? (API_BASE + item.attachment)
      : (item.resource_link || item.link || item.url || '');
    var pdfUrl = rawLink ? (/^https?:\/\//i.test(rawLink) ? rawLink : 'https://' + rawLink) : '#';
    var linkTarget = pdfUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : '';

    var tagBadges = (item.tags || []).map(function (t) {
      return '<span class="ss-tag-badge">' + escapeHtml(t) + '</span>';
    }).join('');

    return '<div class="col-md-12 mb-3">' +
      '<div class="ss-ebook-card">' +
      '<a href="' + escapeHtml(pdfUrl) + '" ' + linkTarget + ' class="ss-thumb-wrap">' +
      '<img src="' + escapeHtml(thumbnail) + '" alt="' + escapeHtml(title) + '" class="ss-thumbnail"' +
      ' onerror="this.onerror=null;this.src=\'' + DEFAULT_THUMBNAIL + '\'">' +
      '</a>' +
      '<div class="ss-info">' +
      '<span class="ss-info-badge">' + escapeHtml(theme) + '</span>' +
      '<h5 class="ss-info-title" title="' + escapeHtml(title) + '">' + escapeHtml(title) + '</h5>' +
      (location ? '<div class="ss-info-location"><i class="bi bi-geo-alt-fill"></i> ' + escapeHtml(location) + '</div>' : '') +
      '<p class="ss-info-desc">' + escapeHtml(desc) + '</p>' +
      '<div class="ss-info-meta">' +
      (year ? '<div><i class="bi bi-calendar3"></i> ' + escapeHtml(year) + '</div>' : '') +
      (author ? '<div><i class="bi bi-person-fill"></i> ' + escapeHtml(author) + '</div>' : '') +
      (language ? '<div><i class="bi bi-translate"></i> ' + escapeHtml(language) + '</div>' : '') +
      '</div>' +
      (tagBadges ? '<div class="ss-tags-wrap">' + tagBadges + '</div>' : '') +
      '<a href="' + escapeHtml(pdfUrl) + '" ' + linkTarget + ' class="ss-view-btn">View Story <i class="bi bi-arrow-right"></i></a>' +
      '</div>' +
      '</div></div>';
  }

  function renderCards(items) {
    var el = document.getElementById('ss-cards');
    if (!el) return;
    var empty = !items || items.length === 0;
    el.innerHTML = empty ? '' : items.map(buildCardHTML).join('');
    var noResultsEl = document.getElementById('ss-no-results');
    if (noResultsEl) noResultsEl.classList.toggle('d-none', !empty);
  }

  function renderPagination() {
    var el = document.getElementById('ss-pagination');
    if (!el) return;
    if (state.totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(state.page * PAGE_SIZE, state.totalCount);

    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-2">' +
      '<small class="text-muted">Showing ' + start + '–' + end + ' of ' + state.totalCount + ' records</small>' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="-1"' +
      (state.page <= 1 ? ' disabled' : '') + '>&#8592; Previous</button>' +
      '<span class="small text-muted">Page ' + state.page + ' of ' + state.totalPages + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="1"' +
      (state.page >= state.totalPages ? ' disabled' : '') + '>Next &#8594;</button>' +
      '</div></div>';
  }

  // ── Skeleton loading ──────────────────────────────────────────────────────

  function showSkeletons() {
    var el = document.getElementById('ss-cards');
    if (!el) return;
    var skeletonCard =
      '<div class="col-md-12 mb-3">' +
      '<div class="ss-skeleton-card">' +
      '<div class="ss-skeleton-thumb"></div>' +
      '<div class="ss-skeleton-info">' +
      '<div class="ss-skeleton-line" style="width:25%;height:18px;"></div>' +
      '<div class="ss-skeleton-line" style="width:75%;height:22px;margin-top:4px;"></div>' +
      '<div class="ss-skeleton-line" style="width:55%;height:22px;"></div>' +
      '<div class="ss-skeleton-line" style="width:35%;"></div>' +
      '<div class="ss-skeleton-line" style="width:100%;"></div>' +
      '<div class="ss-skeleton-line" style="width:100%;"></div>' +
      '<div class="ss-skeleton-line" style="width:65%;"></div>' +
      '<div class="ss-skeleton-line" style="width:45%;"></div>' +
      '<div class="ss-skeleton-line" style="width:18%;"></div>' +
      '</div></div></div>';
    el.innerHTML = skeletonCard.repeat(6);
    var paginationEl = document.getElementById('ss-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  async function loadStories() {
    showSkeletons();
    var resp = await apiFetch(buildParams({ page: state.page, page_size: PAGE_SIZE }));

    state.totalCount = resp.total_count || 0;
    state.totalPages = resp.total_pages || 1;

    var items = resp.data || [];

    // Auto-fill year dropdown from data if meta didn't populate it.
    var ySel = document.getElementById('ss-year-select');
    if (ySel && ySel.options.length === 1 && items.length) {
      var years = [].concat(new Set(
        items.map(function (i) { return i.year ? String(i.year) : extractYear(i.date_of_creationpublication || i.date); }).filter(Boolean)
      )).sort(function (a, b) { return b - a; });
      fillSelect('ss-year-select', years);
    }

    renderCards(items);
    renderPagination();
  }

  // ── Events ────────────────────────────────────────────────────────────────

  var debounceTimer = null;

  function onFilterChange() {
    state.page = 1;
    loadStories();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.ss-page-btn');
    if (!btn) return;
    var dir = parseInt(btn.dataset.dir, 10);
    state.page = Math.max(1, Math.min(state.page + dir, state.totalPages));
    loadStories();
  });

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async function () {
    await loadMeta();
    loadStories();

    document.querySelectorAll('.ss-filter').forEach(function (input) {
      var isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', function () {
        if (isSelect) {
          onFilterChange();
        } else {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(onFilterChange, 300);
        }
      });
    });

    var clearBtn = document.getElementById('ss-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        document.querySelectorAll('.ss-filter').forEach(function (el) {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
        });
        onFilterChange();
      });
    }
  });
})();
