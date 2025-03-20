import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
export async function getCourseList() {
    let frappe_client = new FrappeApiClient();
    try {
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

document.addEventListener("DOMContentLoaded", () => {
    getCourseList();
});