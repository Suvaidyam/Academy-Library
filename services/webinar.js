import { FrappeApiClient } from "../services/FrappeApiClient.js";

let frappe_client = new FrappeApiClient();
let nextbtn = document.getElementById("next-btn");
let prevbtn = document.getElementById("prev-btn");

let currentPage = 1;
const pageSize = 10;

const get_webinars = async (page = 1) => {
  try {
    const response = await frappe_client.get("/get_webinar_list", {
      page,
      page_size: pageSize
    });

    console.log("Webinars Response:", response);

    if (response?.message?.data) {
      renderWebinars(response.message.data);
      updatePaginationControls(
        parseInt(response.message.page),
        parseInt(response.message.total_pages)
      );
    }
  } catch (error) {
    console.error("Error fetching webinars:", error);
  }
};

const renderWebinars = (webinars = []) => {
  const webinarList = document.querySelector(".webinar-list");

  webinarList.innerHTML = ""; // Clear existing content

  if (webinars.length === 0) {
    webinarList.innerHTML = "<p>No webinars available at the moment.</p>";
    return;
  }

  webinars.forEach(webinar => {
    let dateObj = new Date(webinar.date_time);
    let day = dateObj.getDate();
    let month = dateObj.toLocaleString('default', { month: 'short' });
    let year = dateObj.getFullYear();
    let time = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let duration = webinar.duration ? webinar.duration / 3600 : 2;

    const webinarCard = `<li class="event-list-item">
      <div class="group-left">
        <div class="field field-name-date-square">
          <span class="month">${month}</span>
          <span class="date">${day}</span>
          <span class="time text-uppercase">${time}</span>
          <span class="duration">${duration} Hours</span>
        </div>
      </div>

      <div class="group-right">
        <div class="left">
          <div class="field field-name-title">
            <span class="card-media-body-heading">
              ${webinar.title}
            </span>
            <p>${webinar.key_learnings}</p>
          </div>
          <div class="d-flex align-items-center justify-content-between">
            <div class="field field-name-event-time">
              ${webinar.speakers}
            </div>
            <div class="p-2">
              <a href="/pages/webinar-registration?webinar_id=${encodeURIComponent(webinar.name)}"
                class="card-media-body-supporting-bottom-text btn btn-dark card-media-link u-float-right">
                Register Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>`;

    webinarList.insertAdjacentHTML("beforeend", webinarCard);
  });
};

nextbtn.addEventListener("click", () => {
  currentPage++;
  get_webinars(currentPage);
});

prevbtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    get_webinars(currentPage);
  }
});

const updatePaginationControls = (page, totalPages) => {
  nextbtn.disabled = page >= totalPages;
  prevbtn.disabled = page <= 1;
};

window.addEventListener("DOMContentLoaded", () => {
  get_webinars(currentPage);
});
