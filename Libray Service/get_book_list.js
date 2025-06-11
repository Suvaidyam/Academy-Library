import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

const frappe_client = new FrappeApiClient();
const baseURL = frappe_client.baseURL;

const authorDropdown = document.getElementById("author-dropdown");
const languageDropdown = document.getElementById("language-dropdown");
const yearDropdown = document.getElementById("year-dropdown");
const categoryDropdown = document.getElementById("category-dropdown");
const authorInput = document.getElementById("author");

const get_all_books = async () => {
    try {
        const filter = { category: "Book" };
        const response = await frappe_client.get('/get_knowledge_artificates', filter);
        console.log('Book list response:', response);
        set_book_list(response);
    } catch (error) {
        console.error('Error fetching book list:', error);
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
        yearDropdown.innerHTML = `<option value="">Select Year</option>`;
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
        doctype: 'Language',
        fields: ['name', 'language_name'],
        filters: JSON.stringify({ enabled: '1' })
    };

    try {
        const response = await frappe_client.get('/get_doctype_list', args);
        languageDropdown.innerHTML = `<option value="">Select Language</option>`;
        (response.message || []).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.name;
            option.textContent = lang.language_name || lang.name;
            languageDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading language list:', error);
    }
};

const set_book_list = (response) => {
    const bookdiv = document.getElementById('book-body');
    bookdiv.innerHTML = '';

    const books = response?.message?.data || [];
    if (!books.length) {
        bookdiv.innerHTML = `
            <div class="alert-warning text-center mb-2.5" role="alert">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
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
if (bookbtn) {
    bookbtn.addEventListener('click', () => {
        get_all_books();
        GetSetYearOps();
        getLanguageList();
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    get_all_books();
        GetSetYearOps();
        getLanguageList();
})
const searchInput = document.getElementById('bookSearchInput');
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        e.preventDefault();
        try {
            const value = searchInput.value.trim();
            if (value) {
                const response = await frappe_client.get('/filter_global_book', {
                    global_val: value
                });
                set_book_list(response);
            } else {
                get_all_books();
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    });
}

// Clear button logic
const handleclearbtn = document.getElementById('clearbtn');
if (handleclearbtn) {
    handleclearbtn.addEventListener('click', () => {
        if (languageDropdown) languageDropdown.selectedIndex = 0;
        if (authorDropdown) authorDropdown.selectedIndex = 0;
        if (yearDropdown) yearDropdown.selectedIndex = 0;
        if (categoryDropdown) categoryDropdown.selectedIndex = 0;
        if (authorInput) authorInput.value = '';

        get_all_books();
    });
}

// Filter on year change
if (yearDropdown) {
    yearDropdown.addEventListener('change', async function () {
        const language = languageDropdown?.value || '';
        const search = document.getElementById('tagsInput')?.value || '';
        const author_search = document.getElementById('author')?.value || '';

        console.log("author_search",author_search);
        

        const filter = {
            category:"Book",
            year: this.value,
            ...(search && { keySearchInput: search }),
            ...(author_search && { author_search: author_search }),
            ...(language && language !== "Select Language" && { language }),
        };

        try {
            const response = await frappe_client.get('/get_knowledge_artificates', filter);
            const totalCount = response.message.total_count;

            const next_btn = document.getElementById("next-btn");
            if (next_btn) {
                next_btn.disabled = currentPage >= Math.ceil(totalCount / pageSize);
            }

            // handlePaginationVisibility(totalCount);
            set_book_list(response);
        } catch (err) {
            console.error("Error in year filter:", err);
        }
    });
}
