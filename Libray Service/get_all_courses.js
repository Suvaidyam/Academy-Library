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


listBtn.addEventListener('click', function () {
    listBtn.disabled = true;
    cardBtn.disabled = false;
    // Convert HTMLCollection to an array using Array.from()
    let mainDivs = Array.from(document.getElementsByClassName('main'));
    // let portfolioDiv = document.querySelector('.portfolio-content');
    let portfolioDiv = Array.from(document.getElementsByClassName('portfolio-content'));
  
    portfolioDiv.forEach(div => {
        let children = div.getElementsByClassName('portfolio-info');

        // Convert HTMLCollection to array and loop through each child
        Array.from(children).forEach(child => {
            child.classList.add('w-100','px-3');
        });
        
        div.classList.remove('h-100');
        div.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'pe-5', 'border', 'rounded', 'p-3');
    })


    console.log(mainDivs, 'mainDiv');

    mainDivs.forEach(div => {
        div.classList.remove('col-lg-3', 'col-md-3');
        div.classList.add('col-12','col-lg-6', 'col-md-6');

        // div.classList.add('border rounded');

        div.classList.remove('col-md-6');
        div.classList.add('col-md-12');


    });
    let imgDivs = Array.from(document.getElementsByClassName('img-fluid'));

    console.log(imgDivs, 'imgDiv');

    imgDivs.forEach(div => {
        div.classList.add('col-4');
    })

    currentView = 'list';
    updateButtonStyles();

    console.log(currentView);
});


cardBtn.addEventListener('click', function () {
    cardBtn.disabled = true;
    listBtn.disabled = false;

    let mainDivs = Array.from(document.getElementsByClassName('main'));
    let imgDivs = Array.from(document.getElementsByClassName('img-fluid'));
    let portfolioDiv = Array.from(document.getElementsByClassName('portfolio-content'));
    portfolioDiv.forEach(div => {
        div.classList.add('h-100');
       let children = div.getElementsByClassName('portfolio-info');

    Array.from(children).forEach(child => {
        child.classList.remove('w-100','px-3');
    });
        div.classList.remove('d-flex', 'align-items-center', 'justify-content-between', 'pe-5', 'border', 'rounded', 'p-3');
    })
    imgDivs.forEach(div => {
        div.classList.remove('col-4');
    })


    mainDivs.forEach(div => {
    
          div.classList.remove('col-lg-6', 'col-md-6');
        div.classList.add('col-12','col-lg-3', 'col-md-3');

        div.classList.add('col-md-3');
        div.classList.remove('col-md-12');

    })


    currentView = 'card';
    updateButtonStyles();

    console.log(currentView);

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

    select.addEventListener('change', async function () {
        let response = await frappe_client.get('/get_newsession_list', {
            selected_course: this.value
        })
        console.log(this.value)


        setSessionList(response)
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

    select.addEventListener('change', async function () {
        set_chapter_option(this.value)
        let response = await frappe_client.get('/get_newsession_list', {
            selected_topic: this.value
        })
        setSessionList(response)
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


    select.addEventListener('change', async function () {
        console.log(this.value);
        const searchInput = document.getElementById('searchInput');
        searchInput.value = ''

        let response = await frappe_client.get('/get_newsession_list', {
            selected_chapter: this.value
        })
        setSessionList(response)
    });


}


const get_session_list = async () => {

    let response = await frappe_client.get('/get_newsession_list')
    console.log('session list', response);
    setSessionList(response)




}


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

   


    const docTemplates = {
        PDF: "../assets/img/portfolio/pdf_109.webp",
        Docs: "../assets/img/portfolio/doc.webp",
        Video: "../assets/img/portfolio/branding-1.jpg",
        Image: "../assets/img/portfolio/books-1.jpg",
        PPT: "../assets/img/portfolio/powerpoint.jpg"
    };

    const filterMap = {
        PDF: "filter-app",
        Docs: "filter-product",
        Video: "filter-branding",
        Image: "filter-books",
        PPT: "filter-books"
    };

    response.message.forEach(element => {
        const imgSrc = docTemplates[element.doc_type] || "";
        const filterClass = filterMap[element.doc_type] || "";
        const description = element.description || `${element.doc_type} File`;

        const result_card = `
    <div onclick="window.open('${baseURL}${element.session_doc}')" style="cursor: pointer;" class="main col-lg-3 col-md-4 portfolio-item isotope-item ${filterClass}">
      <div class="portfolio-content  h-100">
        <img src="${imgSrc}" class="img-fluid" alt="">
        <div class="portfolio-info">
          <p>${element.name}</p>
          <div class="d-flex justify-content-between  pe-3">
            <p>${description}</p>
            <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" title="${element.doc_type}" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;

        
        // let list_card = `
        //     <div onclick="window.open('${baseURL}${element.session_doc}')" class="col-12 mb-4" style="cursor: pointer;">
        //     <div class="row g-3 align-items-center border rounded p-3">
        //         <div class="col-md-4">
        //         <img src="${imgSrc}" class="img-fluid rounded" alt="PDF">
        //         </div>
        //         <div class="col-md-8">
        //         <h5 class="mb-1">${element.name}</h5>
        //         <div>
        //            <div class="d-flex justify-content-between  pe-3">
        //     <p>${description}</p>
        //     <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" title="${element.doc_type}" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
        //   </div>
        //         </div>
        //         </div>
        //     </div>
        //     </div>`;

        if (currentView === 'list') {
            SessionList.insertAdjacentHTML("beforeend", list_card);

        } else if (currentView === 'card') {

            SessionList.insertAdjacentHTML("beforeend", result_card);
        }
    });

}









document.addEventListener('DOMContentLoaded', async () => {
    get_all_courses()
    get_session_list()

})





// Handle globle search

const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent actual form submission

    let response = await frappe_client.get('/get_newsession_list', {
        global_search_val: searchInput.value
    })
    setSessionList(response)
    // console.log('Search Query:', searchInput.value, response);

});

searchInput.addEventListener('input', async function (e) {
    e.preventDefault(); // Prevent actual form submission

    let response = await frappe_client.get('/get_newsession_list', {
        global_search_val: searchInput.value
    })
    setSessionList(response)
    console.log('Search Query:', searchInput.value, response);

});
