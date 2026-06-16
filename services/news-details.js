import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");

  if (!newsId) {
    console.error("No news ID found in URL");
    hideSkeleton(); // skeleton hatao, empty content dikhao
    return;
  }

  try {
    let frappe_client = new FrappeApiClient();
    let response = await frappe_client.get("/get_news_list");

    if (response && response.message) {
      const newsList = response.message;
      const news = newsList.find((item) => item.name === newsId);
      const remaining_news = newsList.filter((item) => item.name !== newsId);

      if (news) {
        populateNewsDetails(news);
        set_remaining_news(remaining_news);
      }
    }
  } catch (error) {
    console.error("Error fetching news details:", error);
  } finally {
    hideSkeleton(); // hamesha skeleton hatao — success ya error dono mein
  }
});

// Skeleton hide, content show
function hideSkeleton() {
  const skeleton = document.getElementById("news-skeleton");
  const content = document.getElementById("news-content");
  const sidebarSkeleton = document.getElementById("sidebar-skeleton");

  if (skeleton) skeleton.style.display = "none";
  if (content) content.style.display = "block";
  if (sidebarSkeleton) sidebarSkeleton.style.display = "none";
}

function populateNewsDetails(news) {
  // Set Title
  const titleElement = document.querySelector(".title");
  titleElement.textContent = news.title;

  // Set Date
  const dateElement = document.querySelector(".meta-top time");
  const formattedDate = formatDate(news.datetime);
  dateElement.textContent = formattedDate;
  dateElement.setAttribute("datetime", news.datetime);

  // Set Image
  const imgElement = document.querySelector(".post-img img");
  imgElement.src =
    ENV.API_BASE_URL + news.image || "../assets/img/default-news.jpg";
  imgElement.alt = news.title;

  // Set Content
  const contentElement = document.querySelector(".content");
  contentElement.innerHTML = `<a href="${news?.news_link}" target="_blank">  <p>${news?.description}</p> </a>`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function set_remaining_news(remaining_news) {
  if (remaining_news && remaining_news.length > 0) {
    const remaining_news_container = document.getElementById("remaining_news");

    // ✅ Sirf skeleton clear karo, poora container nahi
    const sidebarSkeleton = document.getElementById("sidebar-skeleton");
    if (sidebarSkeleton) sidebarSkeleton.remove();

    // Sort by datetime (most recent first)
    remaining_news.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    // Limit to 5
    const recentNews = remaining_news.slice(0, 5);
    recentNews.forEach((item) => {
      const postItem = document.createElement("div");
      postItem.classList.add("post-item");
      const imageUrl = item.image
        ? `${ENV.API_BASE_URL}${item.image}`
        : "../assets/img/default-news.jpg";
      postItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.title}" class="flex-shrink-0">
        <div>
          <h4><a href="news-details.html?id=${encodeURIComponent(item.name)}">${item.title}</a></h4>
          <time datetime="${item.datetime}">${formatDate(item.datetime)}</time>
        </div>
      `;
      remaining_news_container.appendChild(postItem);
    });

    const seeMoreBtn = document.createElement("div");
    seeMoreBtn.classList.add("see-more-container");
    remaining_news_container.appendChild(seeMoreBtn);
  }
}
