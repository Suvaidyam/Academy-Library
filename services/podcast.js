import { FrappeApiClient } from '../services/FrappeApiClient.js'

let frappe_client = new FrappeApiClient()

const fetch_podcast_lists = async () => {
    let response = await frappe_client.get('/get_podcast_data')
    console.log(response, "response")
    render_podcast_lists(response)
}
const trimWords = (text, wordLimit = 7) => {
    if (!text) return "";
    let words = text.split(/\s+/).slice(0, wordLimit);
    return words.join(" ") + (words.length >= wordLimit ? "..." : "");
}

const render_podcast_lists = (response) => {
    let podcast_container = document.getElementById('podcast_container')
    let popular_podcast = document.getElementById('popular_podcast')

    // Clear containers first
    podcast_container.innerHTML = ""
    popular_podcast.innerHTML = ""

    response.message.forEach((podcast, index) => {
        let podcast_card = `
            <div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp pt-2" data-wow-delay="0.1s">
                <div class="event-item rounded">
                    <a href="podcast-details.html" class="text-decoration-none text-dark">
                        <div class="position-relative">
                            <img src="${frappe_client.baseURL}${podcast.cover_image}" class="rounded-t md:h-[200px] w-full h-[150px] object-cover" alt="Image">
                            <div class="d-flex justify-content-between border-start border-end bg-white px-2 py-2 w-100 position-absolute" style="bottom: 0; left: 0; opacity: 0.8;">
                                <span class="bi bi-broadcast-pin pr-1"> ${podcast.episode_count || '0'} episodes</span>
                            </div>
                        </div>
                        <div class="border border-top-0 rounded-bottom p-3">
                            <span class="h6 mb-2 d-block">${podcast.title}</span>
<p class="mb-3">${trimWords(podcast.description)}</p>
                            <span class="btn btn-success rounded-pill text-white py-1 px-4">
                                <i class="bi bi-collection-play-fill"></i> Play all
                            </span>
                        </div>
                    </a>
                </div>
            </div>`

        // Render to main list
        podcast_container.insertAdjacentHTML('beforeend', podcast_card)

        // Only first few (e.g., top 4) to popular
        if (index < 4) {
            popular_podcast.insertAdjacentHTML('beforeend', podcast_card)
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    fetch_podcast_lists()
})
