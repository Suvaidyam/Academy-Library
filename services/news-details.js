import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

console.log("=====");


document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');
  console.log(newsId);

  if (!newsId) {
    console.error("No news ID found in URL");
    return;
  }

  try {
    let frappe_client = new FrappeApiClient();
    let response = await frappe_client.get('/get_news_list');

    if (response && response.message) {
      const newsList = response.message;
      const news = newsList.find(item => item.name === newsId);

      const remaining_news = newsList.filter(item => item.name !== newsId);
      console.log(remaining_news);

      if (news) {
        populateNewsDetails(news);
        set_remaining_news(remaining_news);
      } else {
        console.error("No matching news found");
      }
    } else {
      console.error("No news data found");
    }

  } catch (error) {
    console.error("Error fetching news details:", error);
  }
});

function populateNewsDetails(news) {
  // Set Title
  const titleElement = document.querySelector('.title');
  titleElement.textContent = news.title;

  // Set Date
  const dateElement = document.querySelector('.meta-top time');
  const formattedDate = formatDate(news.datetime);
  dateElement.textContent = formattedDate;
  dateElement.setAttribute('datetime', news.datetime);

  // Set Image
  const imgElement = document.querySelector('.post-img img');
  imgElement.src = ENV.API_BASE_URL + news.image || '../assets/img/default-news.jpg';
  imgElement.alt = news.title;

  // Set Content
  const contentElement = document.querySelector('.content');
  contentElement.innerHTML = `<p>${news?.description}</p>`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


function set_remaining_news(remaining_news) {
  if (remaining_news && remaining_news.length > 0 ) {
    const remaining_news_container = document.getElementById('remaining_news');
    remaining_news_container.innerHTML = ""; // Clear existing content

    remaining_news.forEach(item => {
      const postItem = document.createElement('div');
      postItem.classList.add('post-item');

      // Set default image if item.image is not provided
      const imageUrl = item.image ? `${ENV.API_BASE_URL}${item.image}` : '../assets/img/default-news.jpg';

      postItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.title}" class="flex-shrink-0">
        <div>
          <h4><a href="news-details?id=${encodeURIComponent(item.name)}">${item.title}</a></h4>
          <time datetime="${item.datetime}">${formatDate(item.datetime)}</time>
        </div>
      `;

      remaining_news_container.appendChild(postItem);
    });
  }
}
