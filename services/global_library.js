import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

export async function getLibraryList() {
    const frappe_client = new FrappeApiClient();

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let filter = { artifact_source: 'External' };

    try {
        const blogContainer = document.getElementById("blog-container");
        const template = document.getElementById("blog-template");
        const prevBtn = document.getElementById("blog-prev-btn");
        const nextBtn = document.getElementById("blog-next-btn");
        const loader = document.getElementById("loader");

        if (!template) {
            console.error("Template not found!");
            return;
        }

        let fullData = [];

        // Fetch full artifact list once
        async function fetchAllData() {
            const res = await frappe_client.get('/get_knowledge_artifact_list', filter);
            fullData = res.message?.artifacts || [];
        }

        // Display paginated data
        function displayArtifacts() {
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const artifacts = fullData.slice(start, end);

            blogContainer.innerHTML = "";

            if (!artifacts.length) {
                blogContainer.innerHTML = `<div class="no-results text-center"><h4>No results found</h4></div>`;
                return;
            }

            artifacts.forEach(post => {
                const newCard = template.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "";

                newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".post-author").textContent = post.internalauthor || "Unknown";
                newCard.querySelector(".post-date time").textContent = post.date_of_creationpublication || "No Date";

                blogContainer.appendChild(newCard);
            });

            // Pagination buttons
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage >= Math.ceil(fullData.length / ITEMS_PER_PAGE);
        }

        // Show loading and fetch-render
        async function showData() {
            loader.style.display = "block";
            await fetchAllData();
            loader.style.display = "none";
            displayArtifacts();
        }

        // Pagination events
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                displayArtifacts();
            }
        });

        nextBtn.addEventListener("click", () => {
            const maxPage = Math.ceil(fullData.length / ITEMS_PER_PAGE);
            if (currentPage < maxPage) {
                currentPage++;
                displayArtifacts();
            }
        });

        // Initial load
        showData();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getLibraryList();
});
