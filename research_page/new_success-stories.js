import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();

let all_success_stories_Data = [];
let success_story_Page = 0;

const itemsPerPage = 10;
const paginationDiv=document.getElementById("pagination")


function handlePaginationVisibility(totalCount) {
    if (totalCount <= itemsPerPage) {
        paginationDiv.classList.add('d-none');
    } else {
        paginationDiv.classList.remove('d-none');
    }
}

// -------- Get All News ----------
const get_all_success_stories = async () => {

  try {
    let response = await frappe_client.get('/get_knowledge_artificates',{category:"Success Stories"});
    // let response = await frappe_client.get('/success_story_list');

    handlePaginationVisibility(response.message.data.length)

    all_success_stories_Data = response.message.data || [];
    renderSuccess_story_Page();
  } catch (error) {
    console.error('Error fetching success_stories:', error);
  }
};

function truncateText(text, maxLength) {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength).trim();
  return `${truncated}... <span style="color: #8FBEDE; font-weight: 800;">More</span>`;
}


// -------- Set All stories ----------
const renderSuccess_story_Page = () => {
  const successContainer = document.getElementById('success-container');
  const prevBtn = document.getElementById("story-prev-btn");
  const nextBtn = document.getElementById("story-next-btn");

  successContainer.innerHTML = "";
  if (all_success_stories_Data.length === 0) {
        successContainer.innerHTML = `
            <div class="col-12 text-center">
                <h1 class="text-muted">No results found.</h1>
            </div>`;
        paginationDiv.classList.add('d-none');
        return;
    }
  const start = success_story_Page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentCase_study = all_success_stories_Data.slice(start, end);

  currentCase_study.forEach(item => {
    let link = `success-details?id=${encodeURIComponent(item?.name)}`;

    let cardHTML = ` 
      <div class="col-md-6" data-aos="fade-up" data-aos-delay="100">
        <a href="${link}">
          <div class="row successCard">
            <div class="col-md-4">
              <img src="${ENV.API_BASE_URL + item?.thumbnail_image}" class="img-fluid" alt="...">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="mb-2">${item?.title}</h5>
                <p class="card-text">${truncateText(item?.a_short_description_about_the_artifact, 200)}</p>
              </div>
            </div>
          </div>
        </a>
      </div>`;
    
    successContainer.insertAdjacentHTML("beforeend", cardHTML);
  });

  // -------- Disable Prev/Next Buttons ----------
  const totalPages = Math.ceil(all_success_stories_Data.length / itemsPerPage);
  prevBtn.disabled = success_story_Page === 0;
  nextBtn.disabled = success_story_Page >= totalPages - 1;
};


// export function formatDate(dateStr) {
//     const date = new Date(dateStr);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', { month: 'short' });
//     const year = date.getFullYear();
//     return `${day} ${month} <span>${year}</span>`;
// }


document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("story-next-btn")?.addEventListener("click", () => {
    const maxPage =  Math.ceil(all_success_stories_Data.length / itemsPerPage);
    if (success_story_Page < maxPage - 1) {
      success_story_Page++;
      renderSuccess_story_Page();
    }
  });

  document.getElementById("story-prev-btn")?.addEventListener("click", () => {
    if (success_story_Page > 0) {
      success_story_Page--;
      renderSuccess_story_Page();
    }
  });

  get_all_success_stories();



})