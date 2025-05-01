import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

// -------- Get All News ----------
const get_all_news = async () => {
  let frappe_client = new FrappeApiClient();

  try {
    let response = await frappe_client.get('/get_news_list');
    console.log("get_news_list", response);

    set_all_news(response);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

function formatDateForNews(dateStr) {
  const date = new Date(dateStr);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

function truncateText(text, maxLength) {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength).trim();
  return `${truncated}... <span style="color: #8FBEDE; font-weight: 800;">More</span>`;
}



// -------- Set All News ----------
const set_all_news = (response) => {
  if (response) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = "";

    response.message.forEach(item => {
      let news_date = formatDateForNews(item.datetime);

      let cards = ` 
          <!-- Card with an image on left -->
          <div class="col-md-6 " data-aos="fade-up" data-aos-delay="100">
            <a href="news-details.html?id=${encodeURIComponent(item?.name)}">
              <div class="row   newsCard ">
                <div class="col-md-4">
                  <img src="${ENV.API_BASE_URL + item?.image}" class="img-fluid " alt="...">
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
          </div>`
      newsContainer.insertAdjacentHTML("beforeend", cards);
    });
  }
};







const get_all_events = async () => {
  let frappe_client = new FrappeApiClient();

  try {
    let response = await frappe_client.get('/get_events_list')
    // console.log("get_events_list is called", response);
    set_all_events(response)

  } catch (error) {

  }
}
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} <span>${year}</span>`;
}


const set_all_events = (response) => {
  if (response) {
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = ""


    response.message.forEach(item => {

      let event_date = formatDate(item.datetime)
      // console.log("formatDate(item.starts_on)",event_date);



      const card = `<div class="col-md-6  eventscard" data-aos="fade-up" data-aos-delay="100">
              <div class="service-item d-flex position-relative h-100">
                <div class="evDate">
                  <i class="bi bi-calendar2-check icon icons flex-shrink-0"></i>
                  <p class="date"> ${event_date}</p>
                </div>
                <div>
                  <h4 class="title"><a href="#" class="stretched-link">${item?.title}</a></h4>
                  <p class="description">${truncateText(item?.description, 100)}</p>
                </div>
              </div>
            </div><!-- End Service Item -->`
      eventsContainer.insertAdjacentHTML("beforeend", card)

    });

  }

}

window.addEventListener("DOMContentLoaded", () => {
  get_all_events();
  get_all_news();

})