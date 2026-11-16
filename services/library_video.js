import { FrappeApiClient } from "./FrappeApiClient.js";

const client = new FrappeApiClient();
const ENDPOINT = "/get_video_library";
const PAGE_LENGTH = 12;

const $ = (id) => document.getElementById(id);
const els = {
  form: $("lv-filters"),
  search: $("lv-search"),
  category: $("lv-category"),
  language: $("lv-language"),
  sort: $("lv-sort"),
  reset: $("lv-reset"),
  grid: $("lv-grid"),
  empty: $("lv-empty"),
  error: $("lv-error"),
  retry: $("lv-retry"),
  summary: $("lv-summary"),
  pagination: $("lv-pagination"),
  modal: $("lv-modal"),
  modalTitle: $("lv-modal-title"),
  player: $("lv-player"),
  details: $("lv-details"),
};

// ---------- state (kept in the URL so refresh/back/share work) ----------
const readStateFromUrl = () => {
  const p = new URLSearchParams(location.search);
  return {
    page: Math.max(1, parseInt(p.get("page"), 10) || 1),
    search: p.get("search") || "",
    category: p.get("category") || "",
    language: p.get("language") || "",
    sort: p.get("sort") || "newest",
  };
};

let state = readStateFromUrl();
let currentVideos = [];
let requestId = 0;
let filtersLoaded = false;

const writeStateToUrl = (push = true) => {
  const p = new URLSearchParams();
  if (state.page > 1) p.set("page", state.page);
  if (state.search) p.set("search", state.search);
  if (state.category) p.set("category", state.category);
  if (state.language) p.set("language", state.language);
  if (state.sort !== "newest") p.set("sort", state.sort);
  const qs = p.toString();
  const url = location.pathname + (qs ? `?${qs}` : "");
  if (push) history.pushState(null, "", url);
  else history.replaceState(null, "", url);
};

// ---------- helpers ----------
const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const LANGUAGE_NAMES = { en: "English", te: "Telugu", hi: "Hindi", de: "German" };
const languageLabel = (code) => LANGUAGE_NAMES[code] || code || "";

const formatDuration = (seconds) => {
  const s = parseInt(seconds, 10);
  if (!s || s < 0) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const absoluteUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${client.baseURL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getYoutubeId = (v) => {
  if (v.youtube_video_id) return v.youtube_video_id;
  const src = v.youtube_url || v.url || "";
  const m = src.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
};

const getThumbnail = (v) => {
  if (v.thumbnail) return absoluteUrl(v.thumbnail);
  const yt = getYoutubeId(v);
  return yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : "../assets/img/gallery/Play-btn.jpeg";
};

// ---------- rendering ----------
const renderSkeleton = () => {
  els.grid.innerHTML = Array.from({ length: 8 })
    .map(
      () => `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="lv-card">
          <div class="lv-thumb lv-skeleton"></div>
          <div class="lv-body">
            <div class="lv-skeleton mb-2" style="height:18px"></div>
            <div class="lv-skeleton mb-2" style="height:14px;width:80%"></div>
            <div class="lv-skeleton" style="height:14px;width:50%"></div>
          </div>
        </div>
      </div>`
    )
    .join("");
};

const renderCards = (videos) => {
  els.grid.innerHTML = videos
    .map((v, i) => {
      const duration = formatDuration(v.duration);
      const date = formatDate(v.publication_date);
      return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="lv-card" tabindex="0" role="button" data-index="${i}"
          aria-label="Play ${escapeHtml(v.video_title)}">
          <div class="lv-thumb">
            <img src="${escapeHtml(getThumbnail(v))}" alt="" loading="lazy"
              onerror="this.onerror=null;this.src='../assets/img/gallery/Play-btn.jpeg'">
            <div class="lv-play"><i class="bi bi-play-circle-fill"></i></div>
            ${v.video_category ? `<span class="lv-category">${escapeHtml(v.video_category)}</span>` : ""}
            ${duration ? `<span class="lv-duration">${duration}</span>` : ""}
          </div>
          <div class="lv-body">
            <h3 class="lv-title">${escapeHtml(v.video_title || v.name)}</h3>
            ${v.short_description ? `<p class="lv-desc">${escapeHtml(v.short_description)}</p>` : ""}
            <div class="lv-meta">
              ${v.speaker_presenter ? `<div class="text-truncate"><i class="bi bi-person-video3"></i> ${escapeHtml(v.speaker_presenter)}</div>` : ""}
              <div class="d-flex justify-content-between mt-1">
                <span>${date ? `<i class="bi bi-calendar3"></i> ${date}` : ""}</span>
                <span>${v.language ? `<i class="bi bi-translate"></i> ${escapeHtml(languageLabel(v.language))}` : ""}</span>
              </div>
            </div>
          </div>
        </article>
      </div>`;
    })
    .join("");
};

const renderPagination = (page, totalPages) => {
  if (totalPages <= 1) {
    els.pagination.innerHTML = "";
    return;
  }
  // window of pages around current with first/last and ellipses
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const item = (label, target, { disabled = false, active = false, aria = "" } = {}) => `
    <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
      <button type="button" class="page-link" data-page="${target}" ${disabled ? "disabled" : ""}
        ${active ? 'aria-current="page"' : ""} ${aria ? `aria-label="${aria}"` : ""}>${label}</button>
    </li>`;

  let html = item('<i class="bi bi-chevron-left"></i>', page - 1, { disabled: page <= 1, aria: "Previous" });
  let prev = 0;
  for (const p of list) {
    if (p - prev > 1) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    html += item(p, p, { active: p === page });
    prev = p;
  }
  html += item('<i class="bi bi-chevron-right"></i>', page + 1, { disabled: page >= totalPages, aria: "Next" });
  els.pagination.innerHTML = html;
};

const fillSelect = (select, values, labelFn = (x) => x) => {
  const current = select.value;
  const first = select.options[0].outerHTML;
  select.innerHTML =
    first + values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(labelFn(v))}</option>`).join("");
  select.value = values.includes(current) ? current : "";
};

const syncControls = () => {
  els.search.value = state.search;
  els.category.value = state.category;
  els.language.value = state.language;
  els.sort.value = state.sort;
};

// ---------- data ----------
const loadVideos = async () => {
  const myRequest = ++requestId;
  els.error.classList.add("d-none");
  els.empty.classList.add("d-none");
  renderSkeleton();

  try {
    const res = await client.get(ENDPOINT, {
      page: state.page,
      page_length: PAGE_LENGTH,
      search: state.search,
      category: state.category,
      language: state.language,
      sort: state.sort,
    });
    if (myRequest !== requestId) return; // a newer request is in flight

    const msg = res?.message;
    if (!msg || !Array.isArray(msg.data)) throw new Error(res?.exception || "Invalid response");

    if (!filtersLoaded && msg.filters) {
      fillSelect(els.category, msg.filters.categories || []);
      fillSelect(els.language, msg.filters.languages || [], languageLabel);
      filtersLoaded = true;
      syncControls();
    }

    // server may clamp page (e.g. page=99 for 3 pages)
    if (msg.page && msg.page !== state.page) {
      state.page = msg.page;
      writeStateToUrl(false);
    }

    currentVideos = msg.data;
    if (!currentVideos.length) {
      els.grid.innerHTML = "";
      els.empty.classList.remove("d-none");
      els.summary.textContent = "";
    } else {
      renderCards(currentVideos);
      const start = (msg.page - 1) * msg.page_length + 1;
      const end = start + currentVideos.length - 1;
      els.summary.textContent = `Showing ${start}–${end} of ${msg.total} videos`;
    }
    renderPagination(msg.page, msg.total_pages);
  } catch (err) {
    if (myRequest !== requestId) return;
    console.error("Video library load failed:", err);
    els.grid.innerHTML = "";
    els.pagination.innerHTML = "";
    els.summary.textContent = "";
    els.error.classList.remove("d-none");
  }
};

const update = (patch, { resetPage = true } = {}) => {
  state = { ...state, ...patch, ...(resetPage ? { page: 1 } : {}) };
  writeStateToUrl();
  loadVideos();
};

// ---------- player modal ----------
let modalInstance = null;

const openVideo = (v) => {
  const yt = getYoutubeId(v);
  if (yt) {
    els.player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0"
      title="${escapeHtml(v.video_title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  } else if (v.url) {
    els.player.innerHTML = `<video src="${escapeHtml(absoluteUrl(v.url))}" controls autoplay playsinline></video>`;
  } else {
    els.player.innerHTML = `<div class="text-white text-center p-5">Video not available.</div>`;
  }

  els.modalTitle.textContent = v.video_title || v.name;

  const row = (icon, label, value) =>
    value ? `<div class="col-md-6 mb-2"><i class="bi ${icon} text-success"></i> <strong>${label}:</strong> ${escapeHtml(value)}</div>` : "";
  const tags = (v.keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => `<span class="badge rounded-pill text-bg-light border me-1 mb-1">${escapeHtml(k)}</span>`)
    .join("");

  els.details.innerHTML = `
    ${v.short_description ? `<p>${escapeHtml(v.short_description)}</p>` : ""}
    <div class="row small text-muted">
      ${row("bi-person-video3", "Speaker", v.speaker_presenter)}
      ${row("bi-person-badge", "Designation", v.designation)}
      ${row("bi-building", "Organisation", v.organisation)}
      ${row("bi-calendar3", "Published", formatDate(v.publication_date))}
      ${row("bi-clock", "Duration", formatDuration(v.duration))}
      ${row("bi-translate", "Language", languageLabel(v.language))}
    </div>
    ${tags ? `<div class="mt-2">${tags}</div>` : ""}
    ${v.youtube_url || v.url ? `<a class="btn btn-sm btn-outline-success mt-3" href="${escapeHtml(v.youtube_url || absoluteUrl(v.url))}" target="_blank" rel="noopener">
      <i class="bi bi-box-arrow-up-right"></i> Open in new tab</a>` : ""}`;

  modalInstance = modalInstance || bootstrap.Modal.getOrCreateInstance(els.modal);
  modalInstance.show();
};

// stop playback when the modal closes
els.modal.addEventListener("hidden.bs.modal", () => {
  els.player.innerHTML = "";
});

// ---------- events ----------
let searchTimer;
els.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => update({ search: els.search.value.trim() }), 400);
});
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearTimeout(searchTimer);
  update({ search: els.search.value.trim() });
});
els.category.addEventListener("change", () => update({ category: els.category.value }));
els.language.addEventListener("change", () => update({ language: els.language.value }));
els.sort.addEventListener("change", () => update({ sort: els.sort.value }));
els.reset.addEventListener("click", () => {
  clearTimeout(searchTimer);
  state = { page: 1, search: "", category: "", language: "", sort: "newest" };
  syncControls();
  writeStateToUrl();
  loadVideos();
});
els.retry.addEventListener("click", loadVideos);

els.pagination.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn || btn.disabled) return;
  const page = parseInt(btn.dataset.page, 10);
  if (!page || page === state.page) return;
  update({ page }, { resetPage: false });
  els.form.scrollIntoView({ behavior: "smooth", block: "start" });
});

const handleCardActivate = (e) => {
  const card = e.target.closest(".lv-card[data-index]");
  if (!card) return;
  if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  const v = currentVideos[parseInt(card.dataset.index, 10)];
  if (v) openVideo(v);
};
els.grid.addEventListener("click", handleCardActivate);
els.grid.addEventListener("keydown", handleCardActivate);

window.addEventListener("popstate", () => {
  state = readStateFromUrl();
  syncControls();
  loadVideos();
});

// ---------- init ----------
syncControls();
loadVideos();
