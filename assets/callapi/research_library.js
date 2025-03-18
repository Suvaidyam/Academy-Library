
(async () => {
    let frappe_client = new FrappeApiClient();

    try {
        // let params = {
        //     doctype: 'Knowledge Artifact',
        //     fieldname: 'category'
        // };
        // let response = await frappe_client.get('/get_field_meta', params); //  get field   meta        
        let response = await frappe_client.get('/get_knowledge_artifact_list'); //  get field   meta        
        console.log(response);
        let posts = response.message.artifacts;
        if (posts && posts.length > 0) {
            posts.forEach(post => {
                if (post) {
                    document.querySelector(".img-fluid").src = "https://erp-ryss.ap.gov.in" + post.attachment || "No Image";
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

