import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

let blogContainer = document.getElementById("blog-container");
let article_temp = document.getElementById("article_temp");
let journal_temp = document.getElementById("journal_temp");
let case_studies_temp = document.getElementById("case_studies_temp");
let book_temp = document.getElementById("book_temp");
let newsletter_temp = document.getElementById("newsletter_temp");

let allArtifacts = [];

let categoryDropdown = document.getElementById("category-dropdown");
let authorDropdown = document.getElementById("author-dropdown");
let languageDropdown = document.getElementById("language-dropdown");
let yearDropdown = document.getElementById("year-dropdown");
let belongToInput = document.getElementById("belongToInput");

const c_dropdown = document.getElementById('category-dropdown1');
let currentPage = 1;
const pageSize = 10;
let Pagination = document.getElementById('pagination');

// Helper function to handle pagination visibility
function handlePaginationVisibility(totalCount) {
    if (totalCount <= pageSize) {
        Pagination.classList.add('d-none');
    } else {
        Pagination.classList.remove('d-none');
    }
}

let authors = []

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
            let totalCount = response.message.total_count;
            authors = posts.map(item => ({ author: item.author }));
            console.log("authors", authors);
            next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
            handlePaginationVisibility(totalCount);
            GetSetAuthorOps(authors);

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
            if (selectedCategory && selectedCategory !== "Select Category") {
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
        return;
    }

    // Filter artifacts based on selected category if not already filtered
    let artifactsToDisplay = filteredArtifacts;
    if (cat && cat !== "Select Category") {
        artifactsToDisplay = filteredArtifacts.filter(artifact =>
            artifact.category === cat
        );
    }

    if (cat == "Article") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = article_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

                // newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
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

                blogContainer.appendChild(newCard);
            }
        });
    } else if (cat == "Newsletter") {
        artifactsToDisplay.forEach(post => {
            if (post) {
                let newCard = newsletter_temp.cloneNode(true);
                newCard.classList.remove("d-none");
                newCard.removeAttribute("id");

                newCard.querySelector(".blog-img").src = post.thumbnail_image
                    ? ENV.API_BASE_URL + post.thumbnail_image
                    : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

                newCard.querySelector(".newsletter_details").textContent = post.a_short_description_about_the_artifact || "Uncategorized";
                // newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                newCard.querySelector(".newsletter_pdf").href = `${ENV.API_BASE_URL}${post.attachment}` || "#";

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
    let authorInput = document.getElementById("belongToInput")

    setCategoryWiseBackgrounds(this.value);

    const filter = {
        page: currentPage,
        page_size: pageSize,
        category: this.value,
        ...(languageDropdown.value && languageDropdown.value !== 'Select Language' && { language: languageDropdown.value }),
        ...(authorDropdown.value && authorDropdown.value !== 'Select Author' && { authorDropdown: authorDropdown.value }),
        ...(yearDropdown.value && yearDropdown.value !== 'Select Year' && { year: yearDropdown.value }),
        ...(keySearchInput.value && { keySearchInput: keySearchInput.value }),
        ...(authorInput.value && { authorInput: authorInput.value })
    };

    // handletoshowbelongToInput(this.value);
    let response = await frappe_client.get('/get_knowledge_artificates', filter);
    authors = response.message.data.map(item => ({ author: item.author }));
    GetSetAuthorOps(authors);
    let totalCount = response.message.total_count;

    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);
    displayArtifacts(response.message.data);
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
        authorDropdown: this.value,
        ...(search && { keySearchInput: search }),
        ...(year !== "Select Year" && { year }),
        ...(language !== "Select Language" && { language }),
        ...(category !== "Select Category" && { category }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    console.log('Selected value:', this.value, category, response);
    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);
    displayArtifacts(response.message.data);
});


const GetSetAuthorOps = async (authors) => {
    console.log('Authors:', authors);

    if (!authorDropdown) return;
    authorDropdown.innerHTML = "<option selected disabled value=''>Select Author</option>";
    const uniqueAuthors = [...new Set(authors.map(item => item.author))];
    console.log('uniqueAuthors:', uniqueAuthors);
    if (uniqueAuthors.length === 0) {

        // const option = document.createElement('option');
        // option.value = "Select Author";
        console.log('No unique authors found.');

        return;

    } else {
        uniqueAuthors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorDropdown.appendChild(option);
        });
    }





};

let handlelanguageDropdown = document.getElementById('language-dropdown')
handlelanguageDropdown.addEventListener('change', async function () {
    const author = document.getElementById('author-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const year = document.getElementById('year-dropdown').value;
    const keySearch = document.getElementById('tagsInput').value;
    let authorInput = document.getElementById("belongToInput").value

    const language = this.value;

    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(keySearch && { keySearchInput: keySearch }),
        ...(authorInput && { authorInput: authorInput }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(year !== "Select Year" && { year }),
        ...(language && { language }),
        ...(category !== "Select Category" && { category }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    console.log('Selected value:', language, category, response);
    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);
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
        ...(year !== "Select Year" && { year }),
        ...(language !== "Select Language" && { language }),
        ...(category !== "Select Category" && { category }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(belongTo && { belong_to: belongTo }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    displayArtifacts(response.message.data);

    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);

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
        ...(year !== "Select Year" && { year }),
        ...(language !== "Select Language" && { language }),
        ...(category !== "Select Category" && { category }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(belongTo && { belong_to: belongTo }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    displayArtifacts(response.message.data);

    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);

    console.log('Next Page:', category, currentPage);
});

let handleclearbtn = document.getElementById('clearbtn')

handleclearbtn.addEventListener('click', () => {

    c_dropdown.selectedIndex = 0;
    languageDropdown.selectedIndex = 0;
    keysearchInput.value = '';
    authorDropdown.selectedIndex = 0;
    yearDropdown.selectedIndex = 0

    // handletoshowbelongToInput(c_dropdown.value);
    belongToInput.value = '';
    authors = []
    getLibraryList();
    console.log(authors, "//////////////");

})
const getLanguageList = async () => {
    if (!languageDropdown) return;

    const args = {
        doctype: 'Knowledge Artifact',
        fields: ['language'],
        or_filters: JSON.stringify([{ category: 'Journal' }, { category: 'Article' }, { category: 'Case Studies' }, { category: 'Newsletter' }])
    };

    try {
        const response = await frappe_client.get('/get_doctype_list', args);
        const langCodes = [...new Set(response.message.map(item => item.language).filter(Boolean))];

        // Fetch enabled languages in bulk
        const langResponse = await frappe_client.get('/get_doctype_list', {
            doctype: 'Language',
            fields: ['name', 'language_name'],
            filters: JSON.stringify({ enabled: '1', name: ['in', langCodes] })
        });

        const languages = langResponse.message || [];

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.name;
            option.textContent = lang.language_name || lang.name;
            handlelanguageDropdown.appendChild(option);
        });

        console.log("Loaded languages:", languages);
    } catch (error) {
        console.error('Error loading language list:', error);
    }
};


// Handle search from keywords
const keysearchInput = document.getElementById('tagsInput');

keysearchInput.addEventListener('input', async () => {
    const year = document.getElementById('year-dropdown').value;
    const author = document.getElementById('author-dropdown').value;
    const language = document.getElementById('language-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const search = keysearchInput.value;
    let authorInput = document.getElementById("belongToInput").value


    const filter = {
        page: currentPage,
        page_size: pageSize,
        ...(search && { keySearchInput: search }),
        ...(authorInput && { authorInput: authorInput }),
        ...(language !== "Select Language" && { language }),
        ...(category !== "Select Category" && { category }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(year !== "Select Year" && { year }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    handlePaginationVisibility(totalCount);
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


function setCategoryWiseBackgrounds(category) {
    category = category === "Article" ? "Articles" : category;
    category = category === "Journal" ? "Journals" : category;

    const elementDescription = document.getElementById("page-description");
    if (elementDescription) {
        elementDescription.textContent = category;
    }
    category = category === "Case Studies" ? "Case_Studies" : category;
    const categoryImages = {
        Articles: "../assets/img/publications.jpeg",
        Journals: "../assets/img/jonoural.png",
        Case_Studies: "../assets/img/library.jpeg",
        Newsletter: "../assets/img/newsletter.jpeg",
    };

    const elements = document.getElementsByClassName("page-title");



    if (category && categoryImages[category] && elements.length > 0) {
        elements[0].style.backgroundImage = `url('${categoryImages[category]}')`;
        elements[0].style.backgroundSize = "cover";
        elements[0].style.backgroundRepeat = "no-repeat";
        // elements[0].style.backgroundPosition = "center";
    }
}

yearDropdown.addEventListener('change', async function () {
    const author = document.getElementById('author-dropdown').value;
    const category = document.getElementById('category-dropdown1').value;
    const language = document.getElementById('language-dropdown').value;
    const search = document.getElementById('tagsInput').value;
    let authorInput = document.getElementById("belongToInput").value


    const filter = {
        page: currentPage,
        page_size: pageSize,
        year: this.value,
        ...(search && { keySearchInput: search }),
        ...(authorInput && { authorInput: authorInput }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(category !== "Select Category" && { category }),
        ...(language !== "Select Language" && { language }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);
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
        authorInput: this.value,
        ...(search && { keySearchInput: search }),
        ...(author !== "Select Author" && { authorDropdown: author }),
        ...(category !== "Select Category" && { category }),
        ...(language !== "Select Language" && { language }),
        ...(year !== "Select Year" && { year }),
    };

    const response = await frappe_client.get('/get_knowledge_artificates', filter);
    let totalCount = response.message.total_count;

    next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
    handlePaginationVisibility(totalCount);
    displayArtifacts(response.message.data);
});

document.addEventListener("DOMContentLoaded", () => {
    getLibraryList();
    getLanguageList();

    GetSetYearOps();
});