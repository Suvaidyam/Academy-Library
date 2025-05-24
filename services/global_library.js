import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

const AllTab = document.getElementById("all-general-tab");
const SubscribedTab = document.getElementById("subscribed-tab");
const handlelanguageDropdown = document.getElementById('language-dropdown');

const blogContainer = document.getElementById("blog-container");
const template = document.getElementById("blog-template");
const prevBtn = document.getElementById("blog-prev-btn");
const nextBtn = document.getElementById("blog-next-btn");
const loader = document.getElementById("loader");

const frappe_client = new FrappeApiClient();
const pageSize = 4;
let currentPage = 1;
let fullData = [];
let total_count = "";


const activeTabId = "subscribed"; // Default active tab ID





async function fetchAllData(filter = {}) {
    try {
        const res = await frappe_client.get('/get_knowledge_artificates', {
            page_size: pageSize,
            page: currentPage,
            ...filter,
        });
        if (res.message) {
            total_count = res.message?.total_count || 0;
        }
        return res.message?.data || [];
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return [];
    }
}

function displayArtifacts() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
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

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= Math.ceil(fullData.length / pageSize);
}




export async function getLibraryList(filter = {}) {
    loader.style.display = "block";
    currentPage = 1; // reset to first page
    fullData = await fetchAllData(filter);
    loader.style.display = "none";
    displayArtifacts();
}

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayArtifacts();
    }
});

nextBtn.addEventListener("click", () => {
    const maxPage = Math.ceil(fullData.length / pageSize);
    if (currentPage < maxPage) {
        currentPage++;
        displayArtifacts();
    }
});

const AllprevBtn = document.getElementById("all-prev-btn");
const AllnextBtn = document.getElementById("all-next-btn");

function updatePaginationButtons() {
    const totalPages = Math.ceil(total_count / pageSize);
    AllprevBtn.disabled = currentPage === 1;
    AllnextBtn.disabled = currentPage >= totalPages;
}

AllprevBtn.addEventListener("click", async () => {
    currentPage--;
    const fullData = await fetchAllData({ category: 'Research Paper' });
    SetAllTAbContainer(fullData);
    updatePaginationButtons();


})
AllnextBtn.addEventListener("click", async () => {
    currentPage++;
    const fullData = await fetchAllData({ category: 'Research Paper' });
    SetAllTAbContainer(fullData);
    updatePaginationButtons();

})
AllTab.addEventListener("click", async () => {

    const fullData = await fetchAllData({ category: 'Research Paper' });
    if (total_count) {
        console.log("Total count of Research Papers:", total_count);

    }
    SetAllTAbContainer(fullData);
    console.log("fullData", fullData);
    updatePaginationButtons();
    setTimeout(() => {
        const activeTab = document.querySelector('.nav-link.active');
        console.log("Active Tab:", activeTab);
        activeTabId = activeTab?.id;
    }
        , 50) // e.g., "subscribed-tab" or "all-general-tab"




});

const SetAllTAbContainer = (fullData) => {
    const template = document.getElementById("general-template");
    template.innerHTML = ""; // Clear previous content
    fullData.forEach(element => {
        let card = `
            <div class="col-lg-6 mb-4">
                <div class="card shadow-sm rounded-4 overflow-hidden">
                <img src="${ENV.API_BASE_URL + (element.thumbnail_image || '')}" alt="" class="card-img-top blog-img" style="height: 200px; object-fit: cover;">

                <div class="card-body">
                    <p class="post-category text-muted mb-1" style="font-size: 0.9rem;">${element.category || 'Research Paper'}</p>

                    <h5 class="card-title blog-title mb-3" style="text-transform: capitalize;">
                    ${element.title || 'Untitled'}
                    </h5>

                    <div class="d-flex align-items-center mb-2">
                    <img src="../assets/img/blog/blog-author.jpg" alt="Author" class="rounded-circle me-2" width="40" height="40" style="object-fit: cover;">
                    <div>
                        <p class="mb-0 fw-bold post-author">${element.internalauthor || 'Unknown'}</p>
                        <p class="mb-0 text-muted post-date" style="font-size: 0.85rem;">
                        <time>${element.date_of_creationpublication || 'No Date'}</time>
                        </p>
                    </div>
                    </div>

                    ${element.resource_link
                ? `<a href="${element.resource_link}" target="_blank" class="btn btn-sm btn-outline-primary">View Resource</a>`
                : ''
            }
                </div>
                </div>
                     </div>
                    `;


        template.insertAdjacentHTML("beforeend", card);
    });
}

SubscribedTab.addEventListener("click", () => {
    getLibraryList({ category: 'Research Paper', Subscribe: '1' });
    
});

const getLanguageList = async () => {
    try {
        const args = {
            doctype: 'Language',
            fields: ['name', 'language_name'],
            filters: JSON.stringify({ enabled: '1' })
        };

        const response = await frappe_client.get('/get_doctype_list', args);

        response.message.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.name;
            option.textContent = lang.language_name || lang.name;
            handlelanguageDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching languages:", error);
    }
};







handlelanguageDropdown.addEventListener('change', async (event) => {
    const selectedLanguage = event.target.value;
    console.log("Selected Language:", selectedLanguage);
    if (selectedLanguage) {
        const filter = { language: selectedLanguage, category: 'Research Paper' };
        console.log("Active Tab ID:", activeTabId);
        await getLibraryList(filter);
    } else {
        await getLibraryList({ category: 'Research Paper' });
    }
});


const clearbtn = document.getElementById('clearbtn');

clearbtn.addEventListener('click', async () => {
    handlelanguageDropdown.value = ''; // Reset the dropdown
    searchInput.value = ''; // Clear the search input
    handlelanguageDropdown.selectedIndex = 0; // Reset to the first option
    console.log("Cleared Language Filter");
    await getLibraryList({ category: 'Research Paper' }); // Fetch without language filter
}
);

const searchInput = document.getElementById('tagsInput');
searchInput.addEventListener('input', async (event) => {
    const searchTerm = event.target.value.trim();
    console.log("Search Term:", searchTerm);
    if (searchTerm) {
        const filter = { search: searchTerm, category: 'Research Paper' ,keySearchInput: searchTerm};
        await getLibraryList(filter);
    } else {
        await getLibraryList({ category: 'Research Paper' });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    getLibraryList({ category: 'Research Paper', Subscribe: '1' });
    getLanguageList();
});
