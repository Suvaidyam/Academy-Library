import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

const frappe_client = new FrappeApiClient();
const baseURL = frappe_client.baseURL;

const languageDropdown = document.getElementById("language-dropdown");
const yearDropdown = document.getElementById("year-dropdown");
const categoryDropdown = document.getElementById("category-dropdown");
// const authorDropdown = document.getElementById("author");
const authorDropdown = document.getElementById("author");
const keySearchInput = document.getElementById("tagsInput");

const prevBtn = document.getElementById("book-prev-btn");
const nextBtn = document.getElementById("book-next-btn");

let currentPage = 1;
const pageSize = 8;
let totalPages = 1;

const updatePaginationButtons = () => {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
};

prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) get_all_books(currentPage - 1);
});
nextBtn?.addEventListener("click", () => {
  if (currentPage < totalPages) get_all_books(currentPage + 1);
});

let activeFilters = {
    year: '',
    language: '',
    author: '',
    keySearchInput: ''
};

const get_all_books = async (page=1) => {
    try {
        prevBtn.classList.add('d-none');
        nextBtn.classList.add('d-none');
        const filter = {
            category: "Book",
            page_size: pageSize,
            page,
            ...(activeFilters.year && { year: activeFilters.year }),
            ...(activeFilters.language && { language: activeFilters.language }),
            ...(activeFilters.author && { authorDropdown: activeFilters.author }),
            ...(activeFilters.keySearchInput && { keySearchInput: activeFilters.keySearchInput }),
        };
        const response = await frappe_client.get('/get_knowledge_artificates', filter);
        // console.log('Book list response:', response);
        set_book_list(response);
        totalPages = response.message.total_pages || 1;
        currentPage = response.message.page || 1;
        updatePaginationButtons();
    } catch (error) {
        console.error('Error fetching book list:', error);
    }finally {
        prevBtn.classList.remove('d-none');
        nextBtn.classList.remove('d-none');
    }
};

const GetSetYearOps = async () => {
    if (!yearDropdown) return;

    const args = {
        doctype: 'Knowledge Artifact',
        fields: ['date_of_creationpublication'],
        or_filters: JSON.stringify([{ category: 'Book' }])
    };

    try {
        const response = await frappe_client.get('/get_doctype_list', args);
        const addedYears = new Set();

        (response.message || []).forEach(item => {
            if (item.date_of_creationpublication) {
                const year = item.date_of_creationpublication.slice(0, 4);
                addedYears.add(year);
            }
        });

        const sortedYears = Array.from(addedYears).sort();
        // yearDropdown.innerHTML = `<option value="">Select Year</option>`;
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading year options:', error);
    }
};

const getLanguageList = async () => {
    if (!languageDropdown) return;

    const args = {
        doctype: 'Knowledge Artifact',
        fields: ['language'],
        or_filters: JSON.stringify([{ category: 'Book' }])
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
            languageDropdown.appendChild(option);
        });

        // console.log("Loaded languages:", languages);
    } catch (error) {
        console.error('Error loading language list:', error);
    }
};

const GetSetAuthorOps = async () => {
    if (!authorDropdown) return;
    const args = {
        doctype: 'Knowledge Artifact',
        fields: ['author'],
        or_filters: JSON.stringify([{ category: 'Book' }])
    };

    try {
        const response = await frappe_client.get('/get_doctype_list', args);
        const uniqueAuthors = [...new Set(response.message.map(item => item.author))];

        uniqueAuthors.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            authorDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading year options:', error);
    }
};


const set_book_list = (response) => {
    const bookdiv = document.getElementById('book-body');
    bookdiv.innerHTML = '';

    const books = response?.message?.data || [];
    if (!books.length) {
        bookdiv.innerHTML = `
            <div class="alert-warning  mb-2.5" role="alert">
                <i class="bi bi-exclamation-circle-fill"></i>
                No Books are available at the moment. Please check back later!
            </div>`;
        return;
    }

    books.forEach(book => {
        const card = `
        <article class="col-lg-12">
          <div class="card p-0 m-0 my-2">
            <a href="${book.attachment ? `${baseURL}${book.attachment}` : '#'}" 
               target="_blank" 
               class="noanchor books_pdf ${!book.attachment ? 'disabled' : ''}">
              <div class="row no-gutters">
                <div class="col-md-2 align-content-center">
                  <img src="${book.thumbnail_image ? `${baseURL}${book.thumbnail_image}` : '/assets/images/default-book.jpg'}" 
                       alt="${book.title || 'Book cover'}" 
                       class="img-fluid rounded blog-img" 
                       onerror="this.src='/assets/images/placeholder.jpg'">
                </div>
                <div class="col-md-10">
                  <div class="card-body">
                    <h5 class="card-title blog-title">${book.title || 'Untitled Book'}</h5>
                    <p class="card-text book_details">${book.a_short_description_about_the_artifact || 'No description available.'}</p>
                    <p class="card-text">
                      <small class="text-body-secondary post-author">${book.author || 'NaN'}</small> - 
                      <small class="text-body-secondary post-date">${book.date_of_creationpublication || 'Date not available'}</small>
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </article>`;
        bookdiv.insertAdjacentHTML("beforeend", card);
    });
};

export default set_book_list;

// Event Listeners
const bookbtn = document.getElementById('books-tab');
// if (bookbtn) {
//     bookbtn.addEventListener('click', () => {
//         get_all_books();
//         GetSetYearOps();
//         getLanguageList();
//     });
// }
document.addEventListener('DOMContentLoaded', async () => {
    get_all_books();
    GetSetYearOps();
    getLanguageList();
    GetSetAuthorOps()
});

keySearchInput?.addEventListener('input', async function () {
    activeFilters.keySearchInput = keySearchInput.value.trim();
    get_all_books(1);
});




// Clear button logic
const handleclearbtn = document.getElementById('clearbtn');

handleclearbtn?.addEventListener('click', () => {
    activeFilters = {
        year: '',
        language: '',
        author: '',
        keySearchInput: ''
    };
    if (languageDropdown) languageDropdown.selectedIndex = 0;
    if (authorDropdown) authorDropdown.selectedIndex = 0;
    if (yearDropdown) yearDropdown.selectedIndex = 0;
    if (categoryDropdown) categoryDropdown.selectedIndex = 0;
    if (keySearchInput) keySearchInput.value = '';
    get_all_books(1);
});

// Filter on author dropdown change

authorDropdown?.addEventListener('change', async function () {
    activeFilters.author = this.value;
    get_all_books(1);
});




// Filter on language change
languageDropdown?.addEventListener('change', async function () {
    activeFilters.language = this.value;
    get_all_books(1);
});



// Filter on year change
yearDropdown?.addEventListener('change', async function () {
    activeFilters.year = this.value;
    get_all_books(1);
});



