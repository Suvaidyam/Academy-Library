import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";
let baseURL = new FrappeApiClient().baseURL;

const frappe_client = new FrappeApiClient();

const get_all_books = async () => {
    try {
        const response = await frappe_client.get('/get_book_list');
        console.log('Book list response:', response);
        set_book_list(response)

        // Example: render the books if needed
        // renderBookList(response);
    } catch (error) {
        console.error('Error fetching book list:', error);
    }
};

const set_book_list=(response)=>{
    let bookdiv = document.getElementById('book-body')
    bookdiv.innerHTML=''
    if (response.message ==0) {
        bookdiv.innerHTML=`<div class=" alert-warning text-center mb-2.5" role="alert">
                        <i class="bi bi-exclamation-circle-fill me-2"></i>
                        No Books are available at the moment. Please check back later!
                      </div>`
        // bookdiv.style.textAlign = "center";
        
    }

    response.message.forEach(book => {


        let book_card = ` 
                  <div class="card mb-4 shadow-sm border-0 book-card">
                    <div class="row g-0">
                        <div class="col-md-3">
                        <img src="${book.cover_image}" class="img-fluid rounded-start h-100 object-fit-cover" alt="Book cover showing water">
                        </div>
                        <div class="col-md-9">
                        <div class="card-body">
                            <h5 class="card-title mb-2">${book.title}  <a  title="Download pdf" onclick="window.open('${baseURL}${book.pdf}')" ><i class="bi bi-file-earmark-arrow-down"></i></a></h5>
                            <p class="card-text text-muted">${book.description}</p>
                        </div>
                        </div>
                    </div>
                    </div>

                `


        bookdiv.insertAdjacentHTML("beforeend", book_card);

    })
}

export default set_book_list;

let bookbtn = document.getElementById('books-tab')
const clearButton = document.getElementById('clearSelection');
clearButton.addEventListener('click', () => {
    get_all_books();
});

bookbtn.addEventListener('click', () => {
    get_all_books();
});



// Handle globle search

const form = document.getElementById('book_form_search');
const searchInput = document.getElementById('bookSearchInput');




searchInput.addEventListener('input',async function (e) {
    e.preventDefault(); // Prevent actual form submission
    if (searchInput.value) {
        let response = await frappe_client.get('/filter_global_book', {
            global_val: searchInput.value
        })
        console.log('value haiiiiiiii');
        set_book_list(response)
    }
    else{
        get_all_books();
    }
   
    console.log('Search Query:', searchInput.value,response); 
    
  });

