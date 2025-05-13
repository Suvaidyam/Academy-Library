import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()
let baseURL = new FrappeApiClient().baseURL;

let currentView = 'card'; // Default

const listBtn = document.getElementById('listViewBtn');
const cardBtn = document.getElementById('cardViewBtn');

function updateButtonStyles() {
    if (currentView === 'card') {
        cardBtn.classList.remove('btn-outline-primary');
        cardBtn.classList.add('btn-primary');

        listBtn.classList.remove('btn-primary');
        listBtn.classList.add('btn-outline-secondary');
    } else {
        listBtn.classList.remove('btn-outline-secondary');
        listBtn.classList.add('btn-primary');

        cardBtn.classList.remove('btn-primary');
        cardBtn.classList.add('btn-outline-primary');
    }
}



let SessionList = document.querySelector('#searchResults');
listBtn.addEventListener('click', () => {
    SessionList.classList.remove(..."list-unstyled search-results row gy-4 isotope-container".split(" "));


    currentView = 'list';
    updateButtonStyles();
    get_session_list();
});

cardBtn.addEventListener('click', () => {
    currentView = 'card';
    SessionList.classList.add(..."list-unstyled search-results row gy-4 isotope-container".split(" "));


    updateButtonStyles();
    get_session_list();

});




const get_all_courses = async () => {
    try {
        let response = await frappe_client.get('/get_all_course_list', {
            doctype: 'LMS Course'
        })
        console.log("response00000", response);
        set_course_option(response)

    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
}

const set_course_option = (response) => {
    const select = document.getElementById('courseSearch');

    while (select.options.length > 1) {
        select.remove(1);
    }
    select.selectedIndex = 0;

    // Append dynamic options
    response.message.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        set_topic_option(this.value)
    });
}

const set_topic_option = async (course) => {
    let response = await frappe_client.get('/get_all_course_list', {
        doctype: 'Topic',
        selected_course: course
    })

    const select = document.getElementById('topicSearch');

    while (select.options.length > 1) {
        select.remove(1);
    }
    select.selectedIndex = 0;
    document.getElementById('chapterSearch').selectedIndex = 0

    // Append dynamic options
    response.message.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        set_chapter_option(this.value)
    });
}

const set_chapter_option = async (topic) => {
    let response = await frappe_client.get('/get_all_course_list', {
        doctype: 'Chapter',
        selected_topic: topic
    })

    console.log("=====topic===", topic, response);


    const select = document.getElementById('chapterSearch');

    while (select.options.length > 1) {
        select.remove(1);
    }

    select.selectedIndex = 0;
    // Append dynamic options
    response.message.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name.charAt(0).toUpperCase() + course.name.slice(1);
        select.appendChild(option);
    });

    // select.addEventListener('change', function async() {
    //     console.log(this.value);
    //     let response = await frappe_client.get('/get_session_list')

    //     // set_chapter_option(this.value)
    // });
    select.addEventListener('change', async function () {
        console.log(this.value);
        const searchInput = document.getElementById('searchInput');
        searchInput.value = ''

        let response = await frappe_client.get('/get_session_list', {
            selected_chapter: this.value
        })
        setSessionList(response)
    });


}


const get_session_list = async () => {
    let response = await frappe_client.get('/get_session_list')
    console.log('session list', response);
    setSessionList(response)




}

// export function setSessionList(response) {
//     let SessionList = document.querySelector('#searchResults')
//     console.log(response);
//     SessionList.innerHTML = ""
//     // console.log(SessionList, 'emptyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');

//     response.message.forEach(element => {


//         let result_card = ` 
//                       <li class="result-item" data-type="pdf">${element.name} (${element.doc_type})</li>
//                     `


//         SessionList.insertAdjacentHTML("beforeend", result_card);

//     });

// }
export function setSessionList(response) {
    let SessionList = document.querySelector('#searchResults');
    console.log(response);
    SessionList.innerHTML = "";
    if (response.message == 0) {
        const prev = SessionList.previousElementSibling;
        SessionList.innerHTML = `<div class=" alert-warning text-center mb-2.5" role="alert">
                        <i class="bi bi-exclamation-circle-fill me-2"></i>
                        No Sessions are available at the moment. Please check back later!
                      </div>`
        if (prev) {
            prev.style.display = "none";
        }
    }

    response.message.forEach(element => {
        let result_card = "";
        let list_card = "";


        if (element.doc_type === "PDF") {
            list_card = `
            <div class="col-12 mb-4">
            <div class="row g-3 align-items-center border rounded p-3">
                <div class="col-md-4">
                <img src="../assets/img/portfolio/pdf_109.webp" class="img-fluid rounded" alt="PDF">
                </div>
                <div class="col-md-8">
                <h5 class="mb-1">${element.name}</h5>
                <p class="text-muted mb-2">${element.description || "PDF File"}</p>
                <div>
                    <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" class="btn btn-sm btn-outline-primary me-2">
                    <i class="bi bi-zoom-in"></i> View
                    </a>
                    <a href="#" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-link-45deg"></i> More Details
                    </a>
                </div>
                </div>
            </div>
            </div>`;
        } else if (element.doc_type === "Docs") {
            list_card = `
            <div class="col-12 mb-4">
            <div class="row g-3 align-items-center border rounded p-3">
                <div class="col-md-4">
                <img src="../assets/img/portfolio/doc.webp" class="img-fluid rounded" alt="Document">
                </div>
                <div class="col-md-8">
                <h5 class="mb-1">${element.name}</h5>
                <p class="text-muted mb-2">${element.description || "Document File"}</p>
                <div>
                    <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" class="btn btn-sm btn-outline-primary me-2">
                    <i class="bi bi-zoom-in"></i> View
                    </a>
                    <a href="#" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-link-45deg"></i> More Details
                    </a>
                </div>
                </div>
            </div>
            </div>`;
        }
        else if (element.doc_type === "Video") {
            list_card = `
            <div class="col-12 mb-4">
            <div class="row g-3 align-items-center border rounded p-3">
                <div class="col-md-4">
                <img src="../assets/img/portfolio/branding-1.jpg" class="img-fluid rounded" alt="Video">
                </div>
                <div class="col-md-8">
                <h5 class="mb-1">${element.name}</h5>
                <p class="text-muted mb-2">${element.description || "Video File"}</p>
                <div>
                    <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" class="btn btn-sm btn-outline-primary me-2">
                    <i class="bi bi-zoom-in"></i> View
                    </a>
                    <a href="#" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-link-45deg"></i> More Details
                    </a>
                </div>
                </div>
            </div>
            </div>`;
        } else if (element.doc_type === "Image") {
            list_card = `
            <div class="col-12 mb-4">
            <div class="row g-3 align-items-center border rounded p-3">
                <div class="col-md-4">
                <img src="../assets/img/portfolio/books-1.jpg" class="img-fluid rounded" alt="Image">
                </div>
                <div class="col-md-8">
                <h5 class="mb-1">${element.name}</h5>
                <p class="text-muted mb-2">${element.description || "Image File"}</p>
                <div>
                    <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" class="btn btn-sm btn-outline-primary me-2">
                    <i class="bi bi-zoom-in"></i> View
                    </a>
                    <a href="#" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-link-45deg"></i> More Details
                    </a>
                </div>
                </div>
            </div>
            </div>`;
        }
        // list_card 
        if (element.doc_type === "PDF") {
            result_card = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-app">
              <div class="portfolio-content h-100">
                <img src="../assets/img/portfolio/pdf_109.webp" class="img-fluid" alt="">
                <div class="portfolio-info">
                  <h4>${element.name}</h4>
                  <p>${element.description || "PDF File"}</p>
                  <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
                  <a href="#" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a>
                </div>
              </div>
            </div>`;
        } else if (element.doc_type === "Docs") {
            result_card = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-product">
              <div class="portfolio-content h-100">
                <img src="../assets/img/portfolio/doc.webp" class="img-fluid" alt="">
                <div class="portfolio-info">
                  <h4>${element.name}</h4>
                  <p>${element.description || "Document File"}</p>
                  <a href="" title="Docs"  onclick="window.open('${baseURL}${element.session_doc}')" data-gallery="portfolio-gallery-product" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
                  <a href="#" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a>
                </div>
              </div>
            </div>`;
        } else if (element.doc_type === "Video") {
            result_card = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-branding">
              <div class="portfolio-content h-100">
                <img src="../assets/img/portfolio/branding-1.jpg" class="img-fluid" alt="">
                <div class="portfolio-info">
                  <h4>${element.name}</h4>
                  <p>${element.description || "Video File"}</p>
                  <a href=""  onclick="window.open('${baseURL}${element.session_doc}')" title="Video" data-gallery="portfolio-gallery-branding" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
                  <a href="#" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a>
                </div>
              </div>
            </div>`;
        } else if (element.doc_type === "Image") {
            result_card = `
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
              <div class="portfolio-content h-100">
                <img src="../assets/img/portfolio/books-1.jpg" class="img-fluid" alt="">
                <div class="portfolio-info">
                  <h4>${element.name}</h4>
                  <p>${element.description || "Image File"}</p>
                  <a href=""  onclick="window.open('${baseURL}${element.session_doc}')" title="Image" data-gallery="portfolio-gallery-book" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
                  <a href="#" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a>
                </div>
              </div>
            </div>`;
        }
        if (currentView === 'card') {
            SessionList.insertAdjacentHTML("beforeend", result_card);
        } else {
            SessionList.insertAdjacentHTML("beforeend", list_card);
        }
    });
}









document.addEventListener('DOMContentLoaded', async () => {
    // updateButtonStyles();
    get_all_courses()
    get_session_list()
    // let response = await frappe_client.get('/filter_global_session', {
    //     global_val: searchInput.value
    // })
    console.log("3333333333333333333333333333333333", response);


})





// Handle globle search

const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', async function (e) {
    e.preventDefault(); // Prevent actual form submission

    let response = await frappe_client.get('/filter_global_session', {
        global_val: searchInput.value
    })
    setSessionList(response)
    console.log('Search Query:', searchInput.value, response);

});
