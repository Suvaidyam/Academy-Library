(function () {
  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var PAGE_SIZE = 6;

  var state = { page: 1, totalPages: 1, totalCount: 0 };

  // ── API helpers ───────────────────────────────────────────────────────────

  function buildParams(extra) {
    var params = extra || {};
    var filters = getFilterValues();
    if (filters.keyword)  params.search   = filters.keyword;
    if (filters.year)     params.year     = filters.year;
    if (filters.author)   params.author   = filters.author;
    if (filters.theme)    params.theme    = filters.theme;
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
      var res  = await fetch(url);
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error('success_stories_list error:', e);
      return {};
    }
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  function getFilterValues() {
    var out = {};
    document.querySelectorAll('.ss-filter').forEach(function (el) {
      var val = (el.value || '').trim();
      if (val) out[el.dataset.filter] = val;
    });
    return out;
  }

  // ── Dropdown population ───────────────────────────────────────────────────

  async function loadMeta() {
    var data = await apiFetch({ meta: 1 });

    var years     = data.years     || [];
    var languages = data.languages || [];
    var themes    = data.themes    || [];

    var ySel = document.getElementById('ss-year-select');
    if (ySel) {
      years.forEach(function (y) {
        var opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        ySel.appendChild(opt);
      });
    }

    var lSel = document.getElementById('ss-language-select');
    if (lSel) {
      languages.forEach(function (l) {
        var opt = document.createElement('option');
        opt.value = l.toLowerCase(); opt.textContent = l;
        lSel.appendChild(opt);
      });
    }

    var tSel = document.getElementById('ss-theme-select');
    if (tSel) {
      themes.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        tSel.appendChild(opt);
      });
    }
  }

  // ── Card rendering ────────────────────────────────────────────────────────

  function extractYear(dateStr) {
    if (!dateStr) return '';
    var m = String(dateStr).match(/\d{4}/);
    return m ? m[0] : '';
  }

  function buildCardHTML(item) {
    var year     = extractYear(item.date);
    var title    = item.title    || 'Untitled';
    var desc     = item.description || '';
    var author   = item.author   || '';
    var location = item.location || '';
    var language = item.language || '';
    var pdfUrl   = item.attachment ? (API_BASE + item.attachment) : '#';

    var tagBadges = (item.tags || []).map(function (t) {
      return '<span class="ss-tag-badge">' + t + '</span>';
    }).join('');

    return (
      '<div class="col-md-4 mb-4">' +
        '<a href="' + pdfUrl + '" target="_blank" class="ss-card">' +
          '<div class="ss-card-header">' +
            '<span class="ss-badge">Success Story</span>' +
            (year ? '<span class="ss-year"><i class="bi bi-calendar3"></i> ' + year + '</span>' : '') +
          '</div>' +
          '<h5 class="ss-title">' + title + '</h5>' +
          (location ? '<div class="ss-location"><i class="bi bi-geo-alt-fill"></i> ' + location + '</div>' : '') +
          '<p class="ss-summary">' + desc + '</p>' +
          '<div class="ss-meta">' +
            (author   ? '<div class="ss-meta-item"><i class="bi bi-person"></i> ' + author   + '</div>' : '') +
            (language ? '<div class="ss-meta-item"><i class="bi bi-translate"></i> ' + language + '</div>' : '') +
          '</div>' +
          (tagBadges ? '<div class="ss-tags-wrap">' + tagBadges + '</div>' : '') +
          '<div class="ss-read-more">View Story <i class="bi bi-arrow-right"></i></div>' +
        '</a>' +
      '</div>'
    );
  }

  function renderCards(items) {
    var el = document.getElementById('ss-cards');
    if (!el) return;
    if (!items || items.length === 0) {
      el.innerHTML = '';
      updateNoResults(true);
      return;
    }
    el.innerHTML = items.map(buildCardHTML).join('');
    updateNoResults(false);
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  function renderPagination() {
    var el = document.getElementById('ss-pagination');
    if (!el) return;
    if (state.totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end   = Math.min(state.page * PAGE_SIZE, state.totalCount);

    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-2">' +
        '<small class="text-muted">Showing ' + start + '–' + end + ' of ' + state.totalCount + ' records</small>' +
        '<div class="d-flex align-items-center gap-2">' +
          '<button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="-1"' +
            (state.page <= 1 ? ' disabled' : '') + '>&#8592; Previous</button>' +
          '<span class="small text-muted">Page ' + state.page + ' of ' + state.totalPages + '</span>' +
          '<button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="1"' +
            (state.page >= state.totalPages ? ' disabled' : '') + '>Next &#8594;</button>' +
        '</div>' +
      '</div>';
  }

  // ── Spinner / No-results ──────────────────────────────────────────────────

  function showSpinner() {
    var el = document.getElementById('ss-cards');
    if (el) el.innerHTML =
      '<div class="col-12 text-center py-5">' +
        '<div class="spinner-border text-success" role="status">' +
          '<span class="visually-hidden">Loading...</span>' +
        '</div>' +
      '</div>';
  }

  function updateNoResults(empty) {
    var el = document.getElementById('ss-no-results');
    if (el) el.classList.toggle('d-none', !empty);
  }

  // ── Load data ─────────────────────────────────────────────────────────────

  async function loadStories() {
    showSpinner();
    var params = buildParams({ page: state.page, page_size: PAGE_SIZE });
    var resp   = await apiFetch(params);

    state.totalCount  = resp.total_count  || 0;
    state.totalPages  = resp.total_pages  || 1;

    renderCards(resp.data || []);
    renderPagination();
  }

  // ── Debounce ──────────────────────────────────────────────────────────────

  var debounceTimer = null;
  function debounce(fn, ms) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  function onFilterChange() {
    state.page = 1;
    loadStories();
  }

  // ── Pagination click ──────────────────────────────────────────────────────

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.ss-page-btn');
    if (!btn) return;
    var dir = parseInt(btn.dataset.dir, 10);
    state.page = Math.max(1, Math.min(state.page + dir, state.totalPages));
    loadStories();
  });

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    await loadMeta();
    loadStories();

    document.querySelectorAll('.ss-filter').forEach(function (input) {
      var isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', function () {
        if (isSelect) onFilterChange();
        else debounce(onFilterChange, 300);
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
  }

  document.addEventListener('DOMContentLoaded', init);
})();
