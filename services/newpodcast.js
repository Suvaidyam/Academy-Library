// import { FrappeApiClient } from './FrappeApiClient.js';

// // Initialize API client
// const frappeClient = new FrappeApiClient();

// // Get navigation buttons
// const prevBtn = document.getElementById("news-prev-btn");
// const nextBtn = document.getElementById("news-next-btn");

// // Store podcast data and current page
// let podcastData = null;
// let currentPage = 1;

// // Helper to calculate slice indices for pagination
// function getPageIndices(page, itemsPerPage = 3) {
//   const start = (page - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   return { start, end };
// }

// // Render podcast cards for the current page
// function renderPodcastList(data, page = 1) {
//   const { start, end } = getPageIndices(page);
//   const events = data.message.all_events.slice(start, end);

//   const cardContainer = document.getElementById('card_container');
//   cardContainer.innerHTML = ''; // Clear previous cards

//   events.forEach(event => {
//     // Limit description to 30 words
//     let description = event.description || '';
// let words = description.split(/\s+/);
//     if (words.length > 30) {
//       description = words.slice(0, 30).join(' ') + '...';
//     }

//     // Create card HTML
//     const cardHtml = `
// <div class="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 rounded shadow-lg text-white"
//   style="background: linear-gradient(45deg, #f83600, #f9d423); margin-top: 20px;">
//   <div class="me-3 mb-3 mb-md-0">
//     <img src="${event.image || 'https://picsum.photos/200/300'}" alt="Episode Image" class="rounded" style="height: 100px;" />
//   </div>
//   <div class="flex-grow-1 me-3">
//     <h5 class="fw-bold">${event.title}</h5>
//     <p class="mb-2">${description}</p>
//     <div class="d-flex align-items-center flex-wrap gap-2 justify-content-center">
//       <span class="ms-3">${event.start}</span>
//       <a href="${event.url}" class="btn btn-dark btn-sm ms-3">Download</a>
//     </div>
//   </div>
//   <div class="d-none d-md-block">
//     <div class="rounded-circle border border-3 border-dark d-flex align-items-center justify-content-center"
//       style="width: 60px; height: 60px;">
//       <i class="bi bi-play-fill fs-3 text-dark"></i>
//     </div>
//   </div>
// </div>
//     `;
//     cardContainer.insertAdjacentHTML('beforeend', cardHtml);
//   });
// }

// // Button event listeners for pagination
// prevBtn.addEventListener("click", () => {
//   if (currentPage > 1) {
//     currentPage--;
//     renderPodcastList(podcastData, currentPage);
//   }
// });

// nextBtn.addEventListener("click", () => {
//   currentPage++;
//   renderPodcastList(podcastData, currentPage);
// });

// // Fetch data and render first page when DOM is ready
// document.addEventListener('DOMContentLoaded', async () => {
//   const response = await frappeClient.get('/get_calendar_events');
//   podcastData = response;
//   renderPodcastList(response, currentPage);
// });


import { FrappeApiClient } from './FrappeApiClient.js';


const card_container = document.getElementById("card_container")
const prevBtn = document.getElementById("news-prev-btn")
const nextBtn = document.getElementById("news-next-btn")
let data = []
let limitedWord = ''
let currentPage = 1
let itemsPerPage = 2

const wordLimit = (data) => {
  const words = data.split(/\s/)
  if (words && words.length >= 30) {
    limitedWord = words.slice(0, 30).join(" ") + "..."
    return limitedWord
  } else {
    return data
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--
    renderPodcastList()
    nextBtn.disabled = false
  } else {
    prevBtn.disabled = true
  }
})


nextBtn.addEventListener("click", () => {
  const maxPage = Math.ceil(data.length / itemsPerPage)
  if (currentPage < maxPage) {
    currentPage++
    renderPodcastList()
    prevBtn.disabled = false
  } else {
    nextBtn.disabled = true
  }
})

const getAPI = async () => {
  const frappeClient = new FrappeApiClient();

  const response = await frappeClient.get("/get_calendar_events")
  data = response.message.all_events
  return data
}

const showItemsPerPage = () => {
  let start = (currentPage - 1) * itemsPerPage
  let end = start + itemsPerPage
  return data.slice(start, end)
}

const renderPodcastList = async () => {
  showDummyCards()
  if (!data.length) {
    await getAPI()
  }
  const paginatedData = showItemsPerPage()
  card_container.innerHTML = ''
  paginatedData.forEach((obj, index) => {
    const description = wordLimit(obj.description)

    let row = `
      <div class="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 rounded shadow-lg text-white"
        style="background: linear-gradient(45deg, #f83600, #f9d423); margin-top: 20px;">
        <div class="me-3 mb-3 mb-md-0">
          <img src="${obj.image || `https://picsum.photos/200/30${index}`}" alt="Episode Image" class="rounded"
            style="height: 100px;" />
        </div>
        <div class="flex-grow-1 me-3">
          <h5 class="fw-bold">${obj.title}</h5>
          <p class="mb-2">${description || ''}</p>
          <div class="d-flex align-items-center flex-wrap gap-2 justify-content-center">
            <span class="ms-3">${obj.start}</span>
            <a href="${obj.url}" class="btn btn-dark btn-sm ms-3">Download</a>
          </div>
        </div>
        <div class="d-none d-md-block">
          <div class="rounded-circle border border-3 border-dark d-flex align-items-center justify-content-center"
            style="width: 60px; height: 60px;">
            <i class="bi bi-play-fill fs-3 text-dark"></i>
          </div>
        </div>
      </div>
    `;
    card_container.insertAdjacentHTML("beforeend", row)
  });
}


const showDummyCards = ()=>{
  card_container.innerHTML = ""

  for (let i = 0; i < itemsPerPage; i++) {
    let dummy = `
      <div class="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 rounded shadow-lg text-white"
        style="background: linear-gradient(45deg, #ccc, #eee); margin-top: 20px;">
        <div class="me-3 mb-3 mb-md-0">
          <div class="rounded" style="height: 100px; width: 100px; background-color: #ddd;"></div>
        </div>
        <div class="flex-grow-1 me-3">
          <div class="fw-bold mb-2" style="height: 20px; background-color: #ddd; width: 60%; border-radius: 4px;"></div>
          <div class="mb-2" style="height: 14px; background-color: #ccc; width: 90%; border-radius: 4px;"></div>
          <div class="mb-2" style="height: 14px; background-color: #ccc; width: 80%; border-radius: 4px;"></div>
          <div class="d-flex align-items-center gap-2 mt-2">
            <div style="height: 14px; background-color: #bbb; width: 80px; border-radius: 4px;"></div>
            <div style="height: 30px; width: 80px; background-color: #aaa; border-radius: 5px;"></div>
          </div>
        </div>
        <div class="d-none d-md-block">
          <div class="rounded-circle border border-3 d-flex align-items-center justify-content-center"
            style="width: 60px; height: 60px; background-color: #ddd;">
          </div>
        </div>
      </div>
    `;
    card_container.insertAdjacentHTML("beforeend", dummy)
  }
  
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderPodcastList()
})