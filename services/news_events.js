import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
export async function getCourseList() {
    let frappe_client = new FrappeApiClient();
    try {

        
        let res = await frappe_client.getResourses('/News');
        // console.log("res",res);
        let response = await frappe_client.get('/lms.lms.utils.get_courses');
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
                console.log("hi");
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
    let courseCategoryType = sessionStorage.getItem('courseCategory');
    document.getElementById("courseTypeName").innerHTML = courseCategoryType + ' Courses';
    let ugCourseContent = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
    let pgCourseContent = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
    let CertificationContent = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
    if(courseCategoryType == "Certification"){
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
    const userLoginStatus = JSON.parse(sessionStorage.getItem("user_info"));
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
    showEnrolledCourseList();
    getandSetDyanamicCourseDetailsAndName();
    getCourseList();
});