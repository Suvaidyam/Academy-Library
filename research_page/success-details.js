import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

console.log("=====");


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storiesId = urlParams.get('id');

    if (!storiesId) {
        console.error("No stories ID found in URL");
        return;
    }

    try {
        let frappe_client = new FrappeApiClient();
        let response = await frappe_client.get('/get_knowledge_artificates',{category:"Success Stories",page_size:4});


        if (response && response.message.data) {
            const storiesList = response.message.data;
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
    titleElement.textContent = stories.title;

    // Set Date
    // const dateElement = document.querySelector('.meta-top time');
    // const formattedDate = formatDate(stories.datetime);
    // dateElement.textContent = formattedDate;
    // dateElement.setAttribute('datetime', stories.datetime);

    // Set Image
    const imgElement = document.querySelector('.post-img img');
    imgElement.src = ENV.API_BASE_URL + stories.thumbnail_image || '../assets/img/default-stories.jpg';
    imgElement.alt = stories.title;


    // Set Content
    const contentElement = document.querySelector('.content');
    contentElement.innerHTML = `<p>${stories?.a_short_description_about_the_artifact}</p>`;

    const storyDetails = document.querySelector('.success_story_pdf');
    storyDetails.href = ENV.API_BASE_URL + stories.attachment;
}




function set_remaining_stories(remaining_stories) {
    if (remaining_stories && remaining_stories.length > 0) {
        const remaining_stories_container = document.getElementById('remaining_stories');
        remaining_stories_container.innerHTML = ""; // Clear existing content

        // Use top 5 items from already-ordered list
        const recentStories = remaining_stories.slice(0, 5);

        recentStories.forEach(item => {
            const postItem = document.createElement('div');
            postItem.classList.add('post-item');

            const imageUrl = item.cover_image ? `${ENV.API_BASE_URL}${item.thumbnail_image}` : '../assets/img/default-stories.jpg';

            postItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.name1}" class="flex-shrink-0">
                <div>
                    <h4><a href="success-details?id=${encodeURIComponent(item.name)}">${item.name1}</a></h4>
                </div>
            `;

            remaining_stories_container.appendChild(postItem);
        });

        // Add "See More" button
        const seeMoreBtn = document.createElement('div');
        seeMoreBtn.classList.add('see-more-container');
        seeMoreBtn.innerHTML = `
            <a href="new_success-stories.html" class="see-more-button">See More</a>
        `;
        remaining_stories_container.appendChild(seeMoreBtn);
    }
}

