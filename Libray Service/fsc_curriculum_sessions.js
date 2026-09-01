// Course Content tab — FSC Curriculum sessions
// Talks to the "get_fsc_curriculum_sessions" Server Script API (built off the
// "FSC-Curriculum(Sessions)" report) and drives the Semester -> Module ->
// Sub-Module cascading filters + the Session List panel.

import { FrappeApiClient } from "../services/FrappeApiClient.js";

const client = new FrappeApiClient();
const API = "/get_fsc_curriculum_sessions";

const semesterSelect = document.getElementById("semesterSearch");
const moduleSelect = document.getElementById("moduleSearch");
const submoduleSelect = document.getElementById("submoduleSearch");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("searchResults");
const paginationEl = document.getElementById("fscPagination");
const resultCountEl = document.getElementById("fscResultCount");
const resetBtn = document.getElementById("fscResetBtn");
const listBtn = document.getElementById("listViewBtn");
const cardBtn = document.getElementById("cardViewBtn");

const PAGE_SIZE = 9;

let currentView = "card";
let lastRows = [];
let debounceTimer = null;
let loaded = false;
let currentPage = 1;
let totalRecords = 0;

const state = { semester: "", module: "", sub_module: "", keyword: "" };

const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const resolveUrl = (path) => {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : `${client.baseURL}${path}`;
};

const setOptions = (select, values, placeholder) => {
  if (!select) return;
  select.innerHTML = `<option disabled selected>${placeholder}</option>`;
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
};

async function loadSemesters() {
  try {
    const res = await client.get(API, { mode: "semesters" });
    setOptions(semesterSelect, res?.message || [], "Select a Semester");
  } catch (err) {
    console.error("Error loading semesters:", err);
  }
}

async function loadModules() {
  try {
    const params = { mode: "modules" };
    if (state.semester) params.semester = state.semester;
    const res = await client.get(API, params);
    setOptions(moduleSelect, res?.message || [], "Select a Module");
  } catch (err) {
    console.error("Error loading modules:", err);
  }
}

async function loadSubModules() {
  try {
    const params = { mode: "sub_modules" };
    if (state.semester) params.semester = state.semester;
    if (state.module) params.module = state.module;
    const res = await client.get(API, params);
    setOptions(submoduleSelect, res?.message || [], "Select a Sub-Module");
  } catch (err) {
    console.error("Error loading sub-modules:", err);
  }
}

function updateViewButtonStyles() {
  if (!listBtn || !cardBtn) return;
  const isCard = currentView === "card";
  cardBtn.classList.toggle("btn-primary", isCard);
  cardBtn.classList.toggle("btn-outline-primary", !isCard);
  listBtn.classList.toggle("btn-primary", !isCard);
  listBtn.classList.toggle("btn-outline-secondary", isCard);
  cardBtn.disabled = isCard;
  listBtn.disabled = !isCard;
}

function buildLinks(row) {
  const links = [];
  if (row.link_english) {
    links.push(
      `<a href="${esc(resolveUrl(row.link_english))}" target="_blank" rel="noopener" class="fsc-link-btn fsc-link-en"><i class="bi bi-globe2"></i>English</a>`,
    );
  }
  if (row.link_telugu) {
    links.push(
      `<a href="${esc(resolveUrl(row.link_telugu))}" target="_blank" rel="noopener" class="fsc-link-btn fsc-link-te"><i class="bi bi-translate"></i>Telugu</a>`,
    );
  }
  return links.join("") || '<span class="fsc-no-link">No link available</span>';
}

function buildBreadcrumb(row) {
  const crumbs = [row.semester, row.module, row.sub_module].filter(Boolean);
  return crumbs
    .map(
      (c, i) =>
        `${i > 0 ? '<i class="bi bi-chevron-right"></i>' : ""}<span class="fsc-crumb">${esc(c)}</span>`,
    )
    .join("");
}

function buildCard(row, index = 0) {
  return `
    <div class="col-lg-4 col-md-6 fsc-session-item" style="animation-delay:${Math.min(index, 12) * 35}ms">
      <div class="fsc-session-card">
        <div class="fsc-top-row">
          <span class="fsc-code-badge">${esc(row.session_code || row.name)}</span>
          ${row.module_type ? `<span class="fsc-type-badge">${esc(row.module_type)}</span>` : ""}
        </div>
        <h6 class="fsc-title" title="${esc(row.session_tittle || row.name)}">${esc(row.session_tittle || row.name)}</h6>
        ${row.description ? `<p class="fsc-desc" title="${esc(row.description)}">${esc(row.description)}</p>` : ""}
        <div class="fsc-breadcrumb">${buildBreadcrumb(row)}</div>
        ${row.unit ? `<span class="fsc-unit-tag"><i class="bi bi-bookmark-fill"></i>${esc(row.unit)}</span>` : ""}
        <div class="fsc-links">${buildLinks(row)}</div>
      </div>
    </div>`;
}

function buildListRow(row, index = 0) {
  return `
    <div class="col-12 fsc-session-item" style="animation-delay:${Math.min(index, 12) * 35}ms">
      <div class="fsc-session-row">
        <div class="fsc-row-main">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="fsc-code-badge">${esc(row.session_code || row.name)}</span>
            <h6 title="${esc(row.session_tittle || row.name)}">${esc(row.session_tittle || row.name)}</h6>
            ${row.module_type ? `<span class="fsc-type-badge">${esc(row.module_type)}</span>` : ""}
          </div>
          ${row.description ? `<p class="fsc-desc" title="${esc(row.description)}">${esc(row.description)}</p>` : ""}
          <div class="fsc-breadcrumb">
            ${buildBreadcrumb(row)}
            ${row.unit ? `<i class="bi bi-chevron-right"></i><span class="fsc-crumb">${esc(row.unit)}</span>` : ""}
          </div>
        </div>
        <div class="fsc-links">${buildLinks(row)}</div>
      </div>
    </div>`;
}

function updateResultCount() {
  if (!resultCountEl) return;
  resultCountEl.textContent = totalRecords
    ? `${totalRecords} session${totalRecords === 1 ? "" : "s"}`
    : "";
}

function hasActiveFilters() {
  return !!(state.semester || state.module || state.sub_module || state.keyword);
}

function buildEmptyState() {
  const filtered = hasActiveFilters();
  const message = filtered
    ? "No sessions match the filters you've selected. Try a different Semester/Module/Sub-Module, or clear everything and start over."
    : "No sessions are available at the moment. Please check back later!";

  return `
    <div class="fsc-empty-state w-100">
      <i class="bi ${filtered ? "bi-search" : "bi-collection-play"} fsc-empty-icon"></i>
      <h5>No Sessions Found</h5>
      <p>${esc(message)}</p>
      ${filtered ? `<button type="button" class="btn fsc-empty-reset-btn" id="fscEmptyResetBtn"><i class="bi bi-arrow-counterclockwise me-1"></i>Clear Filters</button>` : ""}
    </div>`;
}

function render() {
  if (!resultsEl) return;

  if (!lastRows.length) {
    resultsEl.innerHTML = buildEmptyState();
    document.getElementById("fscEmptyResetBtn")?.addEventListener("click", resetFilters);
    if (paginationEl) paginationEl.innerHTML = "";
    updateResultCount();
    return;
  }

  resultsEl.innerHTML = lastRows
    .map((row, i) => (currentView === "list" ? buildListRow(row, i) : buildCard(row, i)))
    .join("");
  updateResultCount();
  renderPagination();
}

function renderPagination() {
  if (!paginationEl) return;

  if (!totalRecords || totalRecords <= PAGE_SIZE) {
    paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalRecords);

  const pageBtn = (p, label, disabled = false, active = false) =>
    `<li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
       <button class="page-link" type="button" data-page="${p}">${label}</button>
     </li>`;

  const pages = [
    pageBtn(
      currentPage - 1,
      '<i class="bi bi-chevron-left"></i>',
      currentPage === 1,
    ),
  ];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(pageBtn(i, i, false, i === currentPage));
    } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
      pages.push(
        `<li class="page-item disabled"><span class="page-link">&hellip;</span></li>`,
      );
    }
  }

  pages.push(
    pageBtn(
      currentPage + 1,
      '<i class="bi bi-chevron-right"></i>',
      currentPage === totalPages,
    ),
  );

  paginationEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span class="fsc-page-info">Showing ${start}&ndash;${end} of ${totalRecords} sessions</span>
      <ul class="pagination pagination-sm mb-0">${pages.join("")}</ul>
    </div>`;

  paginationEl.querySelectorAll(".page-link[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page, 10);
      if (p < 1 || p > totalPages || p === currentPage) return;
      fetchSessions(p);
      resultsEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function showSkeletons() {
  if (!resultsEl) return;
  const item =
    currentView === "list"
      ? '<div class="col-12"><div class="fsc-skeleton-row"></div></div>'
      : '<div class="col-lg-4 col-md-6"><div class="fsc-skeleton-card"></div></div>';
  resultsEl.innerHTML = Array(PAGE_SIZE).fill(item).join("");
  if (paginationEl) paginationEl.innerHTML = "";
}

async function fetchSessions(page = 1) {
  if (!resultsEl) return;
  currentPage = page;
  showSkeletons();
  try {
    const params = { mode: "sessions", page, page_size: PAGE_SIZE };
    if (state.semester) params.semester = state.semester;
    if (state.module) params.module = state.module;
    if (state.sub_module) params.sub_module = state.sub_module;
    if (state.keyword) params.keyword = state.keyword;

    const res = await client.get(API, params);
    const body = res?.message || {};
    lastRows = Array.isArray(body.data) ? body.data : [];
    totalRecords = body.total_records || 0;
    currentPage = body.page || page;
    render();
  } catch (err) {
    console.error("Error fetching FSC curriculum sessions:", err);
    lastRows = [];
    totalRecords = 0;
    render();
  }
}

function initCascadingFilters() {
  semesterSelect?.addEventListener("change", async function () {
    state.semester = this.value;
    state.module = "";
    state.sub_module = "";
    setOptions(moduleSelect, [], "Select a Module");
    setOptions(submoduleSelect, [], "Select a Sub-Module");
    await loadModules();
    fetchSessions(1);
  });

  moduleSelect?.addEventListener("change", async function () {
    state.module = this.value;
    state.sub_module = "";
    setOptions(submoduleSelect, [], "Select a Sub-Module");
    await loadSubModules();
    fetchSessions(1);
  });

  submoduleSelect?.addEventListener("change", function () {
    state.sub_module = this.value;
    fetchSessions(1);
  });
}

function initGlobalSearch() {
  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.keyword = searchInput?.value?.trim() || "";
    fetchSessions(1);
  });

  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.keyword = searchInput.value.trim();
      fetchSessions(1);
    }, 400);
  });
}

async function resetFilters() {
  state.semester = "";
  state.module = "";
  state.sub_module = "";
  state.keyword = "";
  if (searchInput) searchInput.value = "";
  setOptions(semesterSelect, [], "Select a Semester");
  setOptions(moduleSelect, [], "Select a Module");
  setOptions(submoduleSelect, [], "Select a Sub-Module");
  await loadSemesters();
  fetchSessions(1);
}

function initResetButton() {
  resetBtn?.addEventListener("click", resetFilters);
}

function switchView(view) {
  if (currentView === view) return;

  if (!resultsEl) {
    currentView = view;
    updateViewButtonStyles();
    return;
  }

  // Disable both while mid-transition so a quick double-click can't re-enter this.
  if (cardBtn) cardBtn.disabled = true;
  if (listBtn) listBtn.disabled = true;

  // Fade the current cards/rows out, then swap markup — the new items reveal
  // themselves via their own staggered entrance animation (see buildCard/buildListRow).
  resultsEl.classList.add("fsc-switching");
  setTimeout(() => {
    currentView = view;
    render();
    updateViewButtonStyles();
    resultsEl.classList.remove("fsc-switching");
  }, 160);
}

function initViewToggle() {
  cardBtn?.addEventListener("click", () => switchView("card"));
  listBtn?.addEventListener("click", () => switchView("list"));
  updateViewButtonStyles();
}

async function init() {
  if (loaded) return;
  loaded = true;
  initCascadingFilters();
  initGlobalSearch();
  initResetButton();
  initViewToggle();
  await loadSemesters();
  fetchSessions(1);
}

document.addEventListener("DOMContentLoaded", () => {
  const tabBtn = document.getElementById("course-content-tab");
  if (tabBtn) {
    tabBtn.addEventListener("shown.bs.tab", init);
    // If the tab is already active on load (e.g. deep link), init immediately.
    if (tabBtn.classList.contains("active")) init();
  } else {
    init();
  }
});
