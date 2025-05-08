import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

// Globals for News and events Pagination
let allNewsData = [];
let newsPage = 0;

let allEventsData = [];
let eventsPage = 0;

const itemsPerPage = 10;

// -------- Get All News ----------
const get_all_news = async () => {
  let frappe_client = new FrappeApiClient();

  try {
    let response = await frappe_client.get('/get_news_list');
    console.log("get_news_list", response);

    allNewsData = response.message || [];
    renderNewsPage();
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

// -------- Format Date ----------
function formatDateForNews(dateStr) {
  const date = new Date(dateStr);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// -------- Truncate Text ----------
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength).trim();
  return `${truncated}... <span style="color: #8FBEDE; font-weight: 800;">More</span>`;
}

// -------- Render Paginated News ----------
const renderNewsPage = () => {
  const newsContainer = document.getElementById('news-container');
  const prevBtn = document.getElementById("news-prev-btn");
  const nextBtn = document.getElementById("news-next-btn");
  newsContainer.innerHTML = "";

  const start = newsPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentNews = allNewsData.slice(start, end);

  currentNews.forEach(item => {
    let news_date = formatDateForNews(item.datetime);
    let link = `news-details?id=${encodeURIComponent(item?.name)}`;
    let page = window.location.hash;
    if (page === '#services') {
      link = `/pages/news-details?id=${encodeURIComponent(item?.name)}`;
    }

    let card = `
      <div class="col-md-6 " data-aos="fade-up" data-aos-delay="100">
        <a href="${link}">
          <div class="row newsCard">
            <div class="col-md-4">
              <img src="${ENV.API_BASE_URL + item?.image}" class="img-fluid" alt="...">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="mb-2">${item?.title}</h5>
                <p class="card-text">${truncateText(item?.description, 80)}</p>
                <div class="post-meta">
                  <p class="post-date">
                    <time datetime="${item?.datetime}">${news_date}</time>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>`;
    newsContainer.insertAdjacentHTML("beforeend", card);
  });
  const totalPages = Math.ceil(allNewsData.length / itemsPerPage);
  prevBtn.disabled = newsPage === 0;
  nextBtn.disabled = newsPage >= totalPages - 1;
};

// -------- Get All Events ----------
const get_all_events = async () => {
  let frappe_client = new FrappeApiClient();
  try {
    let response = await frappe_client.get('/get_events_list');
    allEventsData = response.message || [];
    renderEventsPage();
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

// -------- Format Date for Events ----------
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} <span>${year}</span>`;
}

// -------- Set All Events ----------
const renderEventsPage = () => {
  const eventsContainer = document.getElementById('events-container');
  const prevBtn = document.getElementById("events-prev-btn");
  const nextBtn = document.getElementById("events-next-btn");
  eventsContainer.innerHTML = "";

  const start = eventsPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentEvents = allEventsData.slice(start, end);

  currentEvents.forEach(item => {
    let event_date = formatDate(item.datetime);
    const card = `
      <div class="col-md-6 eventscard" data-aos="fade-up" data-aos-delay="100">
        <div class="service-item d-flex position-relative h-100">
          <div class="evDate">
            <i class="bi bi-calendar2-check icon icons flex-shrink-0"></i>
            <p class="date">${event_date}</p>
          </div>
          <div>
            <h4 class="title"><a href="#" class="stretched-link">${item?.title}</a></h4>
            <p class="description">${truncateText(item?.description, 100)}</p>
          </div>
        </div>
      </div>`;
    eventsContainer.insertAdjacentHTML("beforeend", card);
  });
  const totalPages = Math.ceil(allEventsData.length / itemsPerPage);
  prevBtn.disabled = eventsPage === 0;
  nextBtn.disabled = eventsPage >= totalPages - 1;
};

// -------- Initialize on Page Load ----------
document.addEventListener("DOMContentLoaded", () => {
  // News Pagination
  document.getElementById("news-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.floor(allNewsData.length / itemsPerPage);
    if (newsPage < maxPage) {
      newsPage++;
      renderNewsPage();
    }
  });

  document.getElementById("news-prev-btn")?.addEventListener("click", () => {
    if (newsPage > 0) {
      newsPage--;
      renderNewsPage();
    }
  });

  // Events Pagination
  document.getElementById("events-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.floor(allEventsData.length / itemsPerPage);
    if (eventsPage < maxPage) {
      eventsPage++;
      renderEventsPage();
    }
  });

  document.getElementById("events-prev-btn")?.addEventListener("click", () => {
    if (eventsPage > 0) {
      eventsPage--;
      renderEventsPage();
    }
  });

  // Initial Data Load
  get_all_news();
  get_all_events();
});
