import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";
let baseURL = new FrappeApiClient().baseURL;

const frappe_client = new FrappeApiClient();

const get_all_books = async () => {
    try {
        const response = await frappe_client.get('/get_book_list');
        console.log('Book list response:', response);
        let bookdiv = document.getElementById('book-body')
        bookdiv.innerHTML=''

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

        });

        // Example: render the books if needed
        // renderBookList(response);
    } catch (error) {
        console.error('Error fetching book list:', error);
    }
};

let bookbtn = document.getElementById('books-tab')

bookbtn.addEventListener('click', () => {
    get_all_books();
});
