// import { apiService } from "./apiService";
// export const frappeApiClient = async () => {
//     try {
//         let response = await apiService.get('/get_knowledge_artifact_list');
//         let posts = response?.message?.artifacts || [];
//         console.log(posts);

//         if (posts.length > 0) {
//             let blogContainer = document.querySelector(".container");
//             if (!blogContainer) {
//                 console.error("Blog container not found");
//                 return;
//             }

//             blogContainer.innerHTML = "";

//             posts.forEach(post => {
//                 if (post) {
//                     let postElement = document.createElement("div");
//                     postElement.classList.add("blog-post");

//                     postElement.innerHTML = `
//                         <div class="post-category">${post.category || "Uncategorized"}</div>
//                         <h2 class="title">${post.title || "No Title"}</h2>
//                         <div class="post-author">By: ${post.internalauthor || "Unknown"}</div>
//                         <div class="post-date">${post.date_of_creationpublication || "No Date"}</div>
//                     `;

//                     blogContainer.appendChild(postElement);
//                 }
//             });
//         }
//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// };


// (async () => {
//     let frappe_client = new FrappeApiClient();
//     let response = await frappe_client.get('/get_knowledge_artifact_list')
//     console.log(response, 'res')
// })();



(async () => {
    let frappe_client = new FrappeApiClient();

    try {
        let response = await frappe_client.get('/get_knowledge_artifact_list');
        let posts = response.message.artifacts;
        console.log(posts);
        if (posts && posts.length > 0) {
            let blogContainer = document.querySelector(".container");
            // let template = document.querySelector(".blog-post-template");

            // blogContainer.innerHTML = "";

            posts.forEach(post => {
                if (post) {
                    // document.querySelector(".img-fluid").src = post.image || "assets/img/blog/default.jpg";
                    document.querySelector(".post-category").textContent = post.category || "Uncategorized";
                    document.querySelector(".title").textContent = post.title || "No Title";
                    // document.querySelector(".blog-author-img").src = post.author_image || "assets/img/blog/blog-author.jpg";
                    document.querySelector(".post-author").textContent = post.internalauthor || "Unknown";
                    document.querySelector(".post-date").textContent = post.date_of_creationpublication || "No Date";
                }

            });
        }
    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
})();

