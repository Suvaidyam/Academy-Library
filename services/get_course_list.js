import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
import { getandSetDyanamicCourseDetailsAndName } from "./learning_library.js";


let baseURL = new FrappeApiClient().baseURL;


// Fetch and render the course list dynamically based on course type and navtype (live/upcoming)
export async function get_dynaic_course_list(courseType, navtype) {
  // console.log("courseType==11", courseType);

  let frappe_client = new FrappeApiClient();
  try {
    // Make GET request to backend with courseType and navtype as params
    let response = await frappe_client.get('/get_all_courses', {
      course_type: courseType,
      // navtype: navtype,
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
  localStorage.setItem('navtype','1')
  getandSetDyanamicCourseDetailsAndName()


  // Add click event listener to each course category link
  const links = document.querySelectorAll('.services-list a');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();

      let course = e.currentTarget.innerText.trim(); 

      // Normalize course name
      if (course === "Graduation") {
        course = "Under Graduation";
      } else if (course === "Certificate") {
        course = "Certification";
      }

      console.log("course", course);

      // Store in localStorage
      localStorage.setItem('courseCategory', course);

      // Update course details
      getandSetDyanamicCourseDetailsAndName();

      // Fetch course list
      const navtype = localStorage.getItem("navtype");
      if (course && navtype) {
        get_dynaic_course_list(course, navtype);
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

  if (response.message.length === 0) {
    console.log("set_dynamic_course length===", response.message.length);
    document.getElementById("no-alvailable-corses").style.display = "block";
  }
  else {
    document.getElementById("no-alvailable-corses").style.display = "none";
  }

  // Loop through each course and render HTML
  response.message.forEach((item) => {
    let isLogin = sessionStorage.getItem('user_info');
    
    // console.log("Item being rendered:", item);
    const description = item.description.split(" ").slice(0, 20).join(" ");
    const newo = `
      <div class="col-lg-12" id="blog-template" data-aos="fade-up" data-aos-delay="100">
      <article>
        <div class="row newsCard">
        <div class="col-md-3" class="post-img">
          <img src="${ENV.API_BASE_URL + item.image}" alt="" class="img-fluid blog-img ">
        </div>
        <div class="col-md-6">
          <div class="card-body">
          <h2 class="title mb-1">
            <a href="https://erp-ryss.ap.gov.in/lms/courses" target="_blank" class="blog-title text-break text-wrap">${item.title}</a>
          </h2>
          <div class="d-flex align-items-center">
            <div class="post-meta">
            <p class="short_introduction my-0">${item.short_introduction}</p>
            <p class="published_on"><time>${item.published_on}</time></p>
            </div>
          </div>
          </div>
        </div>
        <div class=" col-md-3">
          <div class="download-catalog">
            <a href="#" onclick="window.open('${baseURL}${item.custom_course_doc}')" ${!isLogin ? 'disabled style="pointer-events: none; opacity: 0.6;"' : ''} ><i class="bi bi-file-earmark-word"></i><span>Brochure</span></a>
            <a href="../pages/Academic-Register" ${!isLogin ? 'disabled style="pointer-events: none; opacity: 0.6;"' : ''}><i class="bi bi-journal-plus"></i> Apply</a>
           </div>
        </div>
        </div>
        <p>${description}</p>
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

Enrolled_Courses_Btn.addEventListener('click',()=>{
  document.getElementById("no-alvailable-corses").style.display = "none";
})

// Upcoming Courses Tab Clicked
Upcoming_Courses_Btn.addEventListener('click', () => {
  let currentValue = localStorage.getItem("courseCategory");
  localStorage.setItem("navtype", "0");
  get_dynaic_course_list(currentValue, "0");
});

// Live Courses Tab Clicked
Live_Courses_Btn.addEventListener('click', () => {
  let currentValue = localStorage.getItem("courseCategory");
  localStorage.setItem("navtype", "1");
  get_dynaic_course_list(currentValue, "1");
});

// On page load, select first category and load "Under Graduation" live courses
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('.services-list a');
  const courseType = localStorage.getItem('courseCategory');

  links.forEach(link => {
    let course = link.textContent.trim();

    // Normalize course name
    if (course === "Graduation") {
      course = "Under Graduation";
    } else if (course === "Certificate") {
      course = "Certification";
    }

    console.log("link", link, course);

    // Highlight active link
    if (course === courseType) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Load dynamic course list using courseType and navtype "1"
  if (courseType) {
    get_dynaic_course_list(courseType, "1");
  }

  // Log home button element
  const homebtn = document.getElementById("home");
  console.log("home btn is clicked", homebtn);
});



