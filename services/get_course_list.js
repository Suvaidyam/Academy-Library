import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
import { getandSetDyanamicCourseDetailsAndName } from "./learning_library.js";

let baseURL = new FrappeApiClient().baseURL;

// Fetch and render the course list dynamically based on course type and navtype (live/upcoming)
export async function get_dynaic_course_list(courseType, navtype) {
  // based on navtype I have to set static contenct against each navtype, no APUI call is needed
  const blogContainer = document.getElementById("nav-home");
  let pg = `<div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e5e5e5; width:100%; font-family:Arial, sans-serif; line-height:1.6; color:#333;">

  <h2 style="margin-top:0; font-size:20px; color:#2c3e50;">
    PG Diploma in Natural Farming (NF)
  </h2>

  <p style="font-size:14px;">
    The PG Diploma in Natural Farming for Mentors is a two-year, advanced program designed to develop skilled practitioners into effective trainers, facilitators, and leaders in agroecology.
  </p>

  <p style="font-size:14px;">
    Combining deep technical knowledge with field-based learning, the course equips participants to guide farmers in adopting sustainable, evidence-based natural farming practices.
  </p>

  <p style="font-size:14px;">
    It emphasizes systems thinking, soil and ecosystem health, and participatory extension approaches, enabling mentors to support experimentation, problem-solving, and innovation at the grassroots.
  </p>

  <p style="font-size:14px;">
    Through immersive field engagement, peer learning, and expert guidance, participants become capable of nurturing climate-resilient farming communities and scaling natural farming practices across regions.
  </p>

  <p style="font-size:14px; margin-bottom:0;">
    <strong>Contact:</strong><br>
    <a href="mailto:academics.iggaarl@ryss.ap.gov.in" style="color:#1a73e8; text-decoration:none;">
      academics.iggaarl@ryss.ap.gov.in
    </a>
  </p>

</div>`;
  let ug = `<div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e5e5e5; width:100%; box-sizing:border-box; font-family:Arial, sans-serif; line-height:1.6; color:#333;">

  <h2 style="margin-top:0; font-size:20px; color:#2c3e50;">
    Farmer Scientist Course (B.Sc. in Natural Farming)
  </h2>

  <p style="font-size:14px;">
    The Farmer Scientist Course is a four-year B.Sc. in Natural Farming, designed as a hands-on, practice-oriented program to empower farmers with scientific understanding, critical thinking, and field-based problem-solving skills.
  </p>

  <p style="font-size:14px;">
    Blending traditional knowledge with modern agroecological principles, the course enables participants to observe, experiment, and innovate within their own farms.
  </p>

  <p style="font-size:14px;">
    Farmers learn to analyse soil health, crop performance, biodiversity, and local ecosystems, and to apply evidence-based practices that enhance productivity, resilience, and sustainability.
  </p>

  <p style="font-size:14px;">
    Through guided fieldwork, peer learning, and expert mentorship, participants evolve from knowledge recipients into “farmer scientists” capable of generating and sharing locally relevant solutions for sustainable agriculture and making their villages climate resilient.
  </p>

  <p style="font-size:14px; margin-bottom:0;">
    <strong>Contact:</strong><br>
    <a href="mailto:academics.iggaarl@ryss.ap.gov.in" style="color:#1a73e8; text-decoration:none;">
      academics.iggaarl@ryss.ap.gov.in
    </a>
  </p>

</div>`;
  let cert = `<div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e5e5e5; width:100%; font-family:Arial, sans-serif; line-height:1.6; color:#333;">

  <h2 style="margin-top:0; font-size:20px; color:#2c3e50;">
    Model Maker Certification Program
  </h2>

  <p style="font-size:14px;">
    The Certification Program for Natural Farming Cadres and Practitioners is designed to build deep, practical expertise in the diverse farm models innovated by APCNF.
  </p>

  <p style="font-size:14px;">
    The program equips participants with in-depth knowledge and hands-on experience to mentor fellow farmers in transitioning from conventional to natural farming through structured learning and continuous handholding support.
  </p>

  <p style="font-size:14px;">
    Tailored to different levels of experience:
  </p>

  <ul style="font-size:14px; padding-left:18px; margin-top:0;">
    <li>45-day course for mature natural farming cadres</li>
    <li>12-month course for practitioners (2+ years experience)</li>
    <li>18-month course for beginners</li>
  </ul>

  <p style="font-size:14px;">
    The <strong>Certified Model Maker</strong> track enables participants to develop specialized skills and pursue livelihoods as trainers and facilitators in natural farming model development.
  </p>

  <p style="font-size:14px; margin-bottom:0;">
    <strong>Contact:</strong><br>
    <a href="mailto:academics.iggaarl@ryss.ap.gov.in" style="color:#1a73e8; text-decoration:none;">
      academics.iggaarl@ryss.ap.gov.in
    </a>
  </p>

</div>`;

  if (courseType == "Under Graduation") {
    blogContainer.innerHTML = ug;
  }
  if (courseType == "Certification") {
    blogContainer.innerHTML = cert;
  }
  if (courseType == "Post Graduation") {
    blogContainer.innerHTML = pg;
  }
  document.getElementById("loader").style.display = "block";
  document.getElementById("loader").style.display = "none";
}
export async function get_dynaic_course_list_bk(courseType, navtype) {
  // console.log("courseType==11", courseType);

  let frappe_client = new FrappeApiClient();
  try {
    // Make GET request to backend with courseType and navtype as params
    let response = await frappe_client.get("/get_all_courses", {
      course_type: courseType,
      // navtype: navtype,
    });

    // On successful response, hide the loader and render the course list

    if (response) {
      document.getElementById("loader").style.display = "none";
      set_dynamic_course(response, navtype);
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
}

// Run once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  localStorage.setItem("navtype", "1");
  getandSetDyanamicCourseDetailsAndName();

  let courseCategory = localStorage.getItem("courseCategory");
  if (!courseCategory) {
    courseCategory = "Under Graduation";
    localStorage.setItem("courseCategory", courseCategory);
  }

  // Add click event listener to each course category link
  const links = document.querySelectorAll(".services-list a");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      let course = e.currentTarget.innerText.trim();

      // Normalize course name
      if (course === "Graduation") {
        course = "Under Graduation";
      } else if (course === "Certificate") {
        course = "Certification";
      }

      // Store in localStorage
      localStorage.setItem("courseCategory", course ?? "Certification");

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
  } else {
    document.getElementById("no-alvailable-corses").style.display = "none";
  }

  // Loop through each course and render HTML
  response.message.forEach((item) => {
    let isLogin = sessionStorage.getItem("user_info");

    // console.log("Item being rendered:", item);
    const description = item.description.split(" ").slice(0, 20).join(" ");
    const newo = `
      <div class="col-lg-12" id="blog-template" data-aos="fade-up" data-aos-delay="100">
      <article>
      <div class="row newsCard">
      <div class="col-md-3" class="post-img">
        <img src="${
          ENV.API_BASE_URL + item.image
        }" alt="" class="img-fluid blog-img ">
      </div>
      <div class="col-md-6">
        <div class="card-body">
        <h2 class="title mb-1">
        <a href="https://erp-ryss.ap.gov.in/lms/courses" target="_blank" class="blog-title text-break text-wrap">${
          item.title
        }</a>
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
        ${
          item.custom_course_doc
            ? `<a href="#" onclick="window.open('${baseURL}${item.custom_course_doc}')"  ><i class="bi bi-file-earmark-word"></i><span>Brochure</span></a>`
            : '<span class="text-muted">No Brochure</span>'
        }
       <!-- <a href="#" onclick="window.open('https://erp-ryss.ap.gov.in/app/registration/new-registration-wzzgqbwkwc#application_form_tab')" ${
         !isLogin ? 'disabled style="pointer-events: none; opacity: 0.6;"' : ""
       }><i class="bi bi-journal-plus"></i>  Apply</a> -->

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
    showApplyModal();
  });
};
// handle popup for apply course
function showApplyModal() {
  const applyBtn = document.getElementById("apply-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      // Show the modal
      const applyModal = new bootstrap.Modal(
        document.getElementById("applyModal"),
      );
      applyModal.show();
      // window.open("https://erp-ryss.ap.gov.in/app/registration/new-registration-wzzgqbwkwc#application_form_tab");
    });
  }
}
// Tab button references
let Live_Courses_Btn = document.getElementById("nav-home-tab");
let Upcoming_Courses_Btn = document.getElementById("nav-profile-tab");
let Enrolled_Courses_Btn = document.getElementById("nav-registered-tab");

Enrolled_Courses_Btn.addEventListener("click", () => {
  document.getElementById("no-alvailable-corses").style.display = "none";
});

// Upcoming Courses Tab Clicked
Upcoming_Courses_Btn.addEventListener("click", () => {
  let currentValue = localStorage.getItem("courseCategory");
  localStorage.setItem("navtype", "0");
  get_dynaic_course_list(currentValue, "0");
});

// Live Courses Tab Clicked
Live_Courses_Btn.addEventListener("click", () => {
  let currentValue = localStorage.getItem("courseCategory");
  localStorage.setItem("navtype", "1");
  get_dynaic_course_list(currentValue, "1");
});

// On page load, select first category and load "Under Graduation" live courses
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".services-list a");
  const courseType = localStorage.getItem("courseCategory");

  links.forEach((link) => {
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
