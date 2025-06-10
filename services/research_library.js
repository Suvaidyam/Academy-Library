import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

let blogContainer = document.getElementById("blog-container");
let article_temp = document.getElementById("article_temp");
let journal_temp = document.getElementById("journal_temp");
let case_studies_temp = document.getElementById("case_studies_temp");
let book_temp = document.getElementById("book_temp");

let allArtifacts = [];

let categoryDropdown = document.getElementById("category-dropdown");
let authorDropdown = document.getElementById("author-dropdown");
let languageDropdown = document.getElementById("language-dropdown");
let yearDropdown = document.getElementById("year-dropdown");
let belongToInput = document.getElementById("belongToInput");

const c_dropdown = document.getElementById('category-dropdown1');
let currentPage = 1;
const pageSize = 10;

export async function getLibraryList() {
    try {
        // ========== Fetch Knowledge Artifacts ==========
        let filter = {
            page: currentPage,
            page_size: pageSize,
        };
        filter["artifact_source"] = 'Internal'
        filter["category"] = 'Article'
        async function knowledge_data() {
            let response = await frappe_client.get('/get_knowledge_artificates', filter);
            let posts = response.message.data;
            return posts
        }

        if (!article_temp) {
            console.error("Template not found!");
            return;
        }
        if (!journal_temp) {
            console.error("Template not found!");
            return;
        }
        if (!case_studies_temp) {
            console.error("Template not found!");
            return;
        }
        if (!book_temp) {
            console.error("Template not found!");
            return;
        }

        // Initially display all internal artifacts with proper filtering
        async function show_data() {
            let artifacts = await knowledge_data();
            if (artifacts) {
                document.getElementById("loader").style.display = "none";
            }

            // Apply initial filtering based on selected category
            let selectedCategory = c_dropdown.value;
            let filteredArtifacts = artifacts;

            // Filter by category if one is selected and it's not the default option
            if (selectedCategory && selectedCategory !== "Select a Category") {
                filteredArtifacts = artifacts.filter(artifact =>
                    artifact.category === selectedCategory
                );
            }

            displayArtifacts(filteredArtifacts);
        }
        show_data()

        // ========== Fetch Categories for Dropdown ==========
        let fieldMetaParams = { doctype: "Knowledge Artifact", fieldname: "category" };
        let fieldMetaResponse = await frappe_client.get('/get_field_meta', fieldMetaParams);
        let fieldMetaData = fieldMetaResponse.message;

        if (fieldMetaData && fieldMetaData.length > 0) {
            categoryDropdown.innerHTML = `<option selected value=" ">Category</option>`;
            fieldMetaData.forEach(optionText => {
                categoryDropdown.innerHTML += `<option value="${optionText}">${optionText}</option>`;
            });
        }

        // ============== AuthorDropdown =================
        let AuthorResponse = await frappe_client.get('/get_link_filed',) || [];
        let dropdownOptionsauthor = `<option selected value="">Author</option>`;
        dropdownOptionsauthor += AuthorResponse.message?.emp?.map(item =>
            `<option value="${item.employee_id}">${item.employee_name}</option>`
        ).join('');
        authorDropdown.innerHTML = dropdownOptionsauthor;

        // ============== LanguageDropdown =================
        let fieldlinkResponse = await frappe_client.get('/get_link_filed') || [];
        let dropdownOptions = `<option selected value="">Language</option>`;
        dropdownOptions += fieldlinkResponse.message?.lang?.map(item =>
            `<option value="${item.language_id}">${item.language_name}</option>`
        ).join('');
        languageDropdown.innerHTML = dropdownOptions;

        // ============== TagsDropdown =================
        let fieldtagsResponse = await frappe_client.get('/get_link_filed') || [];
        const availableTags = fieldtagsResponse.message?.tag?.map(tag => tag.tag_name)

        // Initialize Tagify on input field
        const input = document.getElementById("tagsInput");
        new Tagify(input, {
            whitelist: availableTags,
            dropdown: {
                enabled: 0,
                closeOnSelect: false
            }
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayArtifacts(filteredArtifacts) {
    let cat = document.getElementById('category-dropdown1').value;
    console.log("cat", cat);
    blogContainer.innerHTML = ""; // Clear previous cards
    console.log("filteredArtifacts data", filteredArtifacts);

    // Handle case when no artifacts are provided or empty array
    if (!filteredArtifacts || filteredArtifacts.length === 0) {
        blogContainer.innerHTML = `
        <div class="no-results text-center border">
            <h4 class="mt-3">No results found</h4>
            <p class="text-muted">Try selecting a different category, author, or language.</p>
        </div>`;
        let Pagination = document.getElementById('pagination');
        Pagination.classList.add('d-none');
        return;
    } else {
        let Pagination = document.getElementById('pagination');
        Pagination.classList.remove('d-none');
    }


    // Filter artifacts based on selected category if not already filtered
    let artifactsToDisplay = filteredArtifacts;
    if (cat && cat !== "Select a Category") {
        artifactsToDisplay = filteredArtifacts.filter(artifact =>
            artifact.category === cat
        );
    }

    // If no artifacts match the category filter
    // if (artifactsToDisplay.length === 0) {
    //     // let Pagination = document.getElementById('pagination');
    //     // Pagination.classList.add('d-none');
    //     blogContainer.innerHTML = `
    //         <div class="no-results text-center">
    //             <h4 class="mt-3">No results found</h4>
    //             <p class="text-muted">No ${cat} artifacts found.</p>
    //         </div>`;
    //     return;
    // }

    if (cat == "Article") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = article_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

                newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".articles_pdf").href = `${ENV.API_BASE_URL}${post.attachment}` || "#";

                blogContainer.appendChild(newCard);
            }
        });
    } else if (cat == "Journal") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = journal_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

                newCard.querySelector(".journal_details").textContent = post.a_short_description_about_the_artifact || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".post-author").textContent = post.internalauthor_name.employee_name || "Unknown";
                newCard.querySelector(".post-date").textContent = post.date_of_creationpublication || "No Date";
                newCard.querySelector(".journals_pdf").href = `${ENV.API_BASE_URL}${post.attachment}` || "#";

                blogContainer.appendChild(newCard);
            }
        });
    } else if (cat == "Case Studies") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = case_studies_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");
                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";
                newCard.querySelector(".case_studies_details").textContent = post.a_short_description_about_the_artifact || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".case_studies_pdf").href = `${ENV.API_BASE_URL}${post.attachment}` || "#";

                blogContainer.appendChild(newCard);
            }
        });
    } else if (cat == "Book") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = book_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";
                newCard.querySelector(".book_details").textContent = post.a_short_description_about_the_artifact || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".post-author").textContent = post.internalauthor_name.employee_name || "Unknown";
                newCard.querySelector(".post-date").textContent = post.date_of_creationpublication || "No Date";
                newCard.querySelector(".books_pdf").href = `${ENV.API_BASE_URL}${post.attachment}` || "#";
                // test
                blogContainer.appendChild(newCard);
            }
        });
    } else {
        // If no specific category is selected or category doesn't match known types
        // Display all artifacts with a generic template (you can customize this)
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = article_temp.cloneNode(true); // Use article template as default
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

                newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                newCard.querySelector(".blog-title").textContent = post.title || "No Title";

                blogContainer.appendChild(newCard);
            }
        });
    }
}

// work on category dropdown
c_dropdown.addEventListener('change', async function () {
    let languageDropdown = document.getElementById('language-dropdown');
    let authorDropdown = document.getElementById('author-dropdown');
    let yearDropdown = document.getElementById('year-dropdown');
    let keySearchInput = document.getElementById('tagsInput');

    const filter = {
        page: currentPage,
        page_size: pageSize,
        category: this.value,
        ...(languageDropdown.value && languageDropdown.value !== 'Select a Language' && { language: languageDropdown.value }),
        ...(authorDropdown.value && authorDropdown.value !== 'Select a Author' && { author: authorDropdown.value }),
        ...(yearDropdown.value && yearDropdown.value !== 'Select a Year' && { year: yearDropdown.value }),
        ...(keySearchInput.value && { keySearchInput: keySearchInput.value })
    };
    handletoshowbelongToInput(this.value);
    let response = await frappe_client.get('/get_knowledge_artificates', filter);

    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data)
});

const handletoshowbelongToInput = (cat) => {
    let BelongParentDiv = belongToInput.parentElement.parentElement;

    if (cat === "Case Studies") {
        BelongParentDiv.classList.remove("d-none");
    } else {
        BelongParentDiv.classList.add("d-none");
    }
}

authorDropdown.addEventListener('change', async function () {
    const language = document.getElementById('language-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const year = document.getElementById('year-dropdown').value;
    const search = document.getElementById('tagsInput').value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        author: this.value,
        ...(search && { keySearchInput: search }),
        ...(year !== "Select a Year" && { year }),
        ...(language !== "Select a Language" && { language }),
        ...(category !== "Select a Category" && { category }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);

    console.log('Selected value:', this.value, category, response);
    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data);
});

const getAuthorList = async () => {

    let response = await frappe_client.get('/get_assigned_author');
    response.message.forEach(author => {
        let option = document.createElement('option');
        option.value = author.name;
        option.textContent = author.employee_name || author.name; // Fallback if `language_name` is missing
        authorDropdown.appendChild(option);
    });

}

let handlelanguageDropdown = document.getElementById('language-dropdown')
handlelanguageDropdown.addEventListener('change', async function () {
    const author = document.getElementById('author-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const year = document.getElementById('year-dropdown').value;
    const keySearch = document.getElementById('tagsInput').value;
    const language = this.value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(keySearch && { keySearchInput: keySearch }),
        ...(author !== "Select a Author" && { author }),
        ...(year !== "Select a Year" && { year }),
        ...(language && { language }),
        ...(category !== "Select a Category" && { category }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);

    console.log('Selected value:', language, category, response);
    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data);
});

// ========== Pagination Logic ==========
let pre_btn = document.getElementById('prev-btn')
let next_btn = document.getElementById('next-btn')

pre_btn.addEventListener("click", async function () {
    currentPage--;

    const language = languageDropdown.value;
    const category = c_dropdown.value;
    const year = document.getElementById('year-dropdown').value;
    const search = document.getElementById('tagsInput').value;
    const author = document.getElementById('author-dropdown').value;
    const belongTo = document.getElementById('belongToInput').value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(search && { keySearchInput: search }),
        ...(year !== "Select a Year" && { year }),
        ...(language !== "Select a Language" && { language }),
        ...(category !== "Select a Category" && { category }),
        ...(author !== "Select a Author" && { author }),
        ...(belongTo && { belong_to: belongTo }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    displayArtifacts(response.message.data);

    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = false;

    console.log('Previous Page:', category, currentPage);
});

next_btn.addEventListener("click", async function () {
    currentPage++;

    const language = languageDropdown.value;
    const category = c_dropdown.value;
    const year = document.getElementById('year-dropdown').value;
    const search = document.getElementById('tagsInput').value;
    const author = document.getElementById('author-dropdown').value;
    const belongTo = document.getElementById('belongToInput').value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(search && { keySearchInput: search }),
        ...(year !== "Select a Year" && { year }),
        ...(language !== "Select a Language" && { language }),
        ...(category !== "Select a Category" && { category }),
        ...(author !== "Select a Author" && { author }),
        ...(belongTo && { belong_to: belongTo }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    displayArtifacts(response.message.data);

    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);

    console.log('Next Page:', category, currentPage);
});

let handleclearbtn = document.getElementById('clearbtn')

handleclearbtn.addEventListener('click', () => {
    c_dropdown.selectedIndex = 0;
    languageDropdown.selectedIndex = 0;
    keysearchInput.value = '';
    authorDropdown.selectedIndex = 0;
    yearDropdown.selectedIndex = 0

    handletoshowbelongToInput(c_dropdown.value);
    belongToInput.value = '';



    getLibraryList();

}
)

const getLanguageList = async () => {
    const args = {
        doctype: 'Language',
        fields: ['name', 'language_name'],
        filters: JSON.stringify({ enabled: '1' })

    };



    let response = await frappe_client.get('/get_doctype_list', args);
    response.message.forEach(lang => {
        let option = document.createElement('option');
        option.value = lang.name;
        option.textContent = lang.language_name || lang.name; // Fallback if `language_name` is missing
        handlelanguageDropdown.appendChild(option);
    });

}

// Handle search from keywords
const keysearchInput = document.getElementById('tagsInput');

keysearchInput.addEventListener('input', async () => {
    const year = document.getElementById('year-dropdown').value;
    const author = document.getElementById('author-dropdown').value;
    const language = document.getElementById('language-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const search = keysearchInput.value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(search && { keySearchInput: search }),
        ...(language !== "Select a Language" && { language }),
        ...(category !== "Select a Category" && { category }),
        ...(author !== "Select a Author" && { author }),
        ...(year !== "Select a Year" && { year }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);

    displayArtifacts(response.message.data);
    console.log('Search Query:', search, response);
});

const GetSetYearOps = async () => {
    let yearDropdown = document.getElementById('year-dropdown');

    const args = {
        doctype: 'Knowledge Artifact',
        fields: ['date_of_creationpublication'],
        or_filters: JSON.stringify([
            { category: 'Article' },
            { category: 'Book' },
            { category: 'Journal' },
            { category: 'Case Studies' }
        ])
    };

    let response = await frappe_client.get('/get_doctype_list', args);
    console.log('Year response:', response);

    let addedYears = new Set();

    response.message.forEach(item => {
        if (item.date_of_creationpublication) {
            let year = item.date_of_creationpublication.slice(0, 4);
            addedYears.add(year);
        }
    });

    let sortedYears = Array.from(addedYears).sort();

    sortedYears.forEach(year => {
        let option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    });
};

yearDropdown.addEventListener('change', async function () {
    const author = document.getElementById('author-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const language = document.getElementById('language-dropdown').value;
    const search = document.getElementById('tagsInput').value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        year: this.value,
        ...(search && { keySearchInput: search }),
        ...(author !== "Select a Author" && { author }),
        ...(category !== "Select a Category" && { category }),
        ...(language !== "Select a Language" && { language }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);

    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data);
});

belongToInput.addEventListener('input', async function () {
    const category = document.getElementById('category-dropdown1').value;
    const author = document.getElementById('author-dropdown').value;
    const language = document.getElementById('language-dropdown').value;
    const year = document.getElementById('year-dropdown').value;
    const search = document.getElementById('tagsInput').value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        belongTo: this.value,
        ...(search && { keySearchInput: search }),
        ...(author !== "Select a Author" && { author }),
        ...(category !== "Select a Category" && { category }),
        ...(language !== "Select a Language" && { language }),
        ...(year !== "Select a Year" && { year }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);

    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data);
});

document.addEventListener("DOMContentLoaded", () => {
    getLibraryList();
    getLanguageList();
    getAuthorList();
    GetSetYearOps();
});

// Remove the standalone displayArtifacts() call at the end