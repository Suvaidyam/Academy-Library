import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

let frappe_client = new FrappeApiClient();

// -------- Get All News ----------
const get_all_case_studies = async () => {

    try {
        let response = await frappe_client.get('/case_study_list');
        console.log("case_study_list", response);

        set_all_case_studies(response);
    } catch (error) {
        console.error('Error fetching case_studies:', error);
    }
};




// -------- Set All News ----------
const set_all_case_studies = (response) => {
    if (response) {
        const caseContainer = document.getElementById('case-container');
        caseContainer.innerHTML = "";

        response.message.forEach(item => {
            let published_date = formatDate(item.published_date);
            let link = ` new_case-studies?id=${encodeURIComponent(item?.title)}`;
            console.log("link", link);


            let cards = ` 
          <!-- Card with an image on left -->
          <div class="col-md-6 " data-aos="fade-up" data-aos-delay="100">
            <a href="${link}">
              <div class="row   caseCard">
                <div class="col-md-4">
                  <img src="${ENV.API_BASE_URL + item?.image}" class="img-fluid " alt="...">
                </div>
                <div class="col-md-8">
                  <div class="card-body">
                    <h5 class="mb-2">${item?.title}</h5>

                    <p class="card-text">${item?.introduction}</p>
                    <div class="post-meta">
                      <p class="post-date">
                        <time datetime="${item?.published_date}">${published_date}</time>
                      </p>
                    </div>
                  </div>
                </div>


              </div>
            </a>
          </div>`
            caseContainer.insertAdjacentHTML("beforeend", cards);
        });
    }
};


export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} <span>${year}</span>`;
}


document.addEventListener("DOMContentLoaded", async () => {
    get_all_case_studies();



})