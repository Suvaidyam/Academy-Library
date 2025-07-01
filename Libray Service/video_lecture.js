import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();
let all_video_lectures = [];

const get_all_video_lectures = async () => {
  try {
    let response = await frappe_client.get("/get_knowledge_artificates", {
      category: "Video Lecture",
    });
    
    all_video_lectures = response.message.data || [];
    renderSuccess_story_Page(all_video_lectures);
  } catch (error) {
    console.error("Error fetching video lectures:", error);
  }
};

const renderSuccess_story_Page = (response) => {
  let video_session = document.getElementById("video-container");
  video_session.innerHTML = "";
  
  response.forEach((item, index) => {
    const videoSrc = ENV.API_BASE_URL+ item?.attachment;
    const thumbanailSrc = item?.thumbnail_image || "../assets/img/1hero-bg.jpg";
    
    let cardHTML = `
      <div class="col-lg-3 article-card rounded-2">
        <div class="cursor-pointer video-card" data-video-src="${videoSrc}" data-index="${index}">
          <img src="${thumbanailSrc}" alt="Video" class="w-100 rounded">
          <h5 class="p-2">${item?.a_short_description_about_the_artifact}</h5>
        </div>
      </div>
    `;
    video_session.insertAdjacentHTML("beforeend", cardHTML);
  });
  
  // Add event listeners to video cards
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const videoSrc = this.getAttribute('data-video-src');
      openVideoModal(videoSrc);
    });
  });
};

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

// Close modal event listeners
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("videoModal");
  
  if (closeBtn) {
    closeBtn.addEventListener("click", closeVideoModal);
  }
  
  if (modal) {
    // Close when clicking outside the video
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        closeVideoModal();
      }
    });
  }
  
  // Close with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById("videoModal");
      if (modal && !modal.classList.contains('d-none')) {
        closeVideoModal();
      }
    }
  });
});

// Make functions globally available
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;

get_all_video_lectures();