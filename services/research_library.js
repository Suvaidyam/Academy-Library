import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

let blogContainer = document.getElementById("blog-container");
let template = document.getElementById("blog-template");
let categoryDropdown = document.getElementById("category-dropdown");
let authorDropdown = document.getElementById("author-dropdown");
let languageDropdown = document.getElementById("language-dropdown");
let yearDropdown = document.getElementById("year-dropdown");
let belongToInput = document.getElementById("belongToInput");

// let searchButton = document.getElementById("search-btn");
// let Keywords = document.getElementById("tagsInput");
// let resetButton = document.getElementById("reset-btn"); // Reset button

const c_dropdown = document.getElementById('category-dropdown1');
let currentPage = 1;
const pageSize = 1;


export async function getLibraryList() {
    try {
        // ========== Fetch Knowledge Artifacts ==========
        let filter = {
            page: currentPage,
            page_size: pageSize, page_size: pageSize, };
        filter["artifact_source"] = 'Internal'
        async function knowledge_data() {
            let response = await frappe_client.get('/get_knowledge_artificates', filter);
            let posts = response.message.data;
            // console.log("post=========bb", posts,currentPage,Math.ceil(response.message.data.length / pageSize));

            // next_btn.disabled = currentPage >= Math.ceil(response.message.data.length / pageSize);
            return posts
        }


        if (!template) {
            console.error("Template not found!");
            return;
        }
        displayArtifacts()


        // Initially display all internal artifacts
        async function show_data() {
            let artifacts = await knowledge_data();
            if (artifacts) {
                document.getElementById("loader").style.display = "none";
            }
            // console.log(artifacts)
            displayArtifacts(artifacts);
        }
        show_data()
        // ========== Fetch Categories for Dropdown ==========
        let fieldMetaParams = { doctype: "Knowledge Artifact", fieldname: "category" };
        let fieldMetaResponse = await frappe_client.get('/get_field_meta', fieldMetaParams);
        let fieldMetaData = fieldMetaResponse.message;
        // console.log(fieldMetaResponse)
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
        // console.log(fieldlinkResponse.message, 'language');
        let dropdownOptions = `<option selected value="">Language</option>`;
        dropdownOptions += fieldlinkResponse.message?.lang?.map(item =>
            `<option value="${item.language_id}">${item.language_name}</option>`
        ).join('');
        languageDropdown.innerHTML = dropdownOptions;


        // ============== TagsDropdown =================
        let fieldtagsResponse = await frappe_client.get('/get_link_filed') || [];
        // console.log(fieldtagsResponse.message.tag)
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

        // ========== Search Button Click Event ==========
        // searchButton.addEventListener("click", () => {
        //     let selectedCategory = categoryDropdown.value;
        //     let lan = languageDropdown.value
        //     let authorDropdowns = authorDropdown.value
        //     let Keyword = Keywords.value || []
        //     if (Keyword.length) {
        //         Keyword = JSON.parse(Keyword)?.map(keyword => keyword.value)
        //     } else {
        //         Keyword = []
        //     }
        //     // console.log(Keyword, 'Keyword', lan)
        //     if (selectedCategory) {
        //         filter["category"] = selectedCategory
        //     } else {
        //         filter["category"] = '';
        //     }
        //     if (lan) {
        //         filter["language"] = lan
        //     } else {
        //         filter["language"] = '';
        //     }
        //     if (authorDropdowns) {
        //         filter["internalauthor"] = authorDropdowns
        //     } else {
        //         filter["internalauthor"] = '';
        //     }
        //     if (Keyword) {
        //         filter["tags"] = Keyword;
        //     } else {
        //         filter["tags"] = '';
        //     }
        //     // console.log(filter)
        //     show_data()
        // });

        // ========== Reset Button Click Event ==========
        // resetButton.addEventListener("click", () => {
        //     filter = {
        // page: currentPage,
        // page_size: pageSize,};
        //     filter["artifact_source"] = 'Internal'
        //     Keywords.value = ''
        //     authorDropdown.value = ''
        //     languageDropdown.value = '';
        //     categoryDropdown.value = "";
        //     show_data() // Show all internal artifacts again
        // });


        // ========== Pagination Logic ==========


        // document.querySelectorAll("#blog-pagination ul li a").forEach(function (link) {
        //     link.addEventListener("click", function (event) {
        //         event.preventDefault();
        //         let pageNumber = this.textContent.trim();
        //         if (!isNaN(pageNumber)) {
        //             console.log("Clicked Page:", pageNumber);
        //             filter['page'] = pageNumber
        //             show_data()
        //         }
        //     });
        // });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayArtifacts(filteredArtifacts) {
    blogContainer.innerHTML = ""; // Clear previous cards

    if (filteredArtifacts?.length === 0) {
        blogContainer.innerHTML = `
            <div class="no-results text-center">
                <h4 class="mt-3">No results found</h4>
                <p class="text-muted">Try selecting a different category, author, or language.</p>
            </div>`;
        return;
    }
    filteredArtifacts?.forEach(post => {
        if (post) {
            let newCard = template.cloneNode(true);
            newCard.classList.remove("d-none");
            newCard.removeAttribute("id"); // Remove duplicate IDs

            newCard.querySelector(".blog-img").src = post.thumbnail_image
                ? ENV.API_BASE_URL + post.thumbnail_image
                : "https://www.k12digest.com/wp-content/uploads/2024/03/1-3-550x330.jpg";

            newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
            newCard.querySelector(".blog-title").textContent = post.title || "No Title";
            newCard.querySelector(".post-author").textContent = post.internalauthor || "Unknown";
            newCard.querySelector(".post-date time").textContent = post.date_of_creationpublication || "No Date";

            blogContainer.appendChild(newCard);
        }
    });
}

// work on catogoty dropdown

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
    // let posts = response.message.artifacts;
    // console.log('Selected value:', this.value, response);
    next_btn.disabled = currentPage >= Math.ceil(response.message.total_count / pageSize);
    displayArtifacts(response.message.data)


});

const handletoshowbelongToInput = (cat) => {
    let BelongParentDiv = belongToInput.parentElement.parentElement;

    if (cat === "Case Studies") {
        BelongParentDiv.classList.remove("d-none"); // show the author dropdown
    } else {
        BelongParentDiv.classList.add("d-none"); // hide the author dropdown
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
        // artifact_source: 'Internal' // Uncomment if needed
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
        // artifact_source: 'Internal' // Uncomment if needed
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
        ...(author && { author }),
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
        ...(author && { author }),
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


displayArtifacts()

//handle search from keywords

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

    // Collect unique years
    response.message.forEach(item => {
        if (item.date_of_creationpublication) {
            let year = item.date_of_creationpublication.slice(0, 4);
            addedYears.add(year);
        }
    });
    // Convert to array and sort in ascending order
    let sortedYears = Array.from(addedYears).sort();
    // Append sorted options to dropdown
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
        // artifact_source: 'Internal' // Uncomment if needed
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
        // artifact_source: 'Internal' // Uncomment if needed
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