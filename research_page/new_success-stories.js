import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();

let all_success_stories_Data = [];
let success_story_Page = 0;

const itemsPerPage = 10;

// -------- Get All News ----------
const get_all_success_stories = async () => {

  try {
    let response = await frappe_client.get('/success_story_list');

    all_success_stories_Data = response.message || [];
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
  successContainer.innerHTML = "";

  const start = success_story_Page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentCase_study = all_success_stories_Data.slice(start, end)

  currentCase_study.forEach(item => {
    // let published_date = formatDate(item.published_date);
    let link = ` success-details?id=${encodeURIComponent(item?.name)}`;


    let cards = ` 
          <!-- Card with an image on left -->
          <div class="col-md-6 " data-aos="fade-up" data-aos-delay="100">
            <a href="${link}">
              <div class="row   successCard">
                <div class="col-md-4">
                  <img src="${ENV.API_BASE_URL + item?.cover_image}" class="img-fluid "  alt="...">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="mb-2">${item?.name1}</h5>

                    <p class="card-text">${truncateText(item?.introduction, 200)}</p>
                  </div>
                </div>


              </div>
            </a>
          </div>`
    successContainer.insertAdjacentHTML("beforeend", cards);
  });
}


// export function formatDate(dateStr) {
//     const date = new Date(dateStr);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', { month: 'short' });
//     const year = date.getFullYear();
//     return `${day} ${month} <span>${year}</span>`;
// }


document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("story-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.floor(all_success_stories_Data.length / itemsPerPage);
    if (success_story_Page < maxPage) {
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