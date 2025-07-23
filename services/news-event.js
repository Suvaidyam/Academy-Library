import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

// Globals for News and events Pagination
let allNewsData = [];
let newsPage = 0;

let allPastEvents = [];
let pastEventsPage = 0;

let allUpcomingEvents = [];
let upcomingEventsPage = 0;


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

  if(currentNews.length > 0){
    document.getElementById("n_pagination").style.display = 'block';
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
                <img src="${ENV.API_BASE_URL + item?.image}" class="img169" alt="...">
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
  }else {
    document.getElementById("n_pagination").style.display = 'none';
    const noDataMessage = `
      <div class="text-center py-5">
          <h4>No News Found !</h4>
      </div>`;
      newsContainer.insertAdjacentHTML("beforeend", noDataMessage);
    }
};

// -------- Get All Events ----------
const get_all_events = async () => {
  let frappe_client = new FrappeApiClient();
  try {
    let response = await frappe_client.get('/get_events_list');
    const allEvents = response.message || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time part

    allPastEvents = allEvents.filter(event => new Date(event.datetime) < today);
    allUpcomingEvents = allEvents.filter(event => new Date(event.datetime) >= today);

    renderPastEventsPage();
    renderUpcomingEventsPage();
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
const renderPastEventsPage = () => {
  const eventsContainer = document.getElementById('events-container');
  const prevBtn = document.getElementById("events-prev-btn");
  const nextBtn = document.getElementById("events-next-btn");
  eventsContainer.innerHTML = "";

  const start = pastEventsPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentEvents = allPastEvents.slice(start, end);

  if (currentEvents.length > 0) {
    document.getElementById("c_pagination").style.display = 'block';
    currentEvents.forEach(item => {
      let event_date = formatDate(item.datetime);
      const card = `
          <div class="col-md-12 " data-aos="fade-up" data-aos-delay="100">
          <a href="" onclick="return false;">
            <div class="row newsCard">
              <div class="col-md-2">
                <img src="${item.cover_image}" class=" img169 rounded-top " alt="Image">
              </div>
              <div class="col-md-10">
                <div class="card-body">
                  <h5 class="mb-2">${item.title}</h5>
                  <p class="card-text">${truncateText(item?.description, 300)}</p>
                  <div class="post-meta">
                    <p class="post-date">
                      <time datetime="${item?.datetime}">${event_date}</time>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>`;
      eventsContainer.insertAdjacentHTML("beforeend", card);
    });
  } else {
    document.getElementById("c_pagination").style.display = 'none';
    eventsContainer.innerHTML = `<div class="text-center py-5"><h4>No Past Events Found !</h4></div>`;
  }

  const totalPages = Math.ceil(allPastEvents.length / itemsPerPage);
  prevBtn.disabled = pastEventsPage === 0;
  nextBtn.disabled = pastEventsPage >= totalPages - 1;
};

// -------- Set Upcoming Events ----------
const renderUpcomingEventsPage = () => {
  const container = document.getElementById('upcoming_events-container');
  const prevBtn = document.getElementById("upcoming-prev-btn");
  const nextBtn = document.getElementById("upcoming-next-btn");

  container.innerHTML = "";

  const start = upcomingEventsPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentEvents = allUpcomingEvents.slice(start, end);

  if (currentEvents.length > 0) {
    document.getElementById("upcoming_pagination").style.display = 'block';

    currentEvents.forEach(item => {
      let event_date = formatDate(item.datetime);
      const card = `
        <div class="col-md-12 " data-aos="fade-up" data-aos-delay="100">
          <a href="" onclick="return false;">
            <div class="row newsCard">
              <div class="col-md-2">
                <img src="${item.cover_image}" class="rounded-top img169" alt="Image">
              </div>
              <div class="col-md-10">
                <div class="card-body">
                  <h5 class="mb-2">${item.title}</h5>
                  <p class="card-text">${truncateText(item?.description, 300)}</p>
                  <div class="post-meta">
                    <p class="post-date">
                      <time datetime="${item?.datetime}">${event_date}</time>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>`;
      container.insertAdjacentHTML("beforeend", card);
    });

    const totalPages = Math.ceil(allUpcomingEvents.length / itemsPerPage);
    prevBtn.disabled = upcomingEventsPage === 0;
    nextBtn.disabled = upcomingEventsPage >= totalPages - 1;

  } else {
    document.getElementById("upcoming_pagination").style.display = 'none';
    container.innerHTML = `<div class="text-center py-5"><h4>No Upcoming Events Found !</h4></div>`;
  }
};



// -------- Initialize on Page Load ----------
document.addEventListener("DOMContentLoaded", () => {
  // News
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

  // Events (Past)
  document.getElementById("events-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.floor(allPastEvents.length / itemsPerPage);
    if (pastEventsPage < maxPage) {
      pastEventsPage++;
      renderPastEventsPage();
    }
  });
  document.getElementById("events-prev-btn")?.addEventListener("click", () => {
    if (pastEventsPage > 0) {
      pastEventsPage--;
      renderPastEventsPage();
    }
  });

    // Upcoming Events Pagination
  document.getElementById("upcoming-next-btn")?.addEventListener("click", () => {
    const maxPage = Math.floor(allUpcomingEvents.length / itemsPerPage);
    if (upcomingEventsPage < maxPage) {
      upcomingEventsPage++;
      renderUpcomingEventsPage();
    }
  });

  document.getElementById("upcoming-prev-btn")?.addEventListener("click", () => {
    if (upcomingEventsPage > 0) {
      upcomingEventsPage--;
      renderUpcomingEventsPage();
    }
  });


  // Initial Load
  get_all_news();
  get_all_events();
});

