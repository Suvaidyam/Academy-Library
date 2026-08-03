(function () {
  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var PAGE_SIZE = 6;

  // Per-tab page state
  var state = {
    farmer: { page: 1, totalPages: 1, totalCount: 0 },
    webinars: { page: 1, totalPages: 1, totalCount: 0 }
  };

  // ── API helpers ───────────────────────────────────────────────────────────

  function buildParams(extra) {
    var params = extra || {};
    var filters = getFilterValues();
    if (filters.keyword) params.search = filters.keyword;
    if (filters.year) params.year = filters.year;
    if (filters.author) params.author = filters.author;
    if (filters.language) params.language = filters.language;
    return params;
  }

  async function apiFetch(params) {
    try {
      var url = new URL(API_BASE + '/api/method/case_study_list');
      Object.keys(params).forEach(function (k) {
        url.searchParams.append(k, params[k]);
      });
      var res = await fetch(url);
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error('case_study_list error:', e);
      return {};
    }
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  function getFilterValues() {
    var out = {};
    document.querySelectorAll('.cs-filter').forEach(function (el) {
      var val = (el.value || '').trim();
      if (val) out[el.dataset.filter] = val;
    });
    return out;
  }

  // ── Dropdown population ───────────────────────────────────────────────────

  async function loadMeta() {
    var data = await apiFetch({ meta: 1 });
    var years = data.years || [];
    var languages = data.languages || [];

    var ySel = document.getElementById('cs-year-select');
    if (ySel) {
      years.forEach(function (y) {
        var opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        ySel.appendChild(opt);
      });
    }

    var lSel = document.getElementById('cs-language-select');
    if (lSel) {
      languages.forEach(function (l) {
        var opt = document.createElement('option');
        opt.value = l.toLowerCase(); opt.textContent = l;
        lSel.appendChild(opt);
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
    var year = extractYear(item.date);
    var title = item.title || 'Untitled';
    var description = item.description || '';
    var author = item.author || '';
    var tags = (item.tags || []).join(', ');
    var language = item.language || '';
    var pdfUrl = item.attachment ? (API_BASE + item.attachment) : '#';

    var tagBadges = (item.tags || []).map(function (t) {
      return '<span class="case-tag-badge">' + t + '</span>';
    }).join('');

    return '<div class="col-md-4 mb-4">' +
      '<a href="' + pdfUrl + '" target="_blank" class="case-study-card">' +
      '<div class="case-study-header">' +
      '<span class="case-tag">Case Study</span>' +
      (year ? '<span class="case-year"><i class="bi bi-calendar3"></i> ' + year + '</span>' : '') +
      '</div>' +
      '<h5>' + title + '</h5>' +
      '<p class="case-summary">' + description + '</p>' +
      '<div class="case-meta">' +
      (author ? '<div class="case-author"><i class="bi bi-person"></i> ' + author + '</div>' : '') +
      (language ? '<div class="case-lang"><i class="bi bi-translate"></i> ' + language + '</div>' : '') +
      '</div>' +
      (tagBadges ? '<div class="case-tags-wrap">' + tagBadges + '</div>' : '') +
      '<div class="case-read-more">Read More <i class="bi bi-arrow-right"></i></div>' +
      '</a></div>';
  }

  function renderCards(containerId, items) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (!items || items.length === 0) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML = items.map(buildCardHTML).join('');
  }

  // ── Pagination UI ─────────────────────────────────────────────────────────

  function renderPagination(paginationId, tabKey) {
    var el = document.getElementById(paginationId);
    if (!el) return;
    var s = state[tabKey];
    if (s.totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (s.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(s.page * PAGE_SIZE, s.totalCount);

    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-2">' +
      '<small class="text-muted">Showing ' + start + '–' + end + ' of ' + s.totalCount + ' records</small>' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary cs-page-btn"' +
      '  data-tab="' + tabKey + '" data-dir="-1"' +
      (s.page <= 1 ? ' disabled' : '') + '>&#8592; Previous</button>' +
      '<span class="small text-muted">Page ' + s.page + ' of ' + s.totalPages + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary cs-page-btn"' +
      '  data-tab="' + tabKey + '" data-dir="1"' +
      (s.page >= s.totalPages ? ' disabled' : '') + '>Next &#8594;</button>' +
      '</div></div>';
  }

  // ── Fetch + render one tab ────────────────────────────────────────────────

  function showSpinner(containerId) {
    var el = document.getElementById(containerId);
    if (el) el.innerHTML =
      '<div class="col-12 text-center py-4">' +
      '<div class="spinner-border text-success" role="status">' +
      '<span class="visually-hidden">Loading...</span></div></div>';
  }

  async function loadTab(tabKey) {
    var cardsId = tabKey + '-cards';
    var paginationId = tabKey + '-pagination';
    var studyType = tabKey === 'farmer'
      ? 'Longitudinal Self-case Studies'
      : 'Socio-economic Studies';

    showSpinner(cardsId);

    var params = buildParams({
      study_type: studyType,
      page: state[tabKey].page,
      page_size: PAGE_SIZE
    });

    var resp = await apiFetch(params);
    var items = resp.data || [];
    var totalCount = resp.total_count || 0;
    var totalPages = resp.total_pages || 1;

    state[tabKey].totalCount = totalCount;
    state[tabKey].totalPages = totalPages;

    renderCards(cardsId, items);
    renderPagination(paginationId, tabKey);
    updateNoResults();
  }

  // ── No-results message ────────────────────────────────────────────────────

  function updateNoResults() {
    var noResults = document.getElementById('cs-no-results');
    if (!noResults) return;
    var farmerEl = document.getElementById('farmer');
    var webinarsEl = document.getElementById('webinars');
    var farmerActive = farmerEl && farmerEl.classList.contains('active');
    var webinarsActive = webinarsEl && webinarsEl.classList.contains('active');

    var tabKey = farmerActive ? 'farmer' : webinarsActive ? 'webinars' : null;
    if (!tabKey) { noResults.classList.add('d-none'); return; }

    var cardsEl = document.getElementById(tabKey + '-cards');
    var empty = !cardsEl || cardsEl.children.length === 0;
    noResults.classList.toggle('d-none', !empty);
  }

  // ── Debounce ──────────────────────────────────────────────────────────────

  var debounceTimer = null;
  function debounce(fn, ms) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, ms);
  }

  // ── Filter change → reset pages → reload both tabs ────────────────────────

  function onFilterChange() {
    state.farmer.page = 1;
    state.webinars.page = 1;
    loadTab('farmer');
    loadTab('webinars');
  }

  // ── Pagination button clicks (delegated) ──────────────────────────────────

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cs-page-btn');
    if (!btn) return;
    var tabKey = btn.dataset.tab;
    var dir = parseInt(btn.dataset.dir, 10);
    if (!tabKey || !dir) return;
    state[tabKey].page = Math.max(1, Math.min(
      state[tabKey].page + dir,
      state[tabKey].totalPages
    ));
    loadTab(tabKey);
  });

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    await loadMeta();

    loadTab('farmer');
    loadTab('webinars');

    // Filter listeners
    document.querySelectorAll('.cs-filter').forEach(function (input) {
      var isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', function () {
        if (isSelect) onFilterChange();
        else debounce(onFilterChange, 300);
      });
    });

    // Clear button
    var clearBtn = document.getElementById('cs-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        document.querySelectorAll('.cs-filter').forEach(function (el) {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
        });
        onFilterChange();
      });
    }

    // Re-check no-results on sub-tab switch
    document.querySelectorAll('.cs-category-link').forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(updateNoResults, 60);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
