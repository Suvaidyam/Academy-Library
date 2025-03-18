import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

export  async function  getLibraryList() { 
    let frappe_client = new FrappeApiClient();
    try {
        // ========== Fetch Knowledge Artifacts ==========
        let response = await frappe_client.get('/get_knowledge_artifact_list');
        let posts = response.message.artifacts;
        const internalArtifacts = posts.filter(artifact => artifact.artifact_source === "Internal");

        let blogContainer = document.getElementById("blog-container");
        let template = document.getElementById("blog-template");
        let categoryDropdown = document.getElementById("category-dropdown");
        let authorDropdown = document.getElementById("author-dropdown");
        let languageDropdown = document.getElementById("language-dropdown");
        let searchButton = document.getElementById("search-btn");
        let resetButton = document.getElementById("reset-btn"); // Reset button

        if (!template) {
            console.error("Template not found!");
            return;
        }

        function displayArtifacts(filteredArtifacts) {
            blogContainer.innerHTML = ""; // Clear previous cards

            if (filteredArtifacts.length === 0) {
                blogContainer.innerHTML = `
                    <div class="no-results text-center">
                        <h4 class="mt-3">No results found</h4>
                        <p class="text-muted">Try selecting a different category, author, or language.</p>
                    </div>`;
                return;
            }
            filteredArtifacts.forEach(post => {
                if (post) {
                    let newCard = template.cloneNode(true);
                    newCard.classList.remove("d-none");
                    newCard.removeAttribute("id"); // Remove duplicate IDs

                    newCard.querySelector(".blog-img").src = post.thumbnail_image
                        ? ENV.API_BASE_URL + post.thumbnail_image
                        : "assets/img/blog/default.jpg";

                    newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                    newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                    newCard.querySelector(".post-author").textContent = post.internalauthor || "Unknown";
                    newCard.querySelector(".post-date time").textContent = post.date_of_creationpublication || "No Date";

                    blogContainer.appendChild(newCard);
                }
            });
        }

        // Initially display all internal artifacts
        displayArtifacts(internalArtifacts);

        // ========== Fetch Categories for Dropdown ==========
        let fieldMetaParams = { doctype: "Knowledge Artifact", fieldname: "category" };
        let fieldMetaResponse = await frappe_client.get('/get_field_meta', fieldMetaParams);
        let fieldMetaData = fieldMetaResponse.message;
        // console.log(fieldMetaResponse)
        if (fieldMetaData && fieldMetaData.length > 0) {
            categoryDropdown.innerHTML = `<option selected value="">Category</option>`;
            fieldMetaData.forEach(optionText => {
                categoryDropdown.innerHTML += `<option value="${optionText}">${optionText}</option>`;
            });
        }

        // ============== AuthorDropdown =================
        let AuthorResponse = await frappe_client.get('/get_link_filed');
        let dropdownOptionsauthor = `<option selected value="">Author</option>`;
        dropdownOptionsauthor += AuthorResponse.message.map(item =>
            `<option value="${item.employee_name}">${item.employee_name}</option>`
        ).join('');
        authorDropdown.innerHTML = dropdownOptionsauthor;


        // ============== LanguageDropdown =================
        let fieldlinkResponse = await frappe_client.get('/get_link_filed');
        let dropdownOptions = `<option selected value="">Language</option>`;
        dropdownOptions += fieldlinkResponse.message.map(item =>
            `<option value="${item.language_name}">${item.language_name}</option>`
        ).join('');
        languageDropdown.innerHTML = dropdownOptions;

        // ========== Search Button Click Event ==========
        searchButton.addEventListener("click", () => {
            let selectedCategory = categoryDropdown.value;
            if (!selectedCategory) {
                alert("Please select a category!");
                return;
            }
            let filteredArtifacts = internalArtifacts.filter(post => post.category === selectedCategory);
            displayArtifacts(filteredArtifacts);
        });
        
        // ========== Reset Button Click Event ==========
        resetButton.addEventListener("click", () => {
            categoryDropdown.value = "";
            displayArtifacts(internalArtifacts); // Show all artifacts again
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

