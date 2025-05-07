import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

console.log("=====");


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storiesId = urlParams.get('id');
    console.log(storiesId);

    if (!storiesId) {
        console.error("No stories ID found in URL");
        return;
    }

    try {
        let frappe_client = new FrappeApiClient();
        let response = await frappe_client.get('/success_story_list');

        if (response && response.message) {
            const storiesList = response.message;
            const stories = storiesList.find(item => item.name === storiesId);
            console.log("stories", stories);
            

            const remaining_stories = storiesList.filter(item => item.name !== storiesId);
            console.log(remaining_stories);

            if (stories) {
                populatestoriesDetails(stories);
                set_remaining_stories(remaining_stories);
            } else {
                console.error("No matching stories found");
            }
        } else {
            console.error("No stories data found");
        }

    } catch (error) {
        console.error("Error fetching stories details:", error);
    }
});

function populatestoriesDetails(stories) {
    // Set Title
    const titleElement = document.querySelector('.title');
    titleElement.textContent = stories.name1;

    // Set Date
    // const dateElement = document.querySelector('.meta-top time');
    // const formattedDate = formatDate(stories.datetime);
    // dateElement.textContent = formattedDate;
    // dateElement.setAttribute('datetime', stories.datetime);

    // Set Image
    const imgElement = document.querySelector('.post-img img');
    imgElement.src = ENV.API_BASE_URL + stories.cover_image  || '../assets/img/default-stories.jpg';
    imgElement.alt = stories.title;

    // Set Content
    const contentElement = document.querySelector('.content');
    contentElement.innerHTML = `<p>${stories?.introduction}</p>`;
}




function set_remaining_stories(remaining_stories) {
    if (remaining_stories && remaining_stories.length > 0) {
        const remaining_stories_container = document.getElementById('remaining_stories');
        remaining_stories_container.innerHTML = ""; // Clear existing content

        remaining_stories.forEach(item => {
            const postItem = document.createElement('div');
            postItem.classList.add('post-item');

            // Set default image if item.image is not provided
            const imageUrl = item.cover_image  ? `${ENV.API_BASE_URL}${item.cover_image }` : '../assets/img/default-stories.jpg';

            postItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.name1}" class="flex-shrink-0">
        <div>
          <h4><a href="success-details?id=${encodeURIComponent(item.name)}">${item.name1}</a></h4>
        </div>
      `;

            remaining_stories_container.appendChild(postItem);
        });
    }
}
