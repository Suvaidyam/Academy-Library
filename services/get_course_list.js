import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
import { getandSetDyanamicCourseDetailsAndName } from "./learning_library.js";


let baseURL=new FrappeApiClient().baseURL;


// Fetch and render the course list dynamically based on course type and navtype (live/upcoming)
export async function get_dynaic_course_list(courseType, navtype) {
  console.log("courseType==11", courseType);

  let frappe_client = new FrappeApiClient();
  try {
    // Make GET request to backend with courseType and navtype as params
    let response = await frappe_client.get('/get_all_courses', {
      course_type: courseType,
      navtype: navtype,
    });

    // On successful response, hide the loader and render the course list

    if (response) {
      document.getElementById("loader").style.display = "none";
      set_dynamic_course(response, navtype);
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
}

// Run once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  

  // Add click event listener to each course category link
  const links = document.querySelectorAll('.services-list a');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const course = e.currentTarget.innerText.trim(); // Get selected course name
      sessionStorage.setItem('courseCategory', course); // Store it in session
      getandSetDyanamicCourseDetailsAndName()

      let navtype = sessionStorage.getItem("navtype"); // Get current tab type
      if (course) {
        get_dynaic_course_list(course, navtype); // Fetch course list
      }
    });
  });
});

// Function to render the fetched course list
const set_dynamic_course = (response, navtype) => {
  const blogContainer = document.getElementById("blog-container");
  const blogContainer2 = document.getElementById("blog-container-2");

  // console.log("set_dynamic_course is called", blogContainer);
  // console.log("navtype=", navtype);

  // Clear existing course list depending on navtype
  if (navtype === "1") blogContainer.innerHTML = "";
  if (navtype === "0") blogContainer2.innerHTML = "";

  if (response.message.length ===0) {
    console.log("set_dynamic_course length===", response.message.length);
    document.getElementById("no-alvailable-corses").style.display = "block";
  }
  else{
    document.getElementById("no-alvailable-corses").style.display = "none";
  }

  // Loop through each course and render HTML
  response.message.forEach((item) => {
    // console.log("Item being rendered:", item);
    const newo = `
      <div class="col-lg-12" id="blog-template" data-aos="fade-up" data-aos-delay="100">
        <article>
          <div class="row newsCard">
            <div class="col-md-4" class="post-img">
              <img src="${ENV.API_BASE_URL + item.image}" alt="" class="img-fluid blog-img">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h2 class="title">
                  <a href="" class="blog-title">${item.title}</a>
                </h2>
                <div class="d-flex align-items-center">
                  <div class="post-meta">
                    <p class="short_introduction">${item.short_introduction}</p>
                    <p class="published_on"><time>${item.published_on}</time></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p>${item.description}</p>
          <div class="mb-3">
            <a href="" class="enroll-this-course"><i class="bi bi-journal-plus"></i> Click to Enroll in Course</a>
          </div>
          <div class="service-box">
            <h4>Download Course</h4>
            <div class="download-catalog">
              <a href="#" onclick="window.open('${baseURL}${item.custom_course_document}')" ><i class="bi bi-filetype-pdf"></i><span>Course PDF</span></a>
              <a href="#"><i class="bi bi-file-earmark-word"></i><span>Course DOC</span></a>
            </div>
          </div>
        </article>
      </div>`;

    // Append to respective container based on navtype
    if (navtype === "1") {
      blogContainer.insertAdjacentHTML("beforeend", newo);
    }
    if (navtype === "0") {
      blogContainer2.insertAdjacentHTML("beforeend", newo);
    }
   
    


  });
};


// Tab button references
let Live_Courses_Btn = document.getElementById('nav-home-tab');
let Upcoming_Courses_Btn = document.getElementById('nav-profile-tab');
let Enrolled_Courses_Btn = document.getElementById('nav-registered-tab');

// Upcoming Courses Tab Clicked
Upcoming_Courses_Btn.addEventListener('click', () => {
  let currentValue = sessionStorage.getItem("courseCategory");
  sessionStorage.setItem("navtype", "0");
  get_dynaic_course_list(currentValue, "0");
});

// Live Courses Tab Clicked
Live_Courses_Btn.addEventListener('click', () => {
  let currentValue = sessionStorage.getItem("courseCategory");
  sessionStorage.setItem("navtype", "1");
  get_dynaic_course_list(currentValue, "1");
});

// On page load, select first category and load "Under Graduation" live courses
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('.services-list a');
  links.forEach(link => {
    let courseType=sessionStorage.getItem('courseCategory')
    const course = link.textContent.trim();
    console.log("link",link,course);
    if (course === courseType) {
      link.classList.add("active");
    }else{
      link.classList.remove("active");
    }
    
    
  });
  const firstLink = links[0];
  
  // firstLink.classList.add("active");

  // sessionStorage.setItem('courseCategory', 'Under Graduation');
  sessionStorage.setItem("navtype", "1");
  let courseType=sessionStorage.getItem('courseCategory')

  get_dynaic_course_list(courseType, "1");
let homebtn=document.getElementById("home")
console.log("home btn is clicked",homebtn);


});


let homebtn=document.getElementById("header")
homebtn.addEventListener("click",(e)=>{
  e.preventDefault
  console.log("home btn is clicked");
  
})