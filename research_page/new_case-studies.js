import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();

let all_case_studies_Data = [];
let case_study_Page = 0;

const itemsPerPage = 10;

// -------- Get All News ----------
const get_all_case_studies = async () => {

  try {
    let response = await frappe_client.get('/case_study_list');

    all_case_studies_Data = response.message || [];
    renderCase_study_Page();
  } catch (error) {
    console.error('Error fetching case_studies:', error);
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

// -------- Set All cases ----------
const renderCase_study_Page = () => {
  const caseContainer = document.getElementById('case-container');
  const prevBtn = document.getElementById("case-prev-btn");
  const nextBtn = document.getElementById("case-next-btn");
  caseContainer.innerHTML = "";

  const start = case_study_Page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentCase_study = all_case_studies_Data.slice(start, end)

  currentCase_study.forEach(item => {
    let published_date = formatDate(item.published_date);
    let link = ` case-details?id=${encodeURIComponent(item?.name)}`;


    let cards = ` 
          <!-- Card with an image on left -->
          <div class="col-md-6 " data-aos="fade-up" data-aos-delay="100">
            <a href="${link}">
              <div class="row   caseCard">
                <div class="col-md-4">
                  <img src="${ENV.API_BASE_URL + item?.image}" class="img-fluid " alt="...">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="mb-2">${item?.title}</h5>

                    <p class="card-text">${truncateText(item?.introduction, 80)}</p>
                    <div class="post-meta">
                      <p class="post-date">
                        <time datetime="${item?.published_date}">${published_date}</time>
                      </p>
                    </div>
                  </div>
                </div>


              </div>
            </a>
          </div>`
    caseContainer.insertAdjacentHTML("beforeend", cards);
  });
  const totalPages = Math.ceil(all_case_studies_Data.length / itemsPerPage);
  prevBtn.disabled = case_study_Page === 0;
  nextBtn.disabled = case_study_Page >= totalPages - 1;
};



export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} <span>${year}</span>`;
}


document.addEventListener("DOMContentLoaded", async () => {

  document.getElementById("case-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.ceil(all_case_studies_Data.length / itemsPerPage);
    if (case_study_Page < maxPage - 1) {
      case_study_Page++;
      renderCase_study_Page();
    }
  });

  document.getElementById("case-prev-btn")?.addEventListener("click", () => {
    if (case_study_Page > 0) {
      case_study_Page--;
      renderCase_study_Page();
    }
  });

  get_all_case_studies();



})