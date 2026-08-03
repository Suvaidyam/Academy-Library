import ENV from "../config/config.js";

const API_BASE = ENV.API_BASE_URL;
const PAGE_SIZE = 6;

const state = { page: 1, totalPages: 1, totalCount: 0 };

// ── API ───────────────────────────────────────────────────────────────────────

function getFilterValues() {
  const out = {};
  document.querySelectorAll('.ss-filter').forEach(el => {
    const val = (el.value || '').trim();
    if (val) out[el.dataset.filter] = val;
  });
  return out;
}

async function apiFetch(params) {
  try {
    const url = new URL(API_BASE + '/api/method/success_stories_list');
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
    const res  = await fetch(url);
    const json = await res.json();
    return json.message || {};
  } catch (e) {
    console.error('success_stories_list error:', e);
    return {};
  }
}

function buildParams(extra = {}) {
  const params  = { ...extra };
  const filters = getFilterValues();
  if (filters.keyword)  params.search   = filters.keyword;
  if (filters.year)     params.year     = filters.year;
  if (filters.author)   params.author   = filters.author;
  if (filters.theme)    params.theme    = filters.theme;
  if (filters.location) params.location = filters.location;
  if (filters.language) params.language = filters.language;
  return params;
}

// ── Meta dropdowns ────────────────────────────────────────────────────────────

function fillSelect(id, items, lower = false) {
  const sel = document.getElementById(id);
  if (!sel) return;
  items.forEach(v => {
    const opt = document.createElement('option');
    opt.value = lower ? String(v).toLowerCase() : v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

async function loadMeta() {
  const data = await apiFetch({ meta: 1 });
  fillSelect('ss-year-select',     data.years     || []);
  fillSelect('ss-language-select', data.languages || [], true);
  fillSelect('ss-theme-select',    data.themes    || []);
}

// ── Card builder ──────────────────────────────────────────────────────────────

function extractYear(val) {
  if (!val) return '';
  const m = String(val).match(/\d{4}/);
  return m ? m[0] : '';
}

function buildCardHTML(item) {
  // try all common field names for year
  const year = item.year
    ? String(item.year)
    : extractYear(item.date || item.publication_date || item.published_date || item.creation || item.modified || '');
  const title    = item.title       || 'Untitled';
  const desc     = item.description || '';
  const author   = item.author      || '';
  const location = item.location    || '';
  const language = item.language    || '';
  const pdfUrl   = item.attachment  ? (API_BASE + item.attachment) : '#';

  const tagBadges = (item.tags || [])
    .map(t => `<span class="ss-tag-badge">${t}</span>`)
    .join('');

  return `
    <div class="col-md-4 mb-4">
      <a href="${pdfUrl}" target="_blank" class="ss-card">
        <div class="ss-card-header">
          <span class="ss-badge">Success Story</span>
          ${year ? `<span class="ss-year"><i class="bi bi-calendar3"></i> ${year}</span>` : ''}
        </div>
        <h5 class="ss-title">${title}</h5>
        ${location ? `<div class="ss-location"><i class="bi bi-geo-alt-fill"></i> ${location}</div>` : ''}
        <p class="ss-summary">${desc}</p>
        <div class="ss-meta">
          ${author   ? `<div class="ss-meta-item"><i class="bi bi-person"></i> ${author}</div>`       : ''}
          ${language ? `<div class="ss-meta-item"><i class="bi bi-translate"></i> ${language}</div>` : ''}
        </div>
        ${tagBadges ? `<div class="ss-tags-wrap">${tagBadges}</div>` : ''}
        <div class="ss-read-more">View Story <i class="bi bi-arrow-right"></i></div>
      </a>
    </div>`;
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderCards(items) {
  const el = document.getElementById('ss-cards');
  if (!el) return;
  const empty = !items || items.length === 0;
  el.innerHTML = empty ? '' : items.map(buildCardHTML).join('');
  document.getElementById('ss-no-results')?.classList.toggle('d-none', !empty);
}

function renderPagination() {
  const el = document.getElementById('ss-pagination');
  if (!el) return;
  if (state.totalPages <= 1) { el.innerHTML = ''; return; }

  const start = (state.page - 1) * PAGE_SIZE + 1;
  const end   = Math.min(state.page * PAGE_SIZE, state.totalCount);

  el.innerHTML = `
    <div class="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-2">
      <small class="text-muted">Showing ${start}–${end} of ${state.totalCount} records</small>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="-1"
          ${state.page <= 1 ? 'disabled' : ''}>&#8592; Previous</button>
        <span class="small text-muted">Page ${state.page} of ${state.totalPages}</span>
        <button class="btn btn-sm btn-outline-secondary ss-page-btn" data-dir="1"
          ${state.page >= state.totalPages ? 'disabled' : ''}>Next &#8594;</button>
      </div>
    </div>`;
}

function showSpinner() {
  const el = document.getElementById('ss-cards');
  if (el) el.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadStories() {
  showSpinner();
  const resp = await apiFetch(buildParams({ page: state.page, page_size: PAGE_SIZE }));
  if (resp.data && resp.data.length) console.log('[SS] sample item keys:', Object.keys(resp.data[0]), resp.data[0]);

  state.totalCount = resp.total_count || 0;
  state.totalPages = resp.total_pages || 1;

  const items = resp.data || [];

  // auto-fill year dropdown from data if meta didn't populate it
  const ySel = document.getElementById('ss-year-select');
  if (ySel && ySel.options.length === 1 && items.length) {
    const years = [...new Set(
      items.map(i => i.year ? String(i.year) : extractYear(i.date)).filter(Boolean)
    )].sort((a, b) => b - a);
    fillSelect('ss-year-select', years);
  }

  renderCards(items);
  renderPagination();
}

// ── Events ────────────────────────────────────────────────────────────────────

let debounceTimer = null;

function updateFilterBadge() {
  const count = Object.keys(getFilterValues()).length;
  const badge = document.getElementById('ss-filter-count');
  if (!badge) return;
  badge.textContent  = count || '';
  badge.style.display = count ? 'inline-flex' : 'none';
}

function onFilterChange() {
  state.page = 1;
  updateFilterBadge();
  loadStories();
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.ss-page-btn');
  if (!btn) return;
  const dir = parseInt(btn.dataset.dir, 10);
  state.page = Math.max(1, Math.min(state.page + dir, state.totalPages));
  loadStories();
});

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadMeta();
  loadStories();

  document.querySelectorAll('.ss-filter').forEach(input => {
    const isSelect = input.tagName === 'SELECT';
    input.addEventListener(isSelect ? 'change' : 'input', () => {
      if (isSelect) onFilterChange();
      else {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(onFilterChange, 300);
      }
    });
  });

  document.getElementById('ss-clear-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.ss-filter').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    onFilterChange();
  });
});
