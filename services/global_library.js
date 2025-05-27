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


// const activeTabText = activeTab ? activeTab. : null;

// console.log("Active Tab Text:", activeTabText); // e.g., "Subscribed" or "All General"


const frappe_client = new FrappeApiClient();
const pageSize = 4; // Number of items per page
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
    const artifacts = fullData

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

    // prevBtn.disabled = currentPage === 1;
    // nextBtn.disabled = currentPage >= Math.ceil(fullData.length / pageSize);
    updatePaginationButtons();
}




export async function getLibraryList(filter = {}) {
    loader.style.display = "block";
    // currentPage = 1; // reset to first page
    fullData = await fetchAllData(filter);
    loader.style.display = "none";
    displayArtifacts();
}

prevBtn.addEventListener("click", async () => {
    const activeTab = document.querySelector('.nav-link.active').innerHTML;

    if (currentPage > 1) {
        currentPage--;

        if (activeTab === "Subscribed") {
            const filter = {
                category: 'Global Resource',
                Subscribe: '1'
            };

            if (handlelanguageDropdown.value && handlelanguageDropdown.value !== "Language") {
                filter.language = handlelanguageDropdown.value;
            }

            await getLibraryList(filter);
        } else if (activeTab === "All") {
            const fullData = await fetchAllData({
                category: 'Global Resource',
                language: handlelanguageDropdown.value || undefined
            });

            SetAllTAbContainer(fullData);
        }

        updatePaginationButtons();
    }
});

nextBtn.addEventListener("click", async () => {
    const totalPages = Math.ceil(total_count / pageSize);
    const activeTab = document.querySelector('.nav-link.active').innerHTML;

    if (currentPage < totalPages) {
        currentPage++;

        if (activeTab === "Subscribed") {
            const filter = {
                category: 'Global Resource',
                Subscribe: '1'
            };

            if (handlelanguageDropdown.value && handlelanguageDropdown.value !== "Language") {
                filter.language = handlelanguageDropdown.value;
            }
            getLibraryList(filter);
            displayArtifacts();

            // await getLibraryList(filter);
        } else if (activeTab === "All") {
            const fullData = await fetchAllData({
                category: 'Global Resource',
                language: handlelanguageDropdown.value || undefined
            });

            SetAllTAbContainer(fullData);
        }

        updatePaginationButtons();
    }
});

// prevBtn.addEventListener("click", async() => {
//     const handlelanguageDropdown = document.getElementById('language-dropdown');
//     console.log("Language Dropdown Value:===========", handlelanguageDropdown.value);
//     updatePaginationButtons();
//     currentPage--;

//     if (currentPage > 1) {
//         fullData = await fetchAllData({ category: 'Global Resource' });
//         displayArtifacts();
//     }
// });

// nextBtn.addEventListener("click", async() => {
//     // const maxPage = Math.ceil(fullData.length / pageSize);
//     updatePaginationButtons();
//     currentPage++;
//     fullData = await fetchAllData({ category: 'Global Resource' });
//     displayArtifacts();
//     // if (currentPage < maxPage) {
//     //     displayArtifacts();
//     // }
// });


const AllprevBtn = document.getElementById("all-prev-btn");
const AllnextBtn = document.getElementById("all-next-btn");

function updatePaginationButtons() {
    const totalPages = Math.ceil(total_count / pageSize);
    AllprevBtn.disabled = currentPage === 1;
    AllnextBtn.disabled = currentPage >= totalPages;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}

AllprevBtn.addEventListener("click", async () => {
    const language = document.getElementById('language-dropdown').value;
    const keySearch = document.getElementById('tagsInput').value;

    currentPage--;

    const filter = { category: 'Global Resource' };
    if (keySearch) {
        console.log("Search Input Value:", keySearch);
        filter.keySearchInput = keySearch;
    } else {
        console.log("No Search Input Value");
    }

    if (language && language !== "Language") {
        filter.language = language;
    }

    console.log("Language Dropdown Value:", language);

    const data = await fetchAllData(filter);
    SetAllTAbContainer(data);
    updatePaginationButtons();
});

AllnextBtn.addEventListener("click", async () => {
    const language = document.getElementById('language-dropdown').value;
    const keySearch = document.getElementById('tagsInput').value;

    currentPage++;

    const filter = { category: 'Global Resource' };
    if (keySearch) {
        console.log("Search Input Value:", keySearch);
        filter.keySearchInput = keySearch;
    } else {
        console.log("No Search Input Value");
    }

    if (language && language !== "Language") {
        filter.language = language;
    }

    console.log("Language Dropdown Value:", language);

    const data = await fetchAllData(filter);
    SetAllTAbContainer(data);

    currentPage++;
    updatePaginationButtons();
});

AllTab.addEventListener("click", async () => {
    handleClearButton();
    currentPage = 1; // Reset to first page when switching to All tab

    const fullData = await fetchAllData({ category: 'Global Resource' });
    if (total_count) {
        console.log("Total count of Global Resources:", total_count);

    }
    SetAllTAbContainer(fullData);
    console.log("fullData", fullData);
    updatePaginationButtons();
    handTabBtn();

});
const handTabBtn = () => {
    const tabButtons = document.querySelectorAll('.nav-link');

    tabButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.disabled = true; // Disable the active tab
            console.log("Active Tab:", btn.textContent.trim());
        } else {
            btn.disabled = false; // Enable the inactive tab
        }
    });
};


const SetAllTAbContainer = (fullData) => {
    const template = document.getElementById("general-template");
    template.innerHTML = ""; // Clear previous content
    fullData.forEach(element => {
        let card = `
            <div class="col-lg-6 mb-4">
                <div class="card shadow-sm rounded-4 overflow-hidden">
                <img src="${ENV.API_BASE_URL + (element.thumbnail_image || '')}" alt="" class="card-img-top blog-img" style="height: 200px; object-fit: cover;">

                <div class="card-body">
                    <p class="post-category text-muted mb-1" style="font-size: 0.9rem;">${element.category || 'Global Resource'}</p>

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
    handleClearButton();
    currentPage = 1; // Reset to first page when switching to Subscribed tab
    getLibraryList({ category: 'Global Resource', Subscribe: '1' });
    handTabBtn();

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
    // console.log("Active Tab Text:", activeTabText); // e.g., "Subscribed" or "All General"

    const activeTab = document.querySelector('.nav-link.active').innerHTML;

    if (activeTab === "Subscribed") {
        if (selectedLanguage) {
            const filter = { language: selectedLanguage, category: 'Global Resource' };
            if (activeTab === "Subscribed") {
                filter.Subscribe = '1';
            }
            console.log("Active Tab ID:", activeTabId);
            await getLibraryList(filter);
        } else {
            await getLibraryList({ category: 'Global Resource' });
        }
    } else if (activeTab === "All") {
        const fullData = await fetchAllData({ category: 'Global Resource', language: selectedLanguage });
        SetAllTAbContainer(fullData);
    }
});


const clearbtn = document.getElementById('clearbtn');

const handleClearButton = async () => {
    handlelanguageDropdown.value = ''; // Reset the dropdown
    searchInput.value = ''; // Clear the search input
    handlelanguageDropdown.selectedIndex = 0; // Reset to the first option
    console.log("Cleared Language Filter");
    await getLibraryList({ category: 'Global Resource' }); // Fetch without language filter
}

clearbtn.addEventListener('click', () => {
    handleClearButton();
}
);

const searchInput = document.getElementById('tagsInput');
searchInput.addEventListener('input', async (event) => {
    const activeTab = document.querySelector('.nav-link.active').innerHTML;
    // console.log(activeTab);
    const handlelanguageDropdown = document.getElementById('language-dropdown');

    const searchTerm = event.target.value.trim();
    if (activeTab === "Subscribed") {
        console.log("Search Term:", searchTerm);
        if (searchTerm) {
            const filter = { category: 'Global Resource', keySearchInput: searchTerm , Subscribe: '1' };

            if (handlelanguageDropdown.value != "Language") {
                filter.language = handlelanguageDropdown.value;
            }
            console.log('Filter:', filter);

            await getLibraryList(filter);
        } else {
            await getLibraryList({ category: 'Global Resource' });
        }
    }
    else if (activeTab === "All") {
        const filter = { category: 'Global Resource', keySearchInput: searchTerm };
        if (handlelanguageDropdown.value != "Language") {
            filter.language = handlelanguageDropdown.value;
        }
        console.log('Filter:', filter);
        SetAllTAbContainer(await fetchAllData(filter));
        updatePaginationButtons();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    getLibraryList({ category: 'Global Resource', Subscribe: '1' });
    getLanguageList();
});
