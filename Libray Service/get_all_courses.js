import { FrappeApiClient } from "../services/FrappeApiClient.js";
let frappe_client = new FrappeApiClient()
let baseURL = new FrappeApiClient().baseURL;


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

    select.addEventListener('change',async function () {
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
    document.getElementById('chapterSearch').selectedIndex=0

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

    // response.message.forEach(element => {
    //     let result_card = "";
    //     console.log('element.doc_type', element.doc_type);


    //     if (element.doc_type === "PDF") {
    //         result_card = `
    //         <div onclick="window.open('${baseURL}${element.session_doc}')"   class="col-lg-4 col-md-6 portfolio-item isotope-item filter-app">
    //           <div class="portfolio-content h-100">
    //             <img src="../assets/img/portfolio/pdf_109.webp" class="img-fluid" alt="">
    //             <div class="portfolio-info">
    //               <h4>${element.name}</h4>
    //               <div class="d-flex justify-content-between px-2">
    //                     <p>${element.description || "PDF File"}</p>
    //                     <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
    //               </div>
    //             </div>
    //           </div>
    //         </div>`;
    //     } else if (element.doc_type === "Docs") {
    //         result_card = `
    //         <div onclick="window.open('${baseURL}${element.session_doc}')"  class="col-lg-4 col-md-6 portfolio-item isotope-item filter-product">
    //           <div class="portfolio-content h-100">
    //             <img src="../assets/img/portfolio/doc.webp" class="img-fluid" alt="">
    //             <div class="portfolio-info">
    //               <h4>${element.name}</h4>
    //                <div class="d-flex justify-content-between px-2">
    //                     <p>${element.description || "Document File"}</p>
    //                     <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-eye"></i></a>

    //                 </div>
    //             </div>
    //           </div>
    //         </div>`;
    //     } else if (element.doc_type === "Video") {
    //         result_card = `
    //         <div onclick="window.open('${baseURL}${element.session_doc}')"  class="col-lg-4 col-md-6 portfolio-item isotope-item filter-branding">
    //           <div class="portfolio-content h-100">
    //             <img src="../assets/img/portfolio/branding-1.jpg" class="img-fluid" alt="">
    //             <div class="portfolio-info">
    //               <h4>${element.name}</h4>
    //                 <div class="d-flex justify-content-between px-2">       
    //                     <p>${element.description || "Video File"}</p>
    //                     <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
                
    //                  </div>
    //             </div>
    //           </div>
    //         </div>`;
    //     } else if (element.doc_type === "Image") {
    //         result_card = `
    //         <div onclick="window.open('${baseURL}${element.session_doc}')"  class="col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
    //           <div class="portfolio-content h-100">
    //             <img src="../assets/img/portfolio/books-1.jpg" class="img-fluid" alt="">
    //             <div class="portfolio-info">
    //               <h4>${element.name}</h4>
    //                 <div class="d-flex justify-content-between px-2">
    //                     <p>${element.description || "Image File"}</p>
    //                     <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
    //                 </div>
    //             </div>
    //           </div>
    //         </div>`;
    //     }else if (element.doc_type === "PPT") {
    //         result_card = `
    //         <div onclick="window.open('${baseURL}${element.session_doc}')"  class="col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
    //           <div class="portfolio-content h-100">
    //             <img src="../assets/img/portfolio/powerpoint.jpg" class="img-fluid" alt="">
    //             <div class="portfolio-info">
    //               <h4>${element.name}</h4>
    //                 <div class="d-flex justify-content-between px-2">
    //                     <p>${element.description || "PPT File"}</p>
    //                     <a href="" onclick="window.open('${baseURL}${element.session_doc}')" title="PDF" data-gallery="portfolio-gallery-app" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
    //                 </div>
    //             </div>
    //           </div>
    //         </div>`;
    //     }

    //     SessionList.insertAdjacentHTML("beforeend", result_card);
    // });

    
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
    <div onclick="window.open('${baseURL}${element.session_doc}')" class="col-lg-4 col-md-6 portfolio-item isotope-item ${filterClass}">
      <div class="portfolio-content h-100">
        <img src="${imgSrc}" class="img-fluid" alt="">
        <div class="portfolio-info">
          <h4>${element.name}</h4>
          <div class="d-flex justify-content-between  pe-3">
            <p>${description}</p>
            <a href="#" onclick="window.open('${baseURL}${element.session_doc}')" title="${element.doc_type}" class="glightbox preview-link"><i class="bi bi-eye"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;

  SessionList.insertAdjacentHTML("beforeend", result_card);
});

}









document.addEventListener('DOMContentLoaded', async () => {
    get_all_courses()
    get_session_list()

})





// Handle globle search

const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', async function (e) {
    e.preventDefault(); // Prevent actual form submission

    let response = await frappe_client.get('/get_newsession_list', {
        global_search_val: searchInput.value
    })
    setSessionList(response)
    console.log('Search Query:', searchInput.value, response);

});
