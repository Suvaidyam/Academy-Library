import { FrappeApiClient } from "../services/FrappeApiClient.js";
import ENV from "../config/config.js";

const frappe_client = new FrappeApiClient();

const get_all_books = async () => {
    try {
        const response = await frappe_client.get('/get_book_list');
        console.log('Book list response:', response);
        let bookdiv = document.getElementById('book-body')
        bookdiv.innerHTML=''

        response.message.forEach(book => {


            let book_card = ` 
                      <div class="row mb-4 book-card">
                                    <div class="col-md-3">
                                        <img src="${book.cover_image}" alt="Book cover showing water" class="img-fluid rounded book-img">
                                    </div>
                                    <div class="col-md-9">
                                        <h5 class="card-title">${book.title}</h5>
                                        <p class="card-text text-muted">${book.description}</p>
                                        <a href="#" class="btn btn-sm btn-outline-primary">View Details</a>
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
