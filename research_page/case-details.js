import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";



document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const casesId = urlParams.get('id');

    if (!casesId) {
        console.error("No cases ID found in URL");
        return;
    }

    try {
        let frappe_client = new FrappeApiClient();
        let response = await frappe_client.get('/case_study_list');

        if (response && response.message) {
            const caselist = response.message;
            const cases = caselist.find(item => item.name === casesId);
            

            const remaining_cases = caselist.filter(item => item.name !== casesId);

            if (cases) {
                populatecasesDetails(cases);
                set_remaining_cases(remaining_cases);
            } else {
                console.error("No matching cases found");
            }
        } else {
            console.error("No cases data found");
        }

    } catch (error) {
        console.error("Error fetching cases details:", error);
    }
});

function populatecasesDetails(cases) {
    // Set Title
    const titleElement = document.querySelector('.title');
    titleElement.textContent = cases.title;

    // Set Date
    const dateElement = document.querySelector('.meta-top time');
    const formattedDate = formatDate(cases.datetime);
    dateElement.textContent = formattedDate;
    dateElement.setAttribute('datetime', cases.datetime);

    // Set Image
    const imgElement = document.querySelector('.post-img img');
    imgElement.src = ENV.API_BASE_URL + cases.image  || '../assets/img/default-cases.jpg';
    imgElement.alt = cases.title;

    // Set Content
    const contentElement = document.querySelector('.content');
    contentElement.innerHTML = `<p>${cases?.introduction}</p>`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


function set_remaining_cases(remaining_cases) {
    if (remaining_cases && remaining_cases.length > 0) {
        const remaining_cases_container = document.getElementById('remaining_cases');
        remaining_cases_container.innerHTML = ""; // Clear existing content

        remaining_cases.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

        const recentCases = remaining_cases.slice(0, 5);



        recentCases.forEach(item => {
            const postItem = document.createElement('div');
            postItem.classList.add('post-item');

            // Set default image if item.image is not provided
            const imageUrl = item. image? `${ENV.API_BASE_URL}${item. image }` : '../assets/img/default-cases.jpg';

            postItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.title}" class="flex-shrink-0">
        <div>
          <h4><a href="case-details?id=${encodeURIComponent(item.name)}">${item.title}</a></h4>
          <time datetime="${item.published_date}">${formatDate(item.published_date)}</time>
        </div>
      `;

            remaining_cases_container.appendChild(postItem);
        });

        const seeMoreBtn = document.createElement('div');
        seeMoreBtn.classList.add('see-more-container');
        seeMoreBtn.innerHTML = `
            <a href="new_case-studies.html" class="see-more-button">See More</a>
        `;
        remaining_cases_container.appendChild(seeMoreBtn);
    }
}
