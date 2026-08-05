import { FrappeApiClient } from "../services/FrappeApiClient.js";

const client = new FrappeApiClient();

// ─── State ────────────────────────────────────────────────────────────
const webinarMap     = new Map();
let activeWebinarId  = null;

const upcomingState  = { page: 1, totalPages: 1, pageSize: 3 };
const pastState      = { page: 1, totalPages: 1, pageSize: 8 };

// ─── Toastr ───────────────────────────────────────────────────────────
const configureToastr = () => {
  if (typeof toastr === "undefined") return;
  toastr.options = {
    closeButton: true, progressBar: true,
    positionClass: "toast-top-right", preventDuplicates: true,
    timeOut: "4000", showMethod: "fadeIn", hideMethod: "fadeOut",
  };
};
const notify = (type, msg) =>
  typeof toastr !== "undefined" ? toastr[type](msg) : alert(msg);

// ─── Helpers ──────────────────────────────────────────────────────────
const fmtDuration = (sec) => {
  if (!sec) return null;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : m ? `${m}m` : null;
};

const fmtTimeRange = (dtStr, durationSec) => {
  const start = new Date(dtStr);
  const end   = new Date(start.getTime() + (durationSec || 0) * 1000);
  const opts  = { hour: "2-digit", minute: "2-digit", hour12: true };
  return `${start.toLocaleTimeString("en-IN", opts)} – ${end.toLocaleTimeString("en-IN", opts)} IST`;
};

const fmtShortDuration = (sec) => {
  if (!sec) return "";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00` : `${String(m).padStart(2,"0")}:00`;
};

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const thumbGradient = (name = "") => {
  const p = [
    ["#a8d5b5","#1e6b44"],["#90c4a8","#1a5c3a"],
    ["#b5d5c5","#256b47"],["#c5e8d0","#1e5c38"],["#8ec9a8","#174f33"],
  ];
  return `linear-gradient(135deg,${p[(name.charCodeAt(0)||0)%p.length].join(",")})`;
};

/**
 * Returns the full image URL for a Frappe file path.
 * Handles both relative (/files/...) and absolute (https://...) URLs.
 */
const resolveImgUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${client.baseURL}${path}`;
};

/**
 * Upcoming card thumbnail: clickable if webinar_deatils_img exists, opens image popup.
 */
const upcomingThumb = (wb) => {
  const imgUrl     = resolveImgUrl(wb.webinar_img);
  const detailsImg = resolveImgUrl(wb.webinar_deatils_img);
  const clickAttr  = detailsImg
    ? `data-details-img="${esc(detailsImg)}" class="wb-thumb wb-thumb-clickable" title="Click to view details image"`
    : `class="wb-thumb"`;
  return imgUrl
    ? `<div ${clickAttr}><img src="${imgUrl}" alt="${esc(wb.title)}"></div>`
    : `<div ${clickAttr} style="background:${thumbGradient(wb.name)};"><i class="bi bi-camera-video-fill"></i></div>`;
};

/**
 * Past card thumbnail inner content: <img> or gradient div.
 */
const pastThumbInner = (wb) => {
  const imgUrl = resolveImgUrl(wb.webinar_img);
  return imgUrl
    ? `<img src="${imgUrl}" alt="${esc(wb.title)}" style="width:100%;height:100%;object-fit:cover;display:block;">`
    : `<div class="thumb-bg" style="background:${thumbGradient(wb.name)};"><i class="bi bi-camera-video-fill"></i></div>`;
};

const fmtDate = (dtStr) => {
  const d = new Date(dtStr);
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
};

// ─── Pagination renderer ──────────────────────────────────────────────
/**
 * Renders a Bootstrap pagination + page-info line into containerId.
 * onPageChange(newPage) is called when a page button is clicked.
 */
const renderPagination = (containerId, state, onPageChange) => {
  const el = document.getElementById(containerId);
  const { page, totalPages, pageSize } = state;

  if (totalPages <= 1) { el.innerHTML = ""; return; }

  // Build page number array with ellipsis
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)  pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const liClass = (p) =>
    p === page ? "page-item active" : p === "…" ? "page-item disabled" : "page-item";

  el.innerHTML = `
    <nav aria-label="Webinar pagination">
      <ul class="pagination justify-content-center wb-pagination mb-0">
        <li class="page-item ${page === 1 ? "disabled" : ""}">
          <button class="page-link" data-page="${page - 1}">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        ${pages.map((p) => `
          <li class="${liClass(p)}">
            <button class="page-link" data-page="${p}" ${p === "…" ? "disabled" : ""}>${p}</button>
          </li>`).join("")}
        <li class="page-item ${page === totalPages ? "disabled" : ""}">
          <button class="page-link" data-page="${page + 1}">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>`;

  el.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages && p !== page) {
        onPageChange(p);
      }
    });
  });
};

// ═══════════════════════════════════════════════════════════════════════
// UPCOMING WEBINARS
// ═══════════════════════════════════════════════════════════════════════

const buildUpcomingCard = (wb) => {
  const d       = new Date(wb.date_time);
  const timeRng = fmtTimeRange(wb.date_time, wb.duration);
  webinarMap.set(wb.name, { ...wb, timeRng });

  return `
  <div class="webinar-card">
    <div class="wb-date">
      <div class="wb-date-inner">
        <div class="day">${d.getDate()}</div>
        <div class="mon">${d.toLocaleString("en-US",{month:"short"}).toUpperCase()}</div>
        <div class="yr">${d.getFullYear()}</div>
        <div class="wday">${d.toLocaleString("en-US", { weekday: "short" }).toUpperCase()}</div>
      </div>
    </div>

    ${upcomingThumb(wb)}

    <div class="wb-content">
      <div class="wb-meta">
        <span class="live-badge"><span class="dot"></span>LIVE WEBINAR</span>
        <span class="wb-time"><i class="bi bi-clock"></i>${esc(timeRng)}</span>
      </div>
      <h5>${esc(wb.title)}</h5>
      <p class="wb-desc">${esc(wb.key_learnings || "")}</p>
      <div class="wb-speaker">
        <i class="bi bi-person-circle"></i>
        <div>
          <span>${esc(wb.speakers || "Speaker TBA")}</span>
          ${wb.speaker_designation
            ? `<div class="wb-speaker-role">${esc(wb.speaker_designation)}</div>`
            : ""}
        </div>
      </div>
    </div>

    <div class="wb-actions">
      <button class="btn-reg js-open-register" data-id="${esc(wb.name)}" data-title="${esc(wb.title)}">
        Register Now <i class="bi bi-chevron-right"></i>
      </button>
      <button class="btn-view-det js-open-details" data-id="${esc(wb.name)}">
        View Details <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>`;
};

const renderUpcoming = (list) => {
  const el = document.getElementById("upcoming-list");
  if (!list || list.length === 0) {
    el.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-calendar-x" style="font-size:3rem;color:#ccc;"></i>
        <p class="mt-3">No upcoming webinars scheduled at the moment.<br>Check back soon!</p>
      </div>`;
    return;
  }
  el.innerHTML = list.map(buildUpcomingCard).join("");
  el.querySelectorAll(".js-open-register").forEach((btn) =>
    btn.addEventListener("click", () => openRegisterModal(btn.dataset.id, btn.dataset.title))
  );
  el.querySelectorAll(".js-open-details").forEach((btn) =>
    btn.addEventListener("click", () => openDetailsModal(btn.dataset.id))
  );
  el.querySelectorAll(".wb-thumb-clickable[data-details-img]").forEach((thumb) =>
    thumb.addEventListener("click", () => openWbImgPopup(thumb.dataset.detailsImg))
  );
};

const fetchUpcoming = async () => {
  const listEl   = document.getElementById("upcoming-list");
  const viewAllEl = document.getElementById("view-all-upcoming");

  listEl.innerHTML =
    `<div class="wb-skeleton"></div><div class="wb-skeleton"></div><div class="wb-skeleton"></div>`;
  viewAllEl.style.display = "none";

  try {
    // fetch first 3 to show initially
    const res = await client.get("/get_webinar_list", {
      type: "upcoming", page: 1, page_size: upcomingState.pageSize,
    });

    if (res?.message?.success && Array.isArray(res.message.data)) {
      upcomingState.totalPages = res.message.total_pages || 1;
      renderUpcoming(res.message.data);
      // show button only when there are more than 3 total
      console.log(res,'webinar');
      if (res.message.total_count > upcomingState.pageSize) {
        
        viewAllEl.style.display = "block";
      }
    } else {
      renderUpcoming([]);
    }
  } catch (err) {
    console.error("fetchUpcoming:", err);
    listEl.innerHTML = `
      <div class="text-center py-4 text-danger">
        <i class="bi bi-exclamation-circle-fill me-1"></i>
        Failed to load upcoming webinars.
      </div>`;
  }
};

const loadAllUpcoming = async () => {
  const btn       = document.getElementById("view-all-btn");
  const listEl    = document.getElementById("upcoming-list");
  const viewAllEl = document.getElementById("view-all-upcoming");

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Loading…`;

  let loaded = false;

  try {
    const res = await client.get("/get_webinar_list", {
      type: "upcoming", page: 1, page_size: 100,
    });

    if (res?.message?.success && Array.isArray(res.message.data)) {
      renderUpcoming(res.message.data);
      listEl.classList.add("scrollable");
      viewAllEl.style.display = "none";
      loaded = true;
    }
  } catch (err) {
    console.error("loadAllUpcoming:", err);
    notify("error", "Failed to load all webinars. Please try again.");
  } finally {
    if (!loaded) {
      // restore button so user can retry
      btn.disabled = false;
      btn.innerHTML = `View All Upcoming Webinars <i class="bi bi-arrow-right"></i>`;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════
// PAST WEBINARS
// ═══════════════════════════════════════════════════════════════════════

const fmtViews = (n) => {
  if (!n) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
};

const buildAutoplayUrl = (url) => {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&rel=0`;
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1`;
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return url;
};

const buildPastCard = (wb) => {
  const dur    = fmtShortDuration(wb.duration);
  const date   = fmtDate(wb.date_time);
  const views  = fmtViews(wb.view_count || wb.registration_count);
  const topic = wb.topic || wb.theme || wb.category || "";
  const VideoUrl = wb.webinar_video
    ? (wb.webinar_video.startsWith("http") ? wb.webinar_video : `${client.baseURL}${wb.webinar_video}`)
    : "";
  webinarMap.set(wb.name, { ...wb, timeRng: fmtTimeRange(wb.date_time, wb.duration) });

  const imgUrl = resolveImgUrl(wb.webinar_img);

  return `
  <div class="col-md-6" data-topic="${esc(topic.toLowerCase())}">
    <div class="past-card ${VideoUrl ? "" : "no-video"}" data-id="${esc(wb.name)}" data-video="${esc(VideoUrl)}">
      <div class="past-thumb">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${esc(wb.title)}">`
          : `<div class="thumb-bg" style="background:${thumbGradient(wb.name)};"><i class="bi bi-camera-video-fill"></i></div>`
        }
        ${VideoUrl ? `<div class="play-overlay"><div class="play-circle"><i class="bi bi-play-fill" style="margin-left:2px;"></i></div></div>` : ""}
        ${dur ? `<div class="dur-badge">${dur}</div>` : ""}
      </div>
      <div class="past-info">
        <div class="info-top">
          ${topic ? `<span class="topic-tag">${esc(topic)}</span>` : ""}
          <h6>${esc(wb.title)}</h6>
          ${wb.speakers ? `<div class="past-speaker"><i class="bi bi-person-circle"></i>${esc(wb.speakers)}</div>` : ""}
          <div class="past-meta">
            <span><i class="bi bi-calendar3 me-1"></i>${date}</span>
            ${views ? `<span><i class="bi bi-eye me-1"></i>${views} Views</span>` : ""}
            ${dur ? `<span><i class="bi bi-clock me-1"></i>${dur}</span>` : ""}
          </div>
          <div class="past-pills">
            ${wb.speakers ? `<span class="past-pill">${esc(wb.speakers)}</span>` : ""}
            ${topic ? `<span class="past-pill">${esc(topic)}</span>` : ""}
          </div>
        </div>
        <div class="info-bottom">
          ${VideoUrl
            ? `<button class="btn-watch js-watch-btn" data-title="${esc(wb.title)}" data-video="${esc(VideoUrl)}">Watch Now <i class="bi bi-arrow-right"></i></button>`
            : `<button class="btn-watch btn-watch-detail js-open-details" data-id="${esc(wb.name)}">View Details <i class="bi bi-arrow-right"></i></button>`
          }
        </div>
      </div>
    </div>
  </div>`;
};

const populateTopicFilter = (list) => {
  const sel = document.getElementById("topic-filter");
  if (!sel) return;
  const topics = [...new Set(
    list.map(wb => wb.topic || wb.theme || wb.category || "").filter(Boolean)
  )].sort();
  // preserve existing "Filter by Topic" option, remove old dynamic ones
  sel.querySelectorAll("option[data-dynamic]").forEach(o => o.remove());
  topics.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.toLowerCase();
    opt.textContent = t;
    opt.dataset.dynamic = "1";
    sel.appendChild(opt);
  });
};

const applyPastFilters = () => {
  const q     = (document.getElementById("past-search")?.value || "").toLowerCase();
  const topic = (document.getElementById("topic-filter")?.value || "").toLowerCase();
  document.querySelectorAll("#past-list [data-topic]").forEach((col) => {
    const title     = col.querySelector("h6")?.textContent.toLowerCase() || "";
    const colTopic  = col.dataset.topic || "";
    const matchQ    = !q     || title.includes(q);
    const matchTopic = !topic || colTopic === topic;
    col.style.display = matchQ && matchTopic ? "" : "none";
  });
};

const renderPast = (list) => {
  const el        = document.getElementById("past-list");
  const viewAllWrap = document.getElementById("view-all-past-wrap");
  if (!list || list.length === 0) {
    el.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-play-circle" style="font-size:3rem;color:#ccc;"></i>
        <p class="mt-3">No past webinar recordings available yet.</p>
      </div>`;
    if (viewAllWrap) viewAllWrap.style.display = "none";
    return;
  }
  el.innerHTML = list.map(buildPastCard).join("");
  el.querySelectorAll(".past-card[data-id]").forEach((card) => {
    const videoUrl = card.dataset.video;
    if (!videoUrl) return;

    const thumb       = card.querySelector(".past-thumb");
    const playOverlay = card.querySelector(".play-overlay");
    const fsBtn       = card.querySelector(".fullscreen-btn");
    let iframeEl      = null;

    const isDrive = videoUrl.includes("drive.google.com");
    let rafId  = null;
    let mouseX = 0;
    let mouseY = 0;

    const onDocMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };

    const removeVideo = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      document.removeEventListener("mousemove", onDocMove);
      if (iframeEl) { iframeEl.remove(); iframeEl = null; }
      thumb.querySelector(".iframe-capture")?.remove();
      playOverlay.style.display = "";
    };

    const checkBounds = () => {
      const r = card.getBoundingClientRect();
      if (mouseX < r.left || mouseX > r.right || mouseY < r.top || mouseY > r.bottom) {
        removeVideo();
      } else {
        rafId = requestAnimationFrame(checkBounds);
      }
    };

    const startTracking = (x, y) => {
      mouseX = x; mouseY = y;
      document.addEventListener("mousemove", onDocMove);
      rafId = requestAnimationFrame(checkBounds);
    };

    card.addEventListener("mouseenter", (e) => {
      if (iframeEl) return;
      playOverlay.style.display = "none";

      iframeEl = document.createElement("iframe");
      iframeEl.src = buildAutoplayUrl(videoUrl);
      iframeEl.frameBorder = "0";
      iframeEl.allow = "autoplay; fullscreen; picture-in-picture";
      iframeEl.allowFullscreen = true;
      iframeEl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;z-index:5;";
      thumb.appendChild(iframeEl);

      if (isDrive) {
        const capture = document.createElement("div");
        capture.className = "iframe-capture";
        capture.style.cssText = "position:absolute;inset:0;z-index:6;";
        capture.innerHTML = `
          <div class="drive-play-hint">
            <i class="bi bi-play-circle-fill"></i>
            <span>Click to play</span>
          </div>`;
        capture.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const wb = webinarMap.get(card.dataset.id);
          openVideoPopup(wb?.title || "", buildAutoplayUrl(videoUrl));
        }, { once: true });
        thumb.appendChild(capture);
      } else {
        startTracking(e.clientX, e.clientY);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (!rafId) removeVideo();
    });

    fsBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      iframeEl?.requestFullscreen?.();
    });
  });
  el.querySelectorAll(".js-watch-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openVideoPopup(btn.dataset.title, btn.dataset.video);
    });
  });

  el.querySelectorAll(".js-open-details").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetailsModal(btn.dataset.id);
    });
  });

  populateTopicFilter(list);
  if (viewAllWrap) viewAllWrap.style.display = "block";
};

const SHIMMER_BG = "linear-gradient(90deg,#f2f2f2 25%,#e8e8e8 50%,#f2f2f2 75%)";
const SHIMMER_STYLE = `background:${SHIMMER_BG};background-size:400% 100%;animation:shimmer 1.4s infinite;`;

const pastSkeletonCard = () => `
  <div class="col-md-6">
    <div style="background:#fff;border:1px solid #e4e4e4;border-radius:14px;overflow:hidden;width:100%;display:flex;flex-direction:row;min-height:130px;">
      <div style="width:130px;min-width:130px;${SHIMMER_STYLE}"></div>
      <div style="padding:14px 16px;flex:1;">
        <div class="wb-skeleton" style="height:10px;width:50%;margin-bottom:10px;border-radius:20px;"></div>
        <div class="wb-skeleton" style="height:13px;width:90%;margin-bottom:6px;border-radius:4px;"></div>
        <div class="wb-skeleton" style="height:13px;width:70%;margin-bottom:10px;border-radius:4px;"></div>
        <div class="wb-skeleton" style="height:11px;width:55%;margin-bottom:6px;border-radius:4px;"></div>
        <div class="wb-skeleton" style="height:11px;width:35%;border-radius:4px;"></div>
      </div>
    </div>
  </div>`;

const fetchPast = async (page = 1) => {
  pastState.page = page;
  document.getElementById("past-list").innerHTML = Array.from({ length: pastState.pageSize }, pastSkeletonCard).join("");
  document.getElementById("past-pagination").innerHTML = "";

  // also populate filter dropdown on first load
  const isFirstLoad = page === 1;

  try {
    const res = await client.get("/get_webinar_list", {
      type: "past", page, page_size: pastState.pageSize,
    });

    if (res?.message?.success && Array.isArray(res.message.data)) {
      pastState.totalPages = res.message.total_pages || 1;
      renderPast(res.message.data);
      renderPagination("past-pagination", pastState, fetchPast);
      scrollToSection("past-list");
      // hide "View All" if only one page
      if (pastState.totalPages <= 1) {
        document.getElementById("view-all-past-wrap").style.display = "none";
      }
    } else {
      renderPast([]);
    }
  } catch (err) {
    console.error("fetchPast:", err);
    document.getElementById("past-list").innerHTML = `
      <div class="col-12 text-center py-4 text-danger">
        <i class="bi bi-exclamation-circle-fill me-1"></i>
        Failed to load past webinars.
      </div>`;
  }
};

// Smooth scroll to section top (only on page change, not initial load)
let isInitialLoad = true;
const scrollToSection = (sectionId) => {
  if (isInitialLoad) return;
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ═══════════════════════════════════════════════════════════════════════
// WEBINAR DETAILS IMAGE POPUP
// ═══════════════════════════════════════════════════════════════════════

const openWbImgPopup = (imgUrl) => {
  const popup = document.getElementById("wb-img-popup");
  const img   = document.getElementById("wb-img-popup-img");
  if (!popup || !img) return;
  img.src = imgUrl;
  popup.style.display = "flex";
};

const closeWbImgPopup = () => {
  const popup = document.getElementById("wb-img-popup");
  const img   = document.getElementById("wb-img-popup-img");
  if (popup) popup.style.display = "none";
  if (img)   img.src = "";
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("wb-img-popup-close")
    ?.addEventListener("click", closeWbImgPopup);
  document.getElementById("wb-img-popup")
    ?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeWbImgPopup();
    });
});

// ═══════════════════════════════════════════════════════════════════════
// DRIVE VIDEO MINI POPUP
// ═══════════════════════════════════════════════════════════════════════

const openVideoPopup = (title, src) => {
  document.getElementById("vp-title").textContent = title;
  document.getElementById("vp-iframe").src = src;
  document.getElementById("video-popup").style.display = "flex";
};

const closeVideoPopup = () => {
  document.getElementById("video-popup").style.display = "none";
  document.getElementById("vp-iframe").src = "";
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("vp-close").addEventListener("click", closeVideoPopup);
  document.getElementById("vp-fullscreen").addEventListener("click", () => {
    document.getElementById("vp-iframe").requestFullscreen?.();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// VIDEO MODAL
// ═══════════════════════════════════════════════════════════════════════

const openVideoModal = (id) => {
  const wb = webinarMap.get(id);
  if (!wb) return;

  const titleEl = document.getElementById("video-modal-title");
  const bodyEl = document.getElementById("video-modal-body");
  const videoUrl = `${client.baseURL}${wb.webinar_video}` || "";

  if (titleEl) titleEl.textContent = wb.title || "";

  if (!wb.webinar_video) {
    bodyEl.innerHTML = `<p class="text-center text-muted py-4">No video available for this webinar.</p>`;
  } else {
    bodyEl.innerHTML = `
      <div class="ratio ratio-16x9">
        <iframe src="${esc(videoUrl)}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </div>`;
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById("videoModal")).show();
};

// Clear video src on modal close to stop playback
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("videoModal")?.addEventListener("hidden.bs.modal", () => {
    const bodyEl = document.getElementById("video-modal-body");
    if (bodyEl) bodyEl.innerHTML = "";
  });
});

// ═══════════════════════════════════════════════════════════════════════
// DETAILS MODAL
// ═══════════════════════════════════════════════════════════════════════

const openDetailsModal = (id) => {
  const wb = webinarMap.get(id);
  if (!wb) return;

  const dur    = fmtDuration(wb.duration) || "—";
  const spots  = wb.maximum_no_of_participants || "Unlimited";
  const filled = wb.registration_count || 0;
  const pct    = spots !== "Unlimited"
    ? Math.min(100, Math.round((filled / spots) * 100)) : null;

  document.getElementById("details-body").innerHTML = `
    <h4 class="fw-bold mb-3">${esc(wb.title)}</h4>
    <div class="d-flex flex-wrap gap-2 mb-3">
      <span class="live-badge"><span class="dot"></span>WEBINAR</span>
      <span class="text-muted" style="font-size:.85rem;">
        <i class="bi bi-clock text-success me-1"></i>${esc(wb.timeRng || fmtTimeRange(wb.date_time, wb.duration))}
      </span>
      <span class="text-muted" style="font-size:.85rem;">
        <i class="bi bi-hourglass-split text-success me-1"></i>${dur}
      </span>
    </div>
    <div class="rounded-3 p-3 mb-3" style="background:#f0faf3;border:1px solid #c8e6c9;">
      <div class="text-uppercase fw-bold mb-2" style="font-size:.72rem;letter-spacing:.5px;color:#2d6a4f;">Speaker</div>
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-person-circle" style="font-size:1.6rem;color:#2d6a4f;"></i>
        <span class="fw-semibold">${esc(wb.speakers || "TBA")}</span>
      </div>
    </div>
    <div class="mb-3">
      <div class="text-uppercase fw-bold mb-2" style="font-size:.72rem;letter-spacing:.5px;color:#555;">Key Learnings</div>
      <p style="color:#444;font-size:.92rem;line-height:1.6;">${esc(wb.key_learnings || "Details will be shared soon.")}</p>
    </div>
    <div class="d-flex gap-4 text-muted mb-2" style="font-size:.84rem;flex-wrap:wrap;">
      <span><i class="bi bi-people me-1 text-success"></i>Max seats: <strong class="text-dark">${spots}</strong></span>
      <span><i class="bi bi-person-check me-1 text-success"></i>Registered: <strong class="text-dark">${filled}</strong></span>
    </div>
    ${pct !== null ? `
    <div class="mb-3">
      <div class="d-flex justify-content-between mb-1" style="font-size:.78rem;color:#666;">
        <span>Seats filled</span><span>${pct}%</span>
      </div>
      <div class="progress" style="height:6px;border-radius:4px;">
        <div class="progress-bar bg-success" style="width:${pct}%;"></div>
      </div>
    </div>` : ""}
    ${wb.link ? `
    <div class="mt-2">
      <a href="${esc(wb.link)}" target="_blank" class="text-success text-decoration-none" style="font-size:.85rem;">
        <i class="bi bi-link-45deg"></i> Join Link
      </a>
    </div>` : ""}`;

  document.getElementById("modal-reg-btn").onclick = () =>
    openRegisterModal(wb.name, wb.title);

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("detailsModal")
  ).show();
};

// ═══════════════════════════════════════════════════════════════════════
// REGISTRATION MODAL
// ═══════════════════════════════════════════════════════════════════════

const openRegisterModal = (webinarId, webinarTitle = "") => {
  activeWebinarId = webinarId;
  document.getElementById("reg-webinar-title").textContent = webinarTitle;
  document.getElementById("reg-form").reset();
  clearRegErrors();

  const detailsEl   = document.getElementById("detailsModal");
  const detailsInst = bootstrap.Modal.getInstance(detailsEl);
  if (detailsInst) {
    detailsEl.addEventListener("hidden.bs.modal", () => {
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("registerModal")
      ).show();
    }, { once: true });
    detailsInst.hide();
  } else {
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("registerModal")
    ).show();
  }
};

const clearRegErrors = () => {
  document.querySelectorAll("#reg-form .is-invalid").forEach((el) =>
    el.classList.remove("is-invalid")
  );
};

const validateRegForm = () => {
  const required = ["reg-fname","reg-lname","reg-org","reg-role","reg-email","reg-phone"];
  let valid = true;
  required.forEach((id) => {
    const el = document.getElementById(id);
    el.classList.toggle("is-invalid", !el.value.trim());
    if (!el.value.trim()) valid = false;
  });
  const emailEl = document.getElementById("reg-email");
  if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add("is-invalid");
    valid = false;
  }
  return valid;
};

const submitRegistration = async () => {
  if (!activeWebinarId) return;
  if (!validateRegForm()) {
    notify("warning", "Please fill in all required fields.");
    return;
  }

  const submitBtn = document.getElementById("reg-submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Submitting…`;

  const userData = {
    first_name:   document.getElementById("reg-fname").value.trim(),
    last_name:    document.getElementById("reg-lname").value.trim(),
    organization: document.getElementById("reg-org").value.trim(),
    role:         document.getElementById("reg-role").value.trim(),
    email:        document.getElementById("reg-email").value.trim(),
    phone:        document.getElementById("reg-phone").value.trim(),
    interests:    document.getElementById("reg-interests").value.trim(),
  };

  try {
    const res = await client.post("webinar_registration", {
      webinarId: activeWebinarId,
      userData:  JSON.stringify(userData),
    });

    if (res?.message?.success === true) {
      notify("success", res.message.message || "Registered successfully!");
      bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
      document.getElementById("reg-form").reset();
      const wb = webinarMap.get(activeWebinarId);
      if (wb) { wb.registration_count = (wb.registration_count || 0) + 1; }
    } else {
      const errMsg =
        res?.message?.message || res?.message?.error || "Registration failed. Please try again.";
      if (res?.message?.message?.toLowerCase().includes("email")) {
        document.getElementById("reg-email").classList.add("is-invalid");
      }
      notify("error", errMsg);
    }
  } catch (err) {
    console.error("submitRegistration:", err);
    notify("error", "Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="bi bi-check-circle"></i> Reserve My Seat`;
  }
};

// ═══════════════════════════════════════════════════════════════════════
// ADD TO CALENDAR
// ═══════════════════════════════════════════════════════════════════════

const addToCalendar = () => {
  const upcoming = [...webinarMap.values()].find(
    (wb) => new Date(wb.date_time) >= new Date()
  );
  if (!upcoming) { notify("info", "No upcoming webinars to add."); return; }

  const s   = new Date(upcoming.date_time);
  const e   = new Date(s.getTime() + (upcoming.duration || 7200) * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//IGGAARL//Webinar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(s)}`, `DTEND:${fmt(e)}`,
    `SUMMARY:${upcoming.title}`,
    `DESCRIPTION:${(upcoming.key_learnings || "").replace(/\n/g, "\\n")}`,
    upcoming.link ? `URL:${upcoming.link}` : "",
    "END:VEVENT","END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const a = document.createElement("a");
  a.href  = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "webinar.ics";
  a.click();
  URL.revokeObjectURL(a.href);
};

// ═══════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  configureToastr();

  // Load both sections; enable scroll-on-page-change once both finish
  Promise.allSettled([fetchUpcoming(), fetchPast(1)])
    .then(() => { isInitialLoad = false; });

  document.getElementById("view-all-btn")
    .addEventListener("click", loadAllUpcoming);

  // Client-side search + topic filter on past cards (current page only)
  document.getElementById("past-search").addEventListener("input", applyPastFilters);
  document.getElementById("topic-filter")?.addEventListener("change", applyPastFilters);

  // View All Webinars (past) — loads all past in scrollable container
  document.getElementById("view-all-past-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("view-all-past-btn");
    const wrap = document.getElementById("view-all-past-wrap");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Loading…`;
    try {
      const res = await client.get("/get_webinar_list", { type: "past", page: 1, page_size: 100 });
      if (res?.message?.success && Array.isArray(res.message.data)) {
        renderPast(res.message.data);
        document.getElementById("past-pagination").innerHTML = "";
        wrap.style.display = "none";
      }
    } catch (err) {
      notify("error", "Failed to load all webinars.");
      btn.disabled = false;
      btn.innerHTML = `View All Webinars <i class="bi bi-arrow-right"></i>`;
    }
  });

  document.getElementById("add-calendar-btn")
    .addEventListener("click", addToCalendar);

  document.getElementById("reg-submit-btn")
    .addEventListener("click", submitRegistration);

  // Clear validation on input
  document.getElementById("reg-form").addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
  });

  // Newsletter
  document.getElementById("subscribe-btn").addEventListener("click", () => {
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("newsletterModal")
    ).show();
  });

  document.getElementById("nl-submit").addEventListener("click", () => {
    const name  = document.getElementById("nl-name").value.trim();
    const email = document.getElementById("nl-email").value.trim();
    if (!name || !email) { notify("warning", "Please fill in all required fields."); return; }
    // TODO: POST to newsletter API
    notify("success", `Thank you, ${name}! You've been subscribed.`);
    bootstrap.Modal.getInstance(document.getElementById("newsletterModal")).hide();
    document.getElementById("nl-name").value  = "";
    document.getElementById("nl-email").value = "";
  });
});
