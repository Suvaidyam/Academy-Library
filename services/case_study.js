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

  // var DEFAULT_THUMBNAIL = '../assets/img/research/1.jpg';
  var DEFAULT_THUMBNAIL = '../assets/img/background-img/case-study.png';

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
    var language = item.language || '';
    var theme = item.theme || 'Case Study';
    var thumbnail = item.thumbnail ? (API_BASE + item.thumbnail) : DEFAULT_THUMBNAIL;
    var pdfUrl = item.attachment ? (API_BASE + item.attachment) : '#';
    var linkTarget = pdfUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : '';

    var tagBadges = (item.tags || []).map(function (t) {
      return '<span class="cs-tag-badge">' + t + '</span>';
    }).join('');

    return '<div class="col-md-12 mb-3">' +
      '<div class="cs-ebook-card">' +
      '<a href="' + pdfUrl + '" ' + linkTarget + ' class="cs-thumb-wrap">' +
      '<img src="' + thumbnail + '" alt="' + title + '" class="cs-thumbnail"' +
      ' onerror="this.onerror=null;this.src=\'' + DEFAULT_THUMBNAIL + '\'">' +
      '</a>' +
      '<div class="cs-info">' +
      '<span class="cs-info-badge">' + theme + '</span>' +
      '<h5 class="cs-info-title" title="' + title + '">' + title + '</h5>' +
      '<p class="cs-info-desc">' + description + '</p>' +
      '<div class="cs-info-meta">' +
      (year     ? '<div><i class="bi bi-calendar3"></i> '    + year     + '</div>' : '') +
      (author   ? '<div><i class="bi bi-person-fill"></i> '  + author   + '</div>' : '') +
      (language ? '<div><i class="bi bi-translate"></i> '    + language + '</div>' : '') +
      '</div>' +
      (tagBadges ? '<div class="cs-tags-wrap">' + tagBadges + '</div>' : '') +
      '<a href="' + pdfUrl + '" ' + linkTarget + ' class="cs-view-btn">Read More <i class="bi bi-arrow-right"></i></a>' +
      '</div>' +
      '</div></div>';
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

  function showSkeletons(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var skeletonCard =
      '<div class="col-md-12 mb-3">' +
      '<div class="cs-skeleton-card">' +
      '<div class="cs-skeleton-thumb"></div>' +
      '<div class="cs-skeleton-info">' +
      '<div class="cs-skeleton-line" style="width:25%;height:18px;"></div>' +
      '<div class="cs-skeleton-line" style="width:75%;height:22px;margin-top:4px;"></div>' +
      '<div class="cs-skeleton-line" style="width:55%;height:22px;"></div>' +
      '<div class="cs-skeleton-line" style="width:35%;"></div>' +
      '<div class="cs-skeleton-line" style="width:100%;"></div>' +
      '<div class="cs-skeleton-line" style="width:100%;"></div>' +
      '<div class="cs-skeleton-line" style="width:65%;"></div>' +
      '<div class="cs-skeleton-line" style="width:45%;"></div>' +
      '<div class="cs-skeleton-line" style="width:18%;"></div>' +
      '</div></div></div>';
    el.innerHTML = skeletonCard.repeat(6);
  }

  async function loadTab(tabKey) {
    var cardsId = tabKey + '-cards';
    var paginationId = tabKey + '-pagination';
    var studyType = tabKey === 'farmer'
      ? 'Longitudinal Self-case Studies'
      : 'Socio-economic Studies';

    showSkeletons(cardsId);

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
