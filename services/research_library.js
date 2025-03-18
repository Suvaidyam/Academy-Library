import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

export async function getLibraryList() {
    let frappe_client = new FrappeApiClient();

    try {
        let response = await frappe_client.get('/get_knowledge_artifact_list');
        let posts = response.message.artifacts;
        const internalArtifacts = posts.filter(artifact => artifact.artifact_source === "Internal");

        if (internalArtifacts.length > 0) {
            let template = document.getElementById("blog-template");
            let blogContainer = document.getElementById("blog-container");

            internalArtifacts.forEach(post => {
                if (post) {
                    let newCard = template.cloneNode(true);
                    newCard.classList.remove("d-none");
                    newCard.querySelector(".blog-img").src = post.thumbnail_image
                        ? ENV.API_BASE_URL + post.thumbnail_image
                        : "assets/img/blog/default.jpg";
                    newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                    newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                    newCard.querySelector(".post-author").textContent = post.internalauthor || "Unknown";
                    newCard.querySelector(".post-date").textContent = post.date_of_creationpublication || "No Date";
                    blogContainer.appendChild(newCard);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
}

