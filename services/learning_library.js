import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
export async function getCourseList() {
    let frappe_client = new FrappeApiClient();
    try {
        let response = await frappe_client.get('/lms.lms.utils.get_courses',{course_type:null});
        if(response){
            document.getElementById("loader").style.display = "none";
        }
        console.log("response",response);
        // Live Cources 
        let liveCources = response.message.live;
        if (liveCources.length > 0) {
            let template = document.getElementById("blog-template");
            let blogContainer = document.getElementById("blog-container");
            liveCources.forEach(post => {
                if (post) {
                    let newCard = template.cloneNode(true);
                    newCard.classList.remove("d-none");
                    newCard.querySelector(".blog-img").src = post.image
                        ? ENV.API_BASE_URL + post.image
                        : "assets/img/blog/default.jpg";
                    newCard.querySelector(".post-category").textContent = post.category || "Uncategorized";
                    newCard.querySelector(".blog-title").textContent = post.title || "No Title";
                    newCard.querySelector(".short_introduction").textContent = post.short_introduction || "Unknown";
                    newCard.querySelector(".published_on").textContent = "Published Date : " +  post.published_on || "No Date";
                    blogContainer.appendChild(newCard);
                }
            });
        }
        // New Cources ...
        let newCources = response.message.new;
        console.log("newCources",newCources);
        if (newCources.length > 0) {
            let template2 = document.getElementById("blog-template-2");
            let blogContainer2 = document.getElementById("blog-container-2");
            document.getElementById("blog-container-2").innerHTML = "";
            newCources.forEach(post => {
                if (post) {
                    let newCard2 = template2.cloneNode(true);
                    newCard2.classList.remove("d-none-2");
                    newCard2.querySelector(".blog-img-2").src = post.image
                        ? ENV.API_BASE_URL + post.image
                        : "assets/img/blog/default.jpg";
                    newCard2.querySelector(".post-category-2").textContent = post.category || "Uncategorized";
                    newCard2.querySelector(".blog-title-2").textContent = post.title || "No Title";
                    newCard2.querySelector(".short_introduction-2").textContent = post.short_introduction || "Unknown";
                    newCard2.querySelector(".published_on-2").textContent = "Published Date : " +  post.published_on || "No Date";
                    blogContainer2.appendChild(newCard2);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
}

export async function getandSetDyanamicCourseDetailsAndName() {

    let courseCategoryType = localStorage.getItem('courseCategory');
    document.getElementById("courseTypeName").innerHTML = courseCategoryType + ' Courses';
    let ugCourseContent = 'Academy is currently offering one course under this program.  A under graduation course is earned through experiential learning.  This experiential learning program is conducted through classroom sessions, field classes, online classes, and field practice with much emphasis on learning by doing.  Graduation courses follows multiple entry-exit policy where students will be able to exit after each year, if necessary, and continue the course later through earned credits.​'
    let pgCourseContent = 'Academy is currently offering a two-year post graduation course that is earned through experiential learning.  This experiential learning program is conducted through classroom sessions, field classes, online classes, and field practice with much emphasis on learning by doing.​'
    let CertificationContent = 'Academy is currently offering two certificate courses.  Academy emphasis on the experiential learning even if these are certificate courses.  Certificate courses are either online or are delivered through the hybrid mode of learning like classroom sessions, field classes, online classes, and field practice. These are non-credit courses.  Certificates may have a validity period to keep-up with the new knowledge in the respective field.​'
    if(courseCategoryType == "Certificate"){
        document.getElementById("courseContentsDetails").innerHTML = CertificationContent;
    }else if(courseCategoryType == "Post Graduation"){
        document.getElementById("courseContentsDetails").innerHTML = pgCourseContent;
    }else{
        document.getElementById("courseContentsDetails").innerHTML = ugCourseContent;
    }    
}


export async function showEnrolledCourseList() {
    const LoginCard = document.getElementById("corseRestrictedInfoCard");
    const cardDetailsList = document.getElementById("enrolledCourses");
    const signinTab = document.getElementById("signin");
    const userLoginStatus = JSON.parse(localStorage.getItem("user_info"));
    // console.log("userLoginStatus",userLoginStatus);
    if (userLoginStatus.message == "Logged In") {
        LoginCard.style.display = "none"; // hide it
        cardDetailsList.style.display = "block"; // show it
      } else {
        LoginCard.style.display = "block"; //show it
        cardDetailsList.style.display = "none"; // hide it
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // showEnrolledCourseList();
    getandSetDyanamicCourseDetailsAndName();
    // getCourseList();
});