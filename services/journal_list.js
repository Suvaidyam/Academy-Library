(function () {
  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var FETCH_PAGE_SIZE = 50;
  var MAX_FETCH_PAGES = 10; // safety cap
  var PAGE_SIZE = 3; // cards shown per page in the UI

  var allJournals = [];
  var state = { page: 1 };

  // ── API helpers ───────────────────────────────────────────────────────────

  async function fetchPage(page) {
    try {
      var url = new URL(API_BASE + '/api/method/get_journals_list');
      url.searchParams.append('page', page);
      url.searchParams.append('page_size', FETCH_PAGE_SIZE);
      var res = await fetch(url);
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error('get_journals_list error:', e);
      return {};
    }
  }

  async function fetchAllJournals() {
    var items = [];
    var page = 1;
    var totalPages = 1;

    do {
      var resp = await fetchPage(page);
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

  function populateDynamicSelects() {
    var years = [].concat(new Set(allJournals.map(function (i) { return i.publication_year; }).filter(Boolean))).sort();
    var languages = [].concat(new Set(allJournals.map(function (i) { return i.language; }).filter(Boolean))).sort();
    var access = [].concat(new Set(allJournals.map(function (i) { return i.open_access; }).filter(Boolean))).sort();

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

  function showNoData() {
    var el = document.getElementById('jr-results');
    if (!el) return;
    el.innerHTML = '<div class="text-center text-muted py-4">' +
      '<h5 class="mt-2">No journals available yet</h5>' +
      '<p class="text-muted">Please check back later — new journals will show up here once added.</p>' +
      '</div>';
    var paginationEl = document.getElementById('jr-pagination');
    if (paginationEl) paginationEl.innerHTML = '';
    var noResultsEl = document.getElementById('jr-no-results');
    if (noResultsEl) noResultsEl.classList.add('d-none');
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

  function renderCurrentView() {
    var filtered = getFilteredJournals();
    var totalCount = filtered.length;
    var totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);

    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    renderCards(pageItems);
    renderPagination(totalCount, totalPages);

    var noResultsEl = document.getElementById('jr-no-results');
    if (noResultsEl) noResultsEl.classList.toggle('d-none', totalCount > 0);
  }

  // ── Debounce ──────────────────────────────────────────────────────────────

  var debounceTimer = null;
  function debounce(fn, ms) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  function onFilterChange() {
    state.page = 1;
    if (!allJournals.length) {
      showNoData();
      return;
    }
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
    showSkeletons();

    allJournals = await fetchAllJournals();

    if (!allJournals.length) {
      showNoData();
    } else {
      populateDynamicSelects();
      renderCurrentView();
    }

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
  }

  document.addEventListener('DOMContentLoaded', function () {
    init().catch(function (e) {
      console.error('journal_list init failed:', e);
      showError();
    });
  });
})();
