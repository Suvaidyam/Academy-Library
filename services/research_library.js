import { apiService } from "./apiService";
export const frappeApiClient = async () => {
    try {
        let response = await apiService.get('/get_knowledge_artifact_list');
        let posts = response?.message?.artifacts || [];
        console.log(posts);

        if (posts.length > 0) {
            let blogContainer = document.querySelector(".container");
            if (!blogContainer) {
                console.error("Blog container not found");
                return;
            }

            blogContainer.innerHTML = "";

            posts.forEach(post => {
                if (post) {
                    let postElement = document.createElement("div");
                    postElement.classList.add("blog-post");

                    postElement.innerHTML = `
                        <div class="post-category">${post.category || "Uncategorized"}</div>
                        <h2 class="title">${post.title || "No Title"}</h2>
                        <div class="post-author">By: ${post.internalauthor || "Unknown"}</div>
                        <div class="post-date">${post.date_of_creationpublication || "No Date"}</div>
                    `;

                    blogContainer.appendChild(postElement);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

