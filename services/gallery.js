import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

async function loadGallery() {
    const response = await frappe_client.get("/get_gallery_data");
    const data = response?.message || [];
    const container = document.querySelector(".isotope-container");
    container.innerHTML = "";

    const videoExtensions = ['mp4', 'mov', 'avi'];

    data.forEach(item => {
        const categoryClass = getCategoryClass(item.category);
        const fileUrl = item.gallery_doc ? `${ENV.API_BASE_URL}${item.gallery_doc}` : null;

        const isVideo = fileUrl && videoExtensions.some(ext => fileUrl.toLowerCase().endsWith(`.${ext}`));

        const imageUrl = isVideo
            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMyDStQ1o2FxORHUz0xasvfaEioX1QAF-3mQ&s"
            : (fileUrl );

        let cardHTML = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-${categoryClass}">
              <div class="portfolio-content h-100 position-relative">
                <img src="${imageUrl}" class="img-fluid rounded w-100 h-100" alt="">
                ${isVideo ? `<span class="position-absolute top-50 start-50 translate-middle text-white fs-2"><i class="bi bi-play-circle"></i></span>` : ""}
                <div class="portfolio-info">
                  <p>${item.title || "No Title"}</p>
                  ${!isVideo ? `<a href="${fileUrl}" title="${item.title || "Media"}" data-gallery="gallery-${categoryClass}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>` : `<a href="${fileUrl}" title="${item.title || "Media"}" data-gallery="gallery-${categoryClass}" class="glightbox preview-link"><i class="bi bi-play-circle"></i></a>`}
                </div>
              </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", cardHTML);
    });

    if (typeof GLightbox === 'function') {
        GLightbox({ selector: ".glightbox" });
    }
}




function getCategoryClass(category) {
  switch ((category || "").toLowerCase()) {
    case "campus":
      return "campus";
    case "visitors":
      return "visitors";
    case "farm models":
      return "farm_models"; // Match this exactly with HTML filter
    case "field visit":
      return "field_visit";
    case "classroom":
      return "classroom";
    case "field classes":
      return "field_classess"; // Be careful with spelling here
    case "labs":
      return "labs";
    default:
      return "";
  }
}



// Run after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    loadGallery().then(() => {
        // Initialize Isotope after the gallery is loaded
        initIsotope();
    });
});
function initIsotope() {
    let iso;
    // Ensure Isotope is loaded
    if (typeof Isotope === 'undefined') {
        console.error("Isotope is not loaded. Please ensure Isotope library is included.");
        return;
    }
    const container = document.querySelector('.isotope-container');
    if (container) {
        imagesLoaded(container, function () {
            iso = new Isotope(container, {
                itemSelector: '.portfolio-item',
                layoutMode: 'masonry'
            });
        });
    }
    document.querySelectorAll('.portfolio-filters li').forEach(button => {
        button.addEventListener('click', function () {
            const filterValue = this.getAttribute('data-filter');
            if (iso) {
                iso.arrange({ filter: filterValue });
            }
        });
    });
}
