import { FrappeApiClient } from "../services/FrappeApiClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');

  if (!newsId) {
    console.error("No news ID found in URL");
    return;
  }

  try {
    let frappe_client = new FrappeApiClient();
    let response = await frappe_client.get('/get_news_list');
    // let response = await frappe_client.get(`/api/resource/News/${newsId}`);

    if (response && response.data) {
      populateNewsDetails(response.data);
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
  imgElement.src = news.image || '../assets/img/default-news.jpg';
  imgElement.alt = news.title;

  // Set Content
  const contentElement = document.querySelector('.content');
  contentElement.innerHTML = `<p>${news.description}</p>`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
