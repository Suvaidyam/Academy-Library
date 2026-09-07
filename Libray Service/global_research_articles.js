// Research Articles tab (pages/global-resource.html → #researchArticles)
// Fetches ONLY External research articles (Knowledge Artifact doctype,
// category = "Article", artifact_source = "External") from the
// `get_research_articles` server script — see
// server_scripts/get_research_articles.py for the API.
//
// Identical to services/research_articles.js (pages/research-library.html's
// Research Articles tab) — same filters, same card layout, same pagination —
// the only difference is artifact_source: "External" instead of "Internal".

import { FrappeApiClient } from "../services/FrappeApiClient.js";

const client = new FrappeApiClient();
const API = "/get_research_articles";
const PAGE_SIZE = 6;

const resultsEl = document.getElementById("ra-results");
const paginationEl = document.getElementById("ra-pagination");
const noResultsEl = document.getElementById("ra-no-results");
const clearBtn = document.getElementById("ra-clear-btn");

let currentPage = 1;
let totalRecords = 0;
let lastRows = [];
let debounceTimer = null;

// Mirrors fsc_curriculum_sessions.js's `state` object — one key per filter,
// only non-empty values are ever sent to the API.
const state = {
  keyword: "",
  author: "",
  theme: "",
  year: "",
  journal: "",
  country: "",
  language: "",
};

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

function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ── Dropdown population (years / languages come from the API meta call) ────

async function loadMeta() {
  try {
    const res = await client.get(API, { meta: 1, artifact_source: "External" });
    const data = res?.message || {};

    const ySel = document.getElementById("ra-year-select");
    if (ySel) {
      (data.years || []).forEach((y) => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        ySel.appendChild(opt);
      });
    }

    const lSel = document.getElementById("ra-language-select");
    if (lSel) {
      (data.languages || []).forEach((l) => {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = l;
        lSel.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error loading research article filter options:", err);
  }
}

// ── Card rendering ───────────────────────────────────────────────────────
// Layout: Title → Author(s) → Abstract → Theme pills → Date (+ a small
// "View PDF" footer link).

function buildThemePills(row) {
  const themes = (row.tags || []).slice(0, 4);
  if (!themes.length) return "";
  return `<div class="ra-theme-pills">${themes
    .map((t) => `<span class="ra-theme-pill">${esc(t)}</span>`)
    .join("")}</div>`;
}

function buildCard(row, index = 0) {
  const title = row.title || row.sub_title || "Untitled";
  const author = row.author || "Unknown author";
  const abstract = row.a_short_description_about_the_artifact || "";
  const dateLabel = formatMonthYear(row.date_of_creationpublication);
  const pdfUrl = row.resource_link ? row.resource_link : "";
  
  // title="" gives the full, untrimmed text as a tooltip — the visible text
  // itself is clamped via CSS (.ra-card-title / .ra-card-abstract).
  return `
    <div class="col-lg-4 col-md-6 ra-card-item" style="animation-delay:${Math.min(index, 12) * 35}ms">
      <div class="ra-card">
        <h6 class="ra-card-title" title="${esc(title)}">${esc(title)}</h6>
        <p class="ra-card-author" title="${esc(author)}">${esc(author)}</p>
        ${abstract ? `<p class="ra-card-abstract" title="${esc(abstract)}">${esc(abstract)}</p>` : ""}
        ${buildThemePills(row)}
        <div class="ra-card-footer">
          <span class="ra-card-date">${esc(dateLabel)}</span>
          ${pdfUrl
            ? `<a href="${esc(pdfUrl)}" target="_blank" rel="noopener" class="ra-card-pdf-link"><i class="bi bi-file-earmark-pdf"></i>View PDF</a>`
            : '<span class="ra-card-no-pdf">No file available</span>'}
        </div>
      </div>
    </div>`;
}

function updateNoResults(empty) {
  if (noResultsEl) noResultsEl.classList.toggle("d-none", !empty);
}

function hasActiveFilters() {
  return Object.values(state).some(Boolean);
}

function buildEmptyState() {
  const filtered = hasActiveFilters();
  resultsEl.innerHTML = "";
  updateNoResults(true);
  if (noResultsEl) {
    const heading = noResultsEl.querySelector("h5");
    const desc = noResultsEl.querySelector("p");
    if (heading) heading.textContent = filtered ? "No research articles match your filters" : "No research articles available yet";
    if (desc) desc.textContent = filtered
      ? "Try adjusting or clearing the filters above."
      : "Please check back later — new articles will show up here once added.";
  }
}

function render() {
  if (!resultsEl) return;

  if (!lastRows.length) {
    buildEmptyState();
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  updateNoResults(false);
  resultsEl.innerHTML = lastRows.map((row, i) => buildCard(row, i)).join("");
  renderPagination();
}

// ── Pagination (numbered, with ellipsis — same shape as fsc_curriculum_sessions.js) ──

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
    pageBtn(currentPage - 1, '<i class="bi bi-chevron-left"></i>', currentPage === 1),
  ];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(pageBtn(i, i, false, i === currentPage));
    } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
      pages.push(`<li class="page-item disabled"><span class="page-link">&hellip;</span></li>`);
    }
  }

  pages.push(
    pageBtn(currentPage + 1, '<i class="bi bi-chevron-right"></i>', currentPage === totalPages),
  );

  paginationEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span class="fsc-page-info">Showing ${start}&ndash;${end} of ${totalRecords} articles</span>
      <ul class="pagination pagination-sm mb-0">${pages.join("")}</ul>
    </div>`;

  paginationEl.querySelectorAll(".page-link[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page, 10);
      if (p < 1 || p > totalPages || p === currentPage) return;
      fetchArticles(p);
      resultsEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function showSkeletons() {
  if (!resultsEl) return;
  resultsEl.innerHTML = Array(PAGE_SIZE)
    .fill('<div class="col-lg-4 col-md-6"><div class="ra-skeleton-card"></div></div>')
    .join("");
  if (paginationEl) paginationEl.innerHTML = "";
}

// ── Fetch + render ──────────────────────────────────────────────────────

async function fetchArticles(page = 1) {
  if (!resultsEl) return;
  currentPage = page;
  showSkeletons();

  try {
    const params = {
      page,
      page_size: PAGE_SIZE,
      // Always sent explicitly — this tab must only ever show External
      // artifacts, regardless of any other filter in play.
      artifact_source: "External",
    };
    if (state.keyword) params.keyword = state.keyword;
    if (state.author) params.author = state.author;
    if (state.theme) params.theme = state.theme;
    if (state.year) params.year = state.year;
    if (state.journal) params.journal = state.journal;
    if (state.country) params.country = state.country;
    if (state.language) params.language = state.language;

    const res = await client.get(API, params);
    const body = res?.message || {};
    lastRows = Array.isArray(body.data) ? body.data : [];
    totalRecords = body.total_count || 0;
    currentPage = body.page || page;
    render();
  } catch (err) {
    console.error("Error fetching research articles:", err);
    lastRows = [];
    totalRecords = 0;
    if (resultsEl) {
      resultsEl.innerHTML = '<div class="col-12 text-center text-muted py-4">' +
        '<h5 class="mt-2">Unable to load research articles</h5>' +
        '<p class="text-muted">Something went wrong while fetching data. Please try again later.</p>' +
        '</div>';
    }
    if (paginationEl) paginationEl.innerHTML = "";
    updateNoResults(false);
  }
}

// ── Filters ─────────────────────────────────────────────────────────────

function initFilters() {
  document.querySelectorAll(".ra-filter").forEach((input) => {
    const key = input.dataset.filter;
    const isSelect = input.tagName === "SELECT";

    input.addEventListener(isSelect ? "change" : "input", () => {
      if (isSelect) {
        state[key] = input.value;
        fetchArticles(1);
      } else {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state[key] = input.value.trim();
          fetchArticles(1);
        }, 400);
      }
    });
  });
}

function resetFilters() {
  Object.keys(state).forEach((key) => {
    state[key] = "";
  });
  document.querySelectorAll(".ra-filter").forEach((el) => {
    if (el.tagName === "SELECT") el.selectedIndex = 0;
    else el.value = "";
  });
  fetchArticles(1);
}

function initResetButton() {
  clearBtn?.addEventListener("click", resetFilters);
}

// ── Init ────────────────────────────────────────────────────────────────

async function init() {
  initFilters();
  initResetButton();
  await loadMeta();
  fetchArticles(1);
}

document.addEventListener("DOMContentLoaded", init);
