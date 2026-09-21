(function () {
  // Shared by both pages/research-library.html and pages/global-resource.html —
  // each includes this file with its own data-source attribute on the <script>
  // tag so the same code fetches the right slice of journals for that page:
  // <script src="services/journal_list.js" data-source="Internal"></script>
  var SOURCE = (document.currentScript && document.currentScript.dataset.source) || 'Internal';

  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var PAGE_SIZE = 3; // cards per UI page — also the page size used for the lazy per-click fetch
  var FULL_FETCH_PAGE_SIZE = 50; // used once a filter needs the whole dataset to match against
  var MAX_FETCH_PAGES = 10; // safety cap on the full fetch

  // Lazy mode (default): only the page being viewed is fetched — page 1 on load,
  // each further page only once its Next/Previous button is actually clicked.
  var lazyPages = {}; // page number -> items already fetched
  var lazyMeta = { totalRecords: 0, totalPages: 1 };
  var lazyItemsSeen = []; // union of items fetched so far, for progressively filling the dropdowns

  // Full mode: entered the first time a filter is used, since the API itself
  // can't filter — from then on filtering/pagination run client-side over the
  // complete list, same as before.
  var allJournals = [];
  var fullyLoaded = false;

  var state = { page: 1 };

  // ── API helpers ───────────────────────────────────────────────────────────

  async function fetchPage(page, pageSize) {
    try {
      var url = new URL(API_BASE + '/api/method/get_journals_list');
      url.searchParams.append('page', page);
      url.searchParams.append('page_size', pageSize);
      url.searchParams.append('source', SOURCE);
      var res = await fetch(url);
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error('get_journals_list error:', e);
      return {};
    }
  }

  async function fetchLazyPage(page) {
    if (lazyPages[page]) return lazyPages[page];
    var resp = await fetchPage(page, PAGE_SIZE);
    var items = resp.data || [];
    lazyPages[page] = items;
    lazyItemsSeen = lazyItemsSeen.concat(items);
    if (resp.pagination) {
      lazyMeta.totalRecords = resp.pagination.total_records || 0;
      lazyMeta.totalPages = resp.pagination.total_pages || 1;
    }
    return items;
  }

  async function fetchAllJournals() {
    var items = [];
    var page = 1;
    var totalPages = 1;

    do {
      var resp = await fetchPage(page, FULL_FETCH_PAGE_SIZE);
      items = items.concat(resp.data || []);
      totalPages = (resp.pagination && resp.pagination.total_pages) || 1;
      page++;
    } while (page <= totalPages && page <= MAX_FETCH_PAGES);

    return items;
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  function getFilterValues() {
    var out = {};
    document.querySelectorAll('.jr-filter').forEach(function (el) {
      var val = (el.value || '').trim().toLowerCase();
      if (val) out[el.dataset.filter] = val;
    });
    return out;
  }

  function hasActiveFilters() {
    return Object.keys(getFilterValues()).length > 0;
  }

  function itemField(item, key) {
    switch (key) {
      case 'keyword':
        return [item.title, item.author, item.publisher].filter(Boolean).join(' ').toLowerCase();
      case 'journal':
        return (item.publisher || '').toLowerCase();
      case 'year':
        return String(item.publication_year || '').toLowerCase();
      case 'volume':
        return formatVolume(item).toLowerCase();
      case 'publisher':
        return (item.publisher || '').toLowerCase();
      case 'language':
        return (item.language || '').toLowerCase();
      case 'access':
        return (item.open_access || '').toLowerCase();
      default:
        return '';
    }
  }

  function matchesFilters(item, filters) {
    return Object.keys(filters).every(function (key) {
      // "peer" (Peer Reviewed) has no corresponding field in the API — ignore it.
      if (key === 'peer') return true;
      var value = filters[key];
      var fieldVal = itemField(item, key);
      var isSelect = document.querySelector('.jr-filter[data-filter="' + key + '"]');
      if (isSelect && isSelect.tagName === 'SELECT') return fieldVal === value;
      return fieldVal.includes(value);
    });
  }

  function getFilteredJournals() {
    var filters = getFilterValues();
    return allJournals.filter(function (item) {
      return matchesFilters(item, filters);
    });
  }

  // ── Dropdown population ───────────────────────────────────────────────────
  // Filled progressively from whatever's been fetched so far (fully once a
  // filter has triggered the complete fetch) — never a reason on its own to
  // fetch more than the page being viewed.

  function populateSelect(selectId, values) {
    var el = document.getElementById(selectId);
    if (!el) return;
    var current = el.value;
    el.innerHTML = el.options[0].outerHTML;
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
    if (values.indexOf(current) !== -1) el.value = current;
  }

  function populateDynamicSelects(source) {
    var years = Array.from(new Set(source.map(function (i) { return i.publication_year; }).filter(Boolean))).sort();
    var languages = Array.from(new Set(source.map(function (i) { return i.language; }).filter(Boolean))).sort();
    var access = Array.from(new Set(source.map(function (i) { return i.open_access; }).filter(Boolean))).sort();

    populateSelect('jr-year-select', years);
    populateSelect('jr-language-select', languages);
    populateSelect('jr-access-select', access);
  }

  // ── Card rendering ────────────────────────────────────────────────────────

  function formatVolume(item) {
    var parts = [];
    if (item.volume) parts.push('Vol ' + item.volume);
    if (item.volume_issue) parts.push('Issue ' + item.volume_issue);
    return parts.join(', ');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildCardHTML(item) {
    var title = item.title || item.sub_title || 'Untitled';
    var publisher = item.publisher || item.sub_title || '';
    var author = item.author ? item.author.trim() : '';
    var year = item.publication_year || '';
    var authorYearLine = [author, year].filter(Boolean).join(' | ') || 'N/A';
    var rawLink = item.resource_link || (item.doi ? (/^https?:\/\//i.test(item.doi) ? item.doi : 'https://doi.org/' + item.doi) : '');
    var viewLink = rawLink ? (/^https?:\/\//i.test(rawLink) ? rawLink : 'https://' + rawLink) : '';

    return '<div class="journal-card" style="margin-bottom: 20px;">' +
      '<div class="journal-icon">📑</div>' +
      '<div class="journal-content">' +
      '<h5>' + escapeHtml(title) + '</h5>' +
      '<p>Published in ' + escapeHtml(publisher || 'N/A') + '</p>' +
      '<small>Authors: ' + escapeHtml(authorYearLine) + '</small>' +
      '<div class="mt-3">' +
      (viewLink
        ? '<a class="btn btn-sm btn-success" href="' + escapeHtml(viewLink) + '" target="_blank" rel="noopener noreferrer">View Publication</a>'
        : '<button class="btn btn-sm btn-success" disabled>View Publication</button>') +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function showSkeletons() {
    var el = document.getElementById('jr-results');
    if (!el) return;
    var skeletonCard =
      '<div class="jr-skeleton-card">' +
      '<div class="jr-skeleton-icon"></div>' +
      '<div class="jr-skeleton-content">' +
      '<div class="jr-skeleton-line" style="width:60%;height:18px;"></div>' +
      '<div class="jr-skeleton-line" style="width:40%;"></div>' +
      '<div class="jr-skeleton-line" style="width:30%;"></div>' +
      '<div class="jr-skeleton-line" style="width:20%;height:26px;margin-top:4px;"></div>' +
      '</div></div>';
    el.innerHTML = skeletonCard.repeat(PAGE_SIZE);
    var paginationEl = document.getElementById('jr-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
  }

  function showError() {
    var el = document.getElementById('jr-results');
    if (!el) return;
    el.innerHTML = '<div class="text-center text-muted py-4">' +
      '<h5 class="mt-2">Unable to load journals</h5>' +
      '<p class="text-muted">Something went wrong while fetching data. Please try again later.</p>' +
      '</div>';
    var paginationEl = document.getElementById('jr-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
    var noResultsEl = document.getElementById('jr-no-results');
    if (noResultsEl) noResultsEl.classList.add('d-none');
  }

  // Toggles the "no results" placeholder, swapping its heading/text to fit
  // why it's empty (no filter vs. a filter matched nothing vs. the page
  // itself came back with no data even though more exists elsewhere).
  function setEmptyState(active, copy) {
    var el = document.getElementById('jr-results');
    if (el && active) el.innerHTML = '';
    var noResultsEl = document.getElementById('jr-no-results');
    if (!noResultsEl) return;
    noResultsEl.classList.toggle('d-none', !active);
    if (active && copy) {
      var heading = noResultsEl.querySelector('h5');
      var desc = noResultsEl.querySelector('p');
      if (heading) heading.textContent = copy.heading;
      if (desc) desc.textContent = copy.desc;
    }
  }

  function renderCards(items) {
    var el = document.getElementById('jr-results');
    if (!el) return;
    el.innerHTML = items.map(buildCardHTML).join('');
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  function ensurePaginationContainer() {
    var el = document.getElementById('jr-pagination');
    if (el) return el;
    var results = document.getElementById('jr-results');
    if (!results || !results.parentNode) return null;
    el = document.createElement('div');
    el.id = 'jr-pagination';
    results.parentNode.insertBefore(el, results.nextSibling);
    return el;
  }

  function renderPagination(totalCount, totalPages) {
    var el = ensurePaginationContainer();
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(state.page * PAGE_SIZE, totalCount);

    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">' +
      '<small class="text-muted">Showing ' + start + '–' + end + ' of ' + totalCount + ' records</small>' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary jr-page-btn" data-dir="-1"' +
      (state.page <= 1 ? ' disabled' : '') + '>&#8592; Previous</button>' +
      '<span class="small text-muted">Page ' + state.page + ' of ' + totalPages + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary jr-page-btn" data-dir="1"' +
      (state.page >= totalPages ? ' disabled' : '') + '>Next &#8594;</button>' +
      '</div></div>';
  }

  // ── Render current page (filters + pagination) ───────────────────────────

  async function loadFullDataset() {
    if (fullyLoaded) return;
    showSkeletons();
    allJournals = await fetchAllJournals();
    fullyLoaded = true;
    populateDynamicSelects(allJournals);
  }

  async function renderFromFullDataset() {
    var filtered = getFilteredJournals();
    var totalCount = filtered.length;
    var totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);

    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (pageItems.length) {
      renderCards(pageItems);
      renderPagination(totalCount, totalPages);
      setEmptyState(false);
    } else {
      renderPagination(0, 1); // clears the pagination bar — nothing to page through
      setEmptyState(true, hasActiveFilters() ? {
        heading: 'No journals match your filters',
        desc: 'Try adjusting or clearing the filters above.'
      } : {
        heading: 'No journals available yet',
        desc: 'Please check back later — new journals will show up here once added.'
      });
    }
  }

  async function renderCurrentView() {
    // A filter needs the whole list to match against — the API itself ignores
    // filter params, so the first time one is used we fetch everything once
    // and switch permanently to client-side filtering/pagination over it.
    if (!fullyLoaded && hasActiveFilters()) {
      await loadFullDataset();
    }

    if (!fullyLoaded) {
      // No filters yet — only fetch the page actually being viewed.
      showSkeletons();
      var items = await fetchLazyPage(state.page);
      populateDynamicSelects(lazyItemsSeen);
      var lazyItems = lazyPages[state.page] || items;

      // The backend's own pagination only ever returns data for page 1 —
      // any later page comes back empty regardless of page size, even
      // though it still reports the true total_records. When that happens,
      // fall back to fetching everything once so paging keeps working.
      if (!lazyItems.length && lazyMeta.totalRecords > 0) {
        await loadFullDataset();
      }
    }

    if (fullyLoaded) {
      await renderFromFullDataset();
      return;
    }

    // Page 1 rendered fine, or the backend genuinely has no journals at all.
    state.page = Math.min(state.page, lazyMeta.totalPages || 1);
    var pageItems = lazyPages[state.page] || [];

    if (pageItems.length) {
      renderCards(pageItems);
      renderPagination(lazyMeta.totalRecords, lazyMeta.totalPages);
      setEmptyState(false);
    } else {
      renderPagination(0, 1); // clears the pagination bar — nothing to page through
      setEmptyState(true, {
        heading: 'No journals available yet',
        desc: 'Please check back later — new journals will show up here once added.'
      });
    }
  }

  // ── Debounce ──────────────────────────────────────────────────────────────

  var debounceTimer = null;
  function debounce(fn, ms) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  function onFilterChange() {
    state.page = 1;
    renderCurrentView();
  }

  // ── Pagination button clicks (delegated) ──────────────────────────────────

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.jr-page-btn');
    if (!btn) return;
    var dir = parseInt(btn.dataset.dir, 10);
    if (!dir) return;
    state.page = Math.max(1, state.page + dir);
    renderCurrentView();
  });

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    document.querySelectorAll('.jr-filter').forEach(function (input) {
      var isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', function () {
        if (isSelect) onFilterChange();
        else debounce(onFilterChange, 300);
      });
    });

    var clearBtn = document.getElementById('jr-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        document.querySelectorAll('.jr-filter').forEach(function (el) {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
        });
        onFilterChange();
      });
    }

    await renderCurrentView();
  }

  document.addEventListener('DOMContentLoaded', function () {
    init().catch(function (e) {
      console.error('journal_list init failed:', e);
      showError();
    });
  });
})();
