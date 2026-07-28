import { FrappeApiClient } from "../services/FrappeApiClient.js";
let base = null;

const client = new FrappeApiClient();

const CATEGORIES = [
  {
    key: "PDF Resources",
    label: "PDF Resources",
    icon: "bi-file-earmark-pdf-fill",
    color: "#e74c3c",
    desc: "Training manuals, guides and reference materials.",
  },
  {
    key: "Video Lecture",
    label: "Videos",
    icon: "bi-camera-video-fill",
    color: "#2c3e50",
    desc: "Training videos, demonstrations and webinars.",
  },
  {
    key: "Documents",
    label: "Documents",
    icon: "bi-file-earmark-text-fill",
    color: "#3498db",
    desc: "Reports, case studies and technical documents.",
  },
  {
    key: "Presentations",
    label: "Presentations",
    icon: "bi-easel-fill",
    color: "#e67e22",
    desc: "Training presentations and workshop materials.",
  },
];

const GRADIENTS = [
  ["#a8d5b5", "#1e6b44"],
  ["#90c4a8", "#1a5c3a"],
  ["#b5d5c5", "#256b47"],
  ["#c5e8d0", "#1e5c38"],
  ["#8ec9a8", "#174f33"],
];

const PAGE_SIZE = 6;

let activeCategory = null;
let searchQuery = "";
let debounceTimer = null;
let loaded = false;
let currentPage = 1;
let totalRecords = 0;

const thumbGradient = (name = "") =>
  `linear-gradient(135deg,${GRADIENTS[(name.charCodeAt(0) || 0) % GRADIENTS.length].join(",")})`;

const resolveUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${client.baseURL}${path}`;
};

const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const catIcon = (key) =>
  (CATEGORIES.find((c) => c.key === key) || {}).icon || "bi-file-earmark";

const isVideoUrl = (url) =>
  !!url && /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/.test(url);

const buildAutoplayUrl = (url) => {
  if (!url) return "";
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt)
    return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&rel=0&enablejsapi=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  return "";
};

const showSkeletons = () => {
  document.getElementById("lr-artifact-grid").innerHTML = Array(PAGE_SIZE)
    .fill(
      '<div class="col-lg-4 col-md-6"><div class="lr-skeleton-card"></div></div>',
    )
    .join("");
  document.getElementById("lr-empty").style.display = "none";
  document.getElementById("lr-pagination").innerHTML = "";
};

const buildArtifactCard = (item) => {
  const isVideo =
    item.category === "Video Lecture" && isVideoUrl(item.attachment);
  const grad = thumbGradient(item.name || "");
  const icon = catIcon(item.category);
  const fileUrl = resolveUrl(item.attachment);
  const title =
    item.title || item.a_short_description_about_the_artifact || item.name;

  const viewBtn = fileUrl
    ? `<a class="lr-view-btn" href="${esc(fileUrl)}" target="_blank" rel="noopener">
         View Resource <i class="bi bi-arrow-right"></i>
       </a>`
    : `<span class="lr-view-btn disabled">No attachment</span>`;

  return `
    <div class="col-lg-4 col-md-6">
      <div class="lr-artifact-card ${isVideo ? "" : "no-video"}"
           data-video="${isVideo ? esc(item.attachment) : ""}">
        <div class="lr-artifact-thumb" style="background:${grad};">
          <i class="bi ${esc(icon)} lr-thumb-icon"></i>
          ${isVideo ? `<div class="lr-play-overlay"><i class="bi bi-play-fill"></i></div>` : ""}
          ${isVideo ? `<button class="lr-fs-btn" title="Full Screen"><i class="bi bi-fullscreen"></i></button>` : ""}
        </div>
        <div class="lr-artifact-info">
          <span class="lr-cat-badge">${esc(item.category || "")}</span>
          <h6>${esc(title)}</h6>
          <p class="lr-artifact-desc">${esc(item.a_short_description_about_the_artifact || "")}</p>
          <div class="lr-artifact-meta">
            ${item.author ? `<span><i class="bi bi-person me-1"></i>${esc(item.author)}</span>` : ""}
            ${item.date_of_creationpublication ? `<span><i class="bi bi-calendar3 me-1"></i>${fmtDate(item.date_of_creationpublication)}</span>` : ""}
          </div>
          ${viewBtn}
        </div>
      </div>
    </div>`;
};

const attachVideoHover = () => {
  document
    .querySelectorAll("#lr-artifact-grid .lr-artifact-card:not(.no-video)")
    .forEach((card) => {
      const videoUrl = card.dataset.video;
      if (!videoUrl) return;

      const thumb = card.querySelector(".lr-artifact-thumb");
      const fsBtn = card.querySelector(".lr-fs-btn");
      const playOverlay = card.querySelector(".lr-play-overlay");
      const isDrive = videoUrl.includes("drive.google.com");
      let iframeEl = null;
      let rafId = null;
      let mouseX = 0;
      let mouseY = 0;

      const onDocMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };

      let ytErrHandler = null;

      const removeVideo = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        document.removeEventListener("mousemove", onDocMove);
        if (ytErrHandler) {
          window.removeEventListener("message", ytErrHandler);
          ytErrHandler = null;
        }
        if (iframeEl) {
          iframeEl.remove();
          iframeEl = null;
        }
        thumb.querySelector(".lr-iframe-capture")?.remove();
        thumb.querySelector(".lr-embed-error")?.remove();
        if (playOverlay) playOverlay.style.display = "";
      };

      const attachYouTubeErrorHandler = (originalUrl) => {
        ytErrHandler = (event) => {
          if (!event.origin.includes("youtube.com")) return;
          try {
            const data = JSON.parse(event.data);
            // Error codes 100=not found, 101/150/153=embedding disabled
            if (data.event === "onError") {
              window.removeEventListener("message", ytErrHandler);
              ytErrHandler = null;
              if (iframeEl) {
                iframeEl.remove();
                iframeEl = null;
              }
              thumb.querySelector(".lr-iframe-capture")?.remove();
              if (playOverlay) playOverlay.style.display = "none";
              const errEl = document.createElement("div");
              errEl.className = "lr-embed-error";
              errEl.innerHTML = `
              <i class="bi bi-exclamation-circle"></i>
              <span>Video cannot be embedded</span>
              <a href="${esc(originalUrl)}" target="_blank" rel="noopener">
                Watch on YouTube <i class="bi bi-box-arrow-up-right"></i>
              </a>`;
              thumb.appendChild(errEl);
            }
          } catch (_) {}
        };
        window.addEventListener("message", ytErrHandler);
      };

      const checkBounds = () => {
        const r = card.getBoundingClientRect();
        if (
          mouseX < r.left ||
          mouseX > r.right ||
          mouseY < r.top ||
          mouseY > r.bottom
        ) {
          removeVideo();
        } else {
          rafId = requestAnimationFrame(checkBounds);
        }
      };

      const startTracking = (x, y) => {
        mouseX = x;
        mouseY = y;
        document.addEventListener("mousemove", onDocMove);
        rafId = requestAnimationFrame(checkBounds);
      };

      card.addEventListener("mouseenter", (e) => {
        if (iframeEl) return;
        if (playOverlay) playOverlay.style.display = "none";

        iframeEl = document.createElement("iframe");
        iframeEl.src = buildAutoplayUrl(videoUrl);
        iframeEl.frameBorder = "0";
        iframeEl.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
        iframeEl.allowFullscreen = true;
        iframeEl.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;border:0;z-index:5;";
        thumb.appendChild(iframeEl);

        if (isDrive) {
          // Drive: keep capture overlay for "Click to play"; switch to RAF after click
          const capture = document.createElement("div");
          capture.className = "lr-iframe-capture";
          capture.style.cssText = "position:absolute;inset:0;z-index:6;";
          capture.innerHTML = `<div class="lr-drive-hint">
          <i class="bi bi-play-circle-fill"></i>
          <span>Click to play</span>
        </div>`;
          capture.addEventListener(
            "click",
            (ev) => {
              ev.stopPropagation();
              capture.remove();
              iframeEl.style.pointerEvents = "auto";
              startTracking(ev.clientX, ev.clientY);
            },
            { once: true },
          );
          thumb.appendChild(capture);
        } else {
          // YouTube / Vimeo: no overlay so player controls work;
          // track mouse position via RAF to detect when cursor leaves card
          if (videoUrl.match(/youtube\.com|youtu\.be/)) {
            attachYouTubeErrorHandler(videoUrl);
          }
          startTracking(e.clientX, e.clientY);
        }
      });

      // Backup: fires when mouse leaves card normally (not via iframe steal)
      card.addEventListener("mouseleave", () => {
        if (!rafId) removeVideo();
      });

      fsBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (iframeEl?.requestFullscreen) iframeEl.requestFullscreen();
      });
    });
};

const renderPagination = (total, page, limit) => {
  const container = document.getElementById("lr-pagination");
  if (!container || total === 0) {
    if (container) container.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pageBtn = (p, label, disabled = false, active = false) =>
    `<li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
       <button class="page-link" data-page="${p}">${label}</button>
     </li>`;

  const pages = [];
  const delta = 2;

  pages.push(
    pageBtn(page - 1, '<i class="bi bi-chevron-left"></i>', page === 1),
  );

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(pageBtn(i, i, false, i === page));
    } else if (i === page - delta - 1 || i === page + delta + 1) {
      pages.push(
        `<li class="page-item disabled"><span class="page-link">…</span></li>`,
      );
    }
  }

  pages.push(
    pageBtn(
      page + 1,
      '<i class="bi bi-chevron-right"></i>',
      page === totalPages,
    ),
  );

  container.innerHTML = `
    <div class="lr-pagination-wrap">
      <span class="lr-page-info">Showing ${start}–${end} of ${total} resources</span>
      <ul class="pagination pagination-sm mb-0">${pages.join("")}</ul>
    </div>`;

  container.querySelectorAll(".page-link[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page);
      if (p < 1 || p > totalPages || p === currentPage) return;
      goToPage(p);
    });
  });
};

const renderGrid = (records) => {
  const grid = document.getElementById("lr-artifact-grid");
  const empty = document.getElementById("lr-empty");

  if (!records.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    document.getElementById("lr-pagination").innerHTML = "";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = records.map(buildArtifactCard).join("");
  attachVideoHover();
  renderPagination(totalRecords, currentPage, PAGE_SIZE);
};

const fetchPage = async (page) => {
  currentPage = page;
  showSkeletons();
  try {
    const params = { page, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;

    const res = await client.get("/get_learning_resource_data", params);
    const body = res?.message || {};

    totalRecords = body.total_records || 0;
    renderGrid(Array.isArray(body.data) ? body.data : []);
  } catch (err) {
    console.error("learning_resource fetch error:", err);
    renderGrid([]);
  }
};

const goToPage = (page) => {
  fetchPage(page);
  document
    .getElementById("lr-artifact-grid")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const fetchAndRender = () => fetchPage(1);

const initCategoryCards = () => {
  const container = document.getElementById("lr-category-cards");
  if (!container) return;

  container.innerHTML = CATEGORIES.map(
    (cat) => `
    <div class="col-lg-3 col-md-6">
      <div class="lr-cat-card" data-key="${esc(cat.key)}">
        <div class="lr-cat-icon-wrap" style="color:${cat.color};">
          <i class="bi ${esc(cat.icon)}"></i>
        </div>
        <h6>${esc(cat.label)}</h6>
        <p>${esc(cat.desc)}</p>
      </div>
    </div>`,
  ).join("");

  container.querySelectorAll(".lr-cat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.dataset.key;
      if (activeCategory === key) {
        activeCategory = null;
        card.classList.remove("active");
      } else {
        activeCategory = key;
        container
          .querySelectorAll(".lr-cat-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
      }
      fetchAndRender();
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initCategoryCards();
  fetchAndRender();
  loaded = true;

  const searchInput = document.getElementById("lr-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value;
        fetchAndRender();
      }, 400);
    });
  }

  document.getElementById("lr-reset-btn")?.addEventListener("click", () => {
    activeCategory = null;
    searchQuery = "";
    const si = document.getElementById("lr-search");
    if (si) si.value = "";
    document
      .querySelectorAll("#lr-category-cards .lr-cat-card")
      .forEach((c) => c.classList.remove("active"));
    fetchAndRender();
  });

  const tabBtn = document.getElementById("learning-resource-tab");
  if (tabBtn) {
    tabBtn.addEventListener("shown.bs.tab", () => {
      if (!loaded) fetchAndRender();
    });
  }
});
