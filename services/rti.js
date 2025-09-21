import { FrappeApiClient } from "./FrappeApiClient.js";
const frappe_client = new FrappeApiClient();

let page = 1;
let rowPerPage = 3;
let totalRow;

const linkParent = document.querySelector("#linkParent");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const updatePageCount = document.querySelector("#updatePageCount");

// Fetch and render data
async function getLimitedData(page, rowPerPage) {
  try {
    let response = await frappe_client.get(`/rti-data?page=${page}&rowPerPage=${rowPerPage}`);
    let data = response.message.data;
    totalRow = response.message.totalRow;

    // Clear existing links
    linkParent.innerHTML = "";

    data.forEach((item) => {
      let src = item.attachment.includes("http") ? item.attachment : `${frappe_client.baseURL}${encodeURI(item.attachment)}`;

      let list = `<li class="list-group-item"><a target="_blank" href="${src}" style="width:100%; display: block;">${item.title}</a></li>`;
      linkParent.insertAdjacentHTML("beforeend", list);
    });

    // Disable prev button if on first page
    prevBtn.style.pointerEvents = page === 1 ? "none" : "auto";
    prevBtn.style.opacity = page === 1 ? "0.5" : "1";

    // Disable next button if no more data
    nextBtn.style.pointerEvents = totalRow / rowPerPage <= page ? "none" : "auto";
    nextBtn.style.opacity = totalRow / rowPerPage <= page ? "0.5" : "1";
  } catch (err) {
    console.error("API Error:", err);
  }
}

// Event listeners for pagination buttons
prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    getLimitedData(page, rowPerPage);
  }
});

nextBtn.addEventListener("click", () => {
  page++;
  getLimitedData(page, rowPerPage);
});

// Initial fetch
getLimitedData(page, rowPerPage);
