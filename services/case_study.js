(function () {
  var API_BASE = 'https://erp-ryss.ap.gov.in';
  var PAGE_SIZE = 6;

  // Per-tab page state
  var state = {
    general: { page: 1, totalPages: 1, totalCount: 0 },
    webinars: { page: 1, totalPages: 1, totalCount: 0 }
  };

  // FS-FM profile state ("Longitudinal Self-case Studies" / farmer tab)
  var fsfmState = { page: 1, totalPages: 1, totalCount: 0 };
  var fsfmLoaded = false;
  var FSFM_PAGE_SIZE = 9;

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

    // Socio-economic Studies data has been disabled: keep the tab, show no data.
    if (tabKey === 'webinars') {
      renderCards(cardsId, []);
      renderPagination(paginationId, tabKey);
      updateNoResults();
      return;
    }

    var studyType = tabKey === 'general'
      ? 'Longitudinal Self-case Studies'
      : 'Socio-economic Studies';

    showSkeletons(cardsId);

    // Hide any stale "no results" message from a previous fetch while this one loads.
    var noResultsEl = document.getElementById('cs-no-results');
    if (noResultsEl) noResultsEl.classList.add('d-none');

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
    var generalEl = document.getElementById('general');
    var webinarsEl = document.getElementById('webinars');
    var generalActive = generalEl && generalEl.classList.contains('active');
    var webinarsActive = webinarsEl && webinarsEl.classList.contains('active');

    var tabKey = generalActive ? 'general' : webinarsActive ? 'webinars' : null;
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

  // ── FS-FM profiles ("Longitudinal Self-case Studies" / farmer tab) ──

  var DEFAULT_AVATAR =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68">' +
      '<circle cx="34" cy="34" r="34" fill="#eef8f0"/>' +
      '<circle cx="34" cy="27" r="12" fill="#b7dcae"/>' +
      '<path d="M12 58c4-13 16-19 22-19s18 6 22 19" fill="#b7dcae"/>' +
      '</svg>'
    );

  function getSid() {
    var match = document.cookie.split('; ').find(function (row) {
      return row.indexOf('sid=') === 0;
    });
    return match ? match.split('=')[1] : '';
  }

  async function apiFetchMethod(method, params) {
    try {
      var url = new URL(API_BASE + '/api/method/' + method);
      Object.keys(params || {}).forEach(function (k) {
        if (params[k] !== '' && params[k] !== null && params[k] !== undefined) {
          url.searchParams.append(k, params[k]);
        }
      });
      // FS-FM Case Studies is user-restricted data — the session cookie
      // must ride along on this cross-origin request or the backend sees
      // an anonymous/Guest user and returns 403.
      var res = await fetch(url, {
        credentials: 'include',
        headers: { 'X-Frappe-CSRF-Token': getSid() }
      });
      if (!res.ok) {
        console.error(method + ' error: HTTP ' + res.status);
        return { _error: true };
      }
      var json = await res.json();
      return json.message || {};
    } catch (e) {
      console.error(method + ' error:', e);
      return { _error: true };
    }
  }

  function getFsfmFilterValues() {
    var out = {};
    document.querySelectorAll('.fsfm-filter').forEach(function (el) {
      var val = (el.value || '').trim();
      if (val) out[el.dataset.filter] = val;
    });
    return out;
  }

  function populateRoleSelect(roles) {
    var sel = document.getElementById('fsfm-role-select');
    if (!sel || sel.dataset.populated) return;
    (roles || []).forEach(function (r) {
      if (!r) return;
      var opt = document.createElement('option');
      opt.value = r; opt.textContent = r;
      sel.appendChild(opt);
    });
    sel.dataset.populated = '1';
  }

  function getInitials(name) {
    var parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var first = parts[0].charAt(0);
    var second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + second).toUpperCase();
  }

  var DEFAULT_PROFILE_PHOTO = '/assets/img/fsfm/default-avatar.png';

  function buildFsfmCardHTML(item) {
    var name = ((item.first_name || '') + ' ' + (item.lastfamily_name || '')).trim() || 'Unnamed';
    var hasPhoto = !!item.user_profile_img;
    // user_profile_img can be a full URL (e.g. an external image) or a
    // relative Frappe file path — only the latter needs the API_BASE prefix.
    var photo = hasPhoto
      ? (/^https?:\/\//i.test(item.user_profile_img) ? item.user_profile_img : (API_BASE + item.user_profile_img))
      : '';
    var role = item.role || '';
    // Render the photo and the initials fallback as sibling elements (instead of
    // injecting the initials markup as a string inside the onerror="..." attribute,
    // which broke the surrounding HTML once it hit the double quotes in that markup).
    // onerror just swaps which one is visible.
    var initialsBlock = '<div class="fsfm-profile-initials"' + (hasPhoto ? ' style="display:none;"' : '') +
      '><span>' + getInitials(name) + '</span></div>';
    var photoBlock = hasPhoto ?
      ('<img src="' + photo + '" alt="' + name + '" class="fsfm-profile-photo"' +
        ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' + initialsBlock) :
      initialsBlock;

    return '<div class="col-md-6 col-xl-4">' +
      '<div class="fsfm-profile-card">' +
      '<div class="fsfm-profile-photo-wrap">' + photoBlock + '</div>' +
      '<div class="fsfm-profile-body">' +
      '<div class="fsfm-profile-name"><span class="fsfm-label">Name</span>' + name + '</div>' +
      (role ? '<div class="fsfm-profile-role"><span class="fsfm-label">Role</span><span class="fsfm-role-value">' + role + '</span></div>' : '<div class="fsfm-profile-role">&nbsp;</div>') +
      '<button type="button" class="fsfm-story-btn" data-case-study="' + item.name + '" data-name="' + name + '">' +
      'View Stories <i class="bi bi-arrow-right"></i>' +
      '</button>' +
      '</div></div></div>';
  }

  function renderFsfmCards(items, isError) {
    var el = document.getElementById('farmer-cards');
    if (!el) return;
    el.innerHTML = items && items.length ? items.map(buildFsfmCardHTML).join('') : '';
    var noResults = document.getElementById('fsfm-no-results');
    var errorEl = document.getElementById('fsfm-error');
    var hasItems = !!(items && items.length);
    if (errorEl) errorEl.classList.toggle('d-none', !isError);
    if (noResults) noResults.classList.toggle('d-none', hasItems || isError);
  }

  function renderFsfmPagination() {
    var el = document.getElementById('farmer-pagination');
    if (!el) return;
    if (fsfmState.totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (fsfmState.page - 1) * FSFM_PAGE_SIZE + 1;
    var end = Math.min(fsfmState.page * FSFM_PAGE_SIZE, fsfmState.totalCount);

    el.innerHTML =
      '<div class="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-2">' +
      '<small class="text-muted">Showing ' + start + '–' + end + ' of ' + fsfmState.totalCount + ' records</small>' +
      '<div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary fsfm-page-btn" data-dir="-1"' +
      (fsfmState.page <= 1 ? ' disabled' : '') + '>&#8592; Previous</button>' +
      '<span class="small text-muted">Page ' + fsfmState.page + ' of ' + fsfmState.totalPages + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary fsfm-page-btn" data-dir="1"' +
      (fsfmState.page >= fsfmState.totalPages ? ' disabled' : '') + '>Next &#8594;</button>' +
      '</div></div>';
  }

  function showFsfmSkeletons() {
    var el = document.getElementById('farmer-cards');
    if (!el) return;
    var skeleton =
      '<div class="col-md-6 col-xl-4">' +
      '<div class="fsfm-profile-card">' +
      '<div class="fsfm-profile-photo-wrap" style="background:#e3e6e9;border-bottom-color:#e3e6e9;"></div>' +
      '<div class="fsfm-profile-body">' +
      '<div style="height:16px;width:60%;background:#eef0f2;border-radius:4px;margin-bottom:10px;"></div>' +
      '<div style="height:22px;width:35%;background:#eef0f2;border-radius:20px;margin-bottom:14px;"></div>' +
      '<div style="height:36px;width:100%;background:#eef0f2;border-radius:8px;margin-top:auto;"></div>' +
      '</div></div></div>';
    el.innerHTML = skeleton.repeat(6);
  }

  async function loadFsfmProfiles() {
    showFsfmSkeletons();

    var filters = getFsfmFilterValues();
    var resp = await apiFetchMethod('fs_fm_case_studies', {
      role: filters.role,
      search_name: filters.search_name,
      search_district: filters.search_district,
      page: fsfmState.page,
      page_size: FSFM_PAGE_SIZE
    });

    var items = resp.data || [];
    fsfmState.totalCount = resp.total_count || 0;
    fsfmState.totalPages = resp.total_pages || 1;

    populateRoleSelect(resp.roles);
    renderFsfmCards(items, !!resp._error);
    renderFsfmPagination();
  }

  function onFsfmFilterChange() {
    fsfmState.page = 1;
    loadFsfmProfiles();
  }

  function renderStoryTabs(name, stories) {
    var tabsEl = document.getElementById('fsfm-story-tabs');
    var contentEl = document.getElementById('fsfm-story-tab-content');
    var nameEl = document.getElementById('fsfm-modal-name');
    var metaEl = document.getElementById('fsfm-modal-meta');

    if (nameEl) nameEl.textContent = name;
    if (metaEl) metaEl.textContent = stories.length + (stories.length === 1 ? ' record' : ' records') + ' found';

    if (!stories.length) {
      if (tabsEl) tabsEl.innerHTML = '';
      if (contentEl) contentEl.innerHTML = '<div class="fsfm-story-empty"><i class="bi bi-journal-x fs-2 d-block mb-2"></i>No stories found for this profile.</div>';
      return;
    }

    tabsEl.innerHTML = stories.map(function (s, i) {
      var label = s.semester || s.date_of_capturing_information || ('Record ' + (i + 1));
      return '<li class="nav-item" role="presentation">' +
        '<button class="nav-link' + (i === 0 ? ' active' : '') + '" data-bs-toggle="tab" data-bs-target="#fsfm-story-' + i + '" type="button">' +
        label + '</button></li>';
    }).join('');

    contentEl.innerHTML = stories.map(function (s, i) {
      var story = s.your_story ? String(s.your_story) : '';
      return '<div class="tab-pane fade' + (i === 0 ? ' show active' : '') + '" id="fsfm-story-' + i + '">' +
        (story
          ? '<div class="fsfm-story-card"><div class="fsfm-story-text">' + story + '</div></div>'
          : '<div class="fsfm-story-empty"><i class="bi bi-journal-x fs-2 d-block mb-2"></i>No story recorded for this entry.</div>') +
        '</div>';
    }).join('');
  }

  async function openStoryModal(caseStudy, name) {
    var tabsEl = document.getElementById('fsfm-story-tabs');
    var contentEl = document.getElementById('fsfm-story-tab-content');
    var nameEl = document.getElementById('fsfm-modal-name');
    var avatarEl = document.getElementById('fsfm-modal-avatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = getInitials(name);
    if (tabsEl) tabsEl.innerHTML = '';
    if (contentEl) contentEl.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-success" role="status"></div></div>';

    var modalEl = document.getElementById('fsfmStoryModal');
    if (!modalEl || !window.bootstrap) return;
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    var resp = await apiFetchMethod('fs_fm_case_studies', { case_study: caseStudy });
    renderStoryTabs(name, resp.data || []);
  }

  function initFsfm() {
    if (fsfmLoaded) return;
    fsfmLoaded = true;

    loadFsfmProfiles();

    document.querySelectorAll('.fsfm-filter').forEach(function (input) {
      var isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', function () {
        if (isSelect) onFsfmFilterChange();
        else debounce(onFsfmFilterChange, 300);
      });
    });

    var fsfmClearBtn = document.getElementById('fsfm-clear-btn');
    if (fsfmClearBtn) {
      fsfmClearBtn.addEventListener('click', function () {
        document.querySelectorAll('.fsfm-filter').forEach(function (el) {
          if (el.tagName === 'SELECT') el.selectedIndex = 0;
          else el.value = '';
        });
        onFsfmFilterChange();
      });
    }
  }

  // research-library.html dispatches this event when the "farmer"
  // sub-category ("Longitudinal Self-case Studies") is switched to.
  document.addEventListener('fsfm:category-shown', initFsfm);

  document.addEventListener('click', function (e) {
    var pageBtn = e.target.closest('.fsfm-page-btn');
    if (pageBtn) {
      var dir = parseInt(pageBtn.dataset.dir, 10);
      fsfmState.page = Math.max(1, Math.min(fsfmState.page + dir, fsfmState.totalPages));
      loadFsfmProfiles();
      return;
    }

    var storyBtn = e.target.closest('.fsfm-story-btn');
    if (storyBtn) {
      openStoryModal(storyBtn.dataset.caseStudy, storyBtn.dataset.name);
    }
  });

  // ── Filter change → reset pages → reload both tabs ────────────────────────

  function onFilterChange() {
    state.general.page = 1;
    state.webinars.page = 1;
    loadTab('general');
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

    loadTab('general');
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
