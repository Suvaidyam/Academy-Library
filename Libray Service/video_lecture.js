import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();
let all_video_lectures = [];


const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

let currentPage = 1;
const pageSize = 8;
let totalPages = 1;

const updatePaginationButtons = () => {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
};

prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) get_all_video_lectures(currentPage - 1);
});
nextBtn?.addEventListener("click", () => {
  if (currentPage < totalPages) get_all_video_lectures(currentPage + 1);
});
const get_all_video_lectures = async (page = 1) => {
  try {
    let response = await frappe_client.get("/get_knowledge_artificates", {
      category: "Video Lecture",
      page_size: pageSize,
      page: page
    });

    all_video_lectures = response.message.data || [];
    totalPages = response.message.total_pages || 1;
    currentPage = response.message.page || 1;
    renderSuccess_story_Page(all_video_lectures);
    updatePaginationButtons();
  } catch (error) {
    console.error("Error fetching video lectures:", error);
  }
};
function getYouTubeVideoID(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/);
  return match ? match[1] : null;
}

const renderSuccess_story_Page = (response) => {
  let video_session = document.getElementById("video-container");
  video_session.innerHTML = "";

  response.forEach((item, index) => {
    const videoSrc = ENV.API_BASE_URL + item?.attachment;
    const thumbanailSrc = item?.thumbnail_image || "../assets/img/1hero-bg.jpg";
    const videoId = getYouTubeVideoID(videoSrc) || "hbs9j9Y7wcw"; // Default ID if not found


    let a = '../assets/img/gallery/Play-btn.jpeg'

    let Videocard = `
      <div class="col-lg-3  rounded-2">
        <div class="card shadow-sm video-card" data-video-src="${videoSrc}" data-index="${index}">
          <img src="${thumbanailSrc}" alt="Video" class="w-100 rounded">
              <i data-video-src="${videoSrc}" class="video-card fa-solid fa-play position-absolute  start-50 translate-middle text-white bg-dark p-lg-3 p-sm-4 rounded-circle" style="font-size: 24px; top:40%; cursor: pointer;"></i>

          <h5 class="p-2">${item?.a_short_description_about_the_artifact}</h5>
        </div>
      </div>
    `;
    const YoutubeCard = `
  <div class="col-lg-3">
  <div class="card shadow-sm cursor-pointer  position-relative" data-video-id="${videoId}">
    <img src="https://img.youtube.com/vi/${videoId}/0.jpg" class="card-img-top" alt="Video Thumbnail">

    <!-- Overlay Play Icon -->
    <i data-video-id="${videoId}" class="youtube-card fa-solid fa-play position-absolute  start-50 translate-middle  top-lg-30 top-md-40 text-white bg-dark p-lg-3 p-sm-4 rounded-circle" style="font-size: 24px;  cursor: pointer;"></i>

    <div class="card-body">
      <h5 class="p-2">
        ${item?.a_short_description_about_the_artifact?.length > 40
          ? item.a_short_description_about_the_artifact.slice(0, 45) + " ......."
          : item.a_short_description_about_the_artifact || ""}
      </h5>
    </div>
  </div>
</div>

`; 
if (item?.attachment && item.attachment.startsWith("https://")) {
      video_session.insertAdjacentHTML("beforeend", YoutubeCard);
    } else {
      video_session.insertAdjacentHTML("beforeend", Videocard);
    }
  });

  // Add event listeners to video cards
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const videoSrc = this.getAttribute('data-video-src');
      openVideoModal(videoSrc);
    });
  });

  document.addEventListener("click", function (e) {
    const card = e.target.closest(".youtube-card");
    if (card) {
      const videoId = card.dataset.videoId;
      openYouTubeModal(videoId);
    }
  });

  // Close modal on click
  // document.getElementById("closeModal").addEventListener("click", () => {
  //   const modal = document.getElementById("videoModal");
  //   modal.classList.remove("d-flex");
  //   modal.classList.add("d-none");
  //   document.getElementById("youtubeFrame").src = ""; // stop video
  // });

};
function openYouTubeModal(videoId) {
  const modal = document.getElementById("youtubeModal");
  const iframe = document.getElementById("youtubeFrame");

  // Set the YouTube embed URL with autoplay
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  // Show modal
  modal.classList.remove("d-none");
  modal.classList.add("d-flex");
}


function openVideoModal(src) {
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const modalSource = document.getElementById("modalSource");

  // Stop any currently playing videos
  document.querySelectorAll('video').forEach(video => {
    if (video !== modalVideo) {
      video.pause();
    }
  });

  modalSource.src = src;
  modalVideo.load();

  // Show modal with Bootstrap classes
  modal.classList.remove("d-none");
  modal.classList.add("d-flex");

  // Don't prevent background scrolling since we want the header visible
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");

  modalVideo.pause();
  modalVideo.currentTime = 0;
  modal.classList.add("d-none");
  modal.classList.remove("d-flex");
}
function closeYouTubeModal() {
  const youtubeModal = document.getElementById("youtubeModal");
  const youtubeFrame = document.getElementById("youtubeFrame");
  youtubeModal.classList.add("d-none");
  youtubeModal.classList.remove("d-flex");
  youtubeFrame.src = ""; // stop video
}

// Close modal event listeners
document.addEventListener('DOMContentLoaded', function () {
  const closeBtn = document.getElementById("closeVideoModel");
  const modal = document.getElementById("videoModal");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeVideoModal);
  }

  if (modal) {
    // Close when clicking outside the video
    modal.addEventListener("click", function (e) {
      closeYouTubeModal();
      if (e.target === modal) {
        closeVideoModal();
      }
    });
  }

  // Close with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById("videoModal");
      closeYouTubeModal();
      if (modal && !modal.classList.contains('d-none')) {
        closeVideoModal();
      }
    }
  });

  const closeYouTubeBtn = document.getElementById("closeYouTubeModal");
  const youtubeModal = document.getElementById("youtubeModal");
  if (closeYouTubeBtn) {
    closeYouTubeBtn.addEventListener("click", function () {
      closeYouTubeModal();
    });
  }
});

// Make functions globally available
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;

get_all_video_lectures();