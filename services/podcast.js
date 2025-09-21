import { FrappeApiClient } from "../services/FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

const page_length = 3;

const fetch_podcast_lists = async (currentPage = 1) => {
  let response = await frappe_client.get("/get_podcast_data", {
    page_length: page_length,
    page: currentPage,
  });
  console.log(response, "response");
  render_podcast_lists(response);
  updatePaginationButtons(response?.message?.page, response?.message?.total, response?.message?.page_length);
};
const trimWords = (text, wordLimit = 7) => {
  if (!text) return "";
  let words = text.split(/\s+/).slice(0, wordLimit);
  return words.join(" ") + (words.length >= wordLimit ? "..." : "");
};

let currentPage = 1;
let prev_btn = document.getElementById("prev-btn");
let next_btn = document.getElementById("next-btn");

next_btn.addEventListener("click", () => {
  currentPage++;
  fetch_podcast_lists(currentPage);
});

prev_btn.addEventListener("click", () => {
  currentPage--;
  fetch_podcast_lists(currentPage);
});

// Update button states after fetching data
const updatePaginationButtons = (page, total, page_length) => {
  prev_btn.disabled = page <= 1;
  next_btn.disabled = page * page_length >= total;
};

// Modify fetch_podcast_lists to update buttons
// const fetch_podcast_lists = async (currentPage = 1) => {
//     let response = await frappe_client.get('/get_podcast_data', {
//         page_length: 4,
//         page: currentPage
//     });
//     console.log(response, "response");
//     render_podcast_lists(response);
//     // Update button states
//     updatePaginationButtons(
//         response.message.page,
//         response.message.total,
//         response.message.page_length
//     );
// };

const render_podcast_lists = (response) => {
  let podcast_container = document.getElementById("podcast_container");
  let popular_podcast = document.getElementById("popular_podcast");

  // Clear containers first
  podcast_container.innerHTML = "";
  popular_podcast.innerHTML = "";

  response.message.data.forEach((podcast, index) => {
    const hasEpisodes = podcast?.episode_cout > 0;

    let linkStart = hasEpisodes ? `<a href="podcast-details?id=${podcast.name}" class="text-decoration-none text-dark">` : `<div class="text-muted">`;

    let playOrNoEpisode = hasEpisodes
      ? `<span class="btn btn-success rounded-pill text-white py-1 px-4">
                <i class="bi bi-collection-play-fill"></i> Play all
           </span>`
      : `<span class="btn disabled btn-success rounded-pill text-white py-1 px-4">
                <i class="bi bi-collection-play-fill"></i> Play all
           </span>`;

    let podcast_card = `
            
            <div class="col-md-4 col-lg-4 col-xl-3 wow fadeInUp pt-2" data-wow-delay="0.1s">
            <div class="event-item rounded">
                ${linkStart}
                <div class="position-relative">
                    <img src="${frappe_client?.baseURL}${podcast?.cover_image}" class="rounded-t md:h-[200px] w-full h-[250px] object-cover" alt="Image">
                    <div class="d-flex justify-content-between border-start border-end bg-white px-2 py-2 w-100 position-absolute" style="bottom: 0; left: 0; opacity: 0.8;">
                    <span class="bi bi-broadcast-pin pr-1"> ${podcast?.episode_cout || "0"} episodes</span>
                    </div>
                </div>
                <div class="border border-top-0 rounded-bottom p-3">
                    <span class="h6 mb-2 d-block">${podcast?.title}</span>
                    <p class="mb-3">${trimWords(podcast?.description)}</p>
                    ${playOrNoEpisode}
                    
                    
                </div>
                </a>
            </div>
            </div>`;

    // Render to main list
    podcast_container.insertAdjacentHTML("beforeend", podcast_card);

    // Only first few (e.g., top 4) to popular
    popular_podcast.insertAdjacentHTML("beforeend", podcast_card);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  fetch_podcast_lists();
});

let preview_podcast_card = `<div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.7s">
                            <div class="w-full p-2">
                                <div class="bg-white rounded shadow overflow-hidden">
                                    <div
                                        class="relative w-full h-[150px] md:h-[200px] object-cover rounded-t bg-gray-100">
                                        <div class="absolute bottom-1 bg-gray-200 w-full h-8"></div>
                                    </div>
                                    <div class="border-t border-gray-200 p-4">
                                        <h3 class="text-lg font-semibold mb-2 bg-gray-100 h-6"></h3>
                                        <div class="bg-gray-100 h-6 w-[100px] rounded"></div>
                                    </div>
                                </div>
                            </div>

                        </div>`;
