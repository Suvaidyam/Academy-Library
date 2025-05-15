import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";

let frappe_client = new FrappeApiClient();

let blogContainer = document.getElementById("blog-container");
let template = document.getElementById("blog-template");
let categoryDropdown = document.getElementById("category-dropdown");
let authorDropdown = document.getElementById("author-dropdown");
let languageDropdown = document.getElementById("language-dropdown");
let searchButton = document.getElementById("search-btn");
let Keywords = document.getElementById("tagsInput");
let resetButton = document.getElementById("reset-btn"); // Reset button

export async function getLibraryList() {
    try {
        // ========== Fetch Knowledge Artifacts ==========
        let filter = { page_size: pageSize, };
        filter["artifact_source"] = 'Internal'
        async function knowledge_data() {
            let response = await frappe_client.get('/get_knowledge_artificates', filter);
            let posts = response.message.data;
            console.log("post=========", posts);

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
        resetButton.addEventListener("click", () => {
            filter = {};
            filter["artifact_source"] = 'Internal'
            Keywords.value = ''
            authorDropdown.value = ''
            languageDropdown.value = '';
            categoryDropdown.value = "";
            show_data() // Show all internal artifacts again
        });


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
const c_dropdown = document.getElementById('category-dropdown1');

c_dropdown.addEventListener('change', async function () {
    let filter = {}
    // filter["artifact_source"] = 'Internal'
    filter["category"] = this.value

    let response = await frappe_client.get('/get_knowledge_artificates', filter);
    // let posts = response.message.artifacts;
    console.log('Selected value:', this.value, response);
    displayArtifacts(response.message.data)


});
// ========== Pagination Logic ==========
let pre_btn = document.getElementById('prev-btn')
let next_btn = document.getElementById('next-btn')

let currentPage = 1;
const pageSize = 4;


pre_btn.addEventListener("click", async function () {
    currentPage--; let filter = {
        page: currentPage,
        page_size: pageSize,
    };

    let response = await frappe_client.get('/get_knowledge_artificates', filter)
    displayArtifacts(response.message.data)
    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = currentPage >= Math.ceil(response.message.data.length / pageSize);

    console.log('-----------', c_dropdown.value, currentPage);


})
next_btn.addEventListener("click", async function () {
    currentPage++;
    let filter = {
        page: currentPage,
        page_size: pageSize,
    };

    let response = await frappe_client.get('/get_knowledge_artificates', filter)
    displayArtifacts(response.message.data)
    pre_btn.disabled = currentPage === 1;
    next_btn.disabled = currentPage >= Math.ceil(response.message.data.length / pageSize);

    console.log('-----------', c_dropdown.value, currentPage);


})
let handleclearbtn = document.getElementById('clearbtn')

handleclearbtn.addEventListener('click', () => {
    // alert('btn click');
    // console.log("==================");
    c_dropdown.selectedIndex = 0;
    getLibraryList();

}
)

let handlelanguageDropdown = document.getElementById('language-dropdown')
const getLanguageList = async () => {
    const args = {
        doctype: 'Language',
        fields: ['name', 'language_name'],
        filters: JSON.stringify({ enabled: '1' })

        // filters: {
        //   enabled: 1,
        // },
    };



    let response = await frappe_client.get('/get_doctype_list', args);
    response.message.forEach(lang => {
        let option = document.createElement('option');
        option.value = lang.name;
        option.textContent = lang.language_name || lang.name; // Fallback if `language_name` is missing
        handlelanguageDropdown.appendChild(option);
    });
    handlelanguageDropdown.addEventListener('change',()=> {
        try {
            let filter = {}
            // filter["artifact_source"] = 'Internal'
            filter["language"] = handlelanguageDropdown.value

            let response = frappe_client.get('/get_knowledge_artificates', filter);
            // let posts = response.message.artifacts;
            console.log('Selected value:', this.value, response);
            displayArtifacts(response.message.data)
        }catch (error) {
            console.error('Error fetching data:', error);
        }

        console.log('Language List:', handlelanguageDropdown.value)
    });



}


displayArtifacts()

const handleLanguageChange = async () => {
    let filter = {}
    // filter["artifact_source"] = 'Internal'
    filter["language"] = handlelanguageDropdown.value

    let response = await frappe_client.get('/get_knowledge_artificates', filter);
    // let posts = response.message.artifacts;
    console.log('Selected value:', this.value, response);
    displayArtifacts(response.message.data)
}



document.addEventListener("DOMContentLoaded", () => {
    getLibraryList();
    getLanguageList();
});