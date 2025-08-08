import { FrappeApiClient } from '../services/FrappeApiClient.js'

let frappe_client = new FrappeApiClient();
let episodes = [];

async function fetchPodcast(id) {
    try {
        let res = await frappe_client.get('/get_podcast_details', { name: id });
        episodes = res?.message?.data?.episodes || [];
        renderEpisodes();
        playEpisode(0);
    } catch (err) { console.error(err); }
}

function getVideoDuration(url, callback) {
    let video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
        let seconds = Math.floor(video.duration);
        let minutes = Math.floor(seconds / 60);
        let secs = seconds % 60;
        callback(`${minutes}:${secs.toString().padStart(2, '0')}`);
    };
}

function getVideoThumbnail(url, callback) {
    let video = document.createElement('video');
    video.src = url;
    video.crossOrigin = "anonymous"; // in case of CORS
    video.preload = 'metadata';
    video.muted = true; // needed in some browsers for autoplay
    video.playsInline = true;

    video.onloadeddata = () => {
        // Seek to 1 second to avoid black frames
        video.currentTime = 1;
    };

    video.onseeked = () => {
        let canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/png'));
    };
}




function playEpisode(i) {
    if (!episodes[i]) return;
    let src = (frappe_client.baseURL || location.origin) + episodes[i].podcast_file;
    document.getElementById('video_source').src = src;
    let player = document.getElementById('video_player');
    player.load(); player.play();
}

getVideoDuration(`${frappe_client.baseURL}/files/podcast_episode.mp4`, (duration) => {
    console.log("Video Duration:", duration);
});

function renderEpisodes() {
    let list = document.getElementById("episode_list");
    list.innerHTML = '';
    episodes.forEach((ep, i) => {
        let videoUrl = `${frappe_client.baseURL}${ep.podcast_file}`;
        getVideoDuration(videoUrl, (duration) => {
            getVideoThumbnail(videoUrl, (thumbnail) => {
                list.insertAdjacentHTML("beforeend", `
                    <a href="#" class="list-group-item d-flex w-100 justify-content-between">
                        <div class="pr-2">
                            <img src="${thumbnail}" class="img-fluid" width="100">
                        </div>
                        <div class="w-100">
                            <div class="d-flex w-100 justify-content-between">
                                <h5>${ep?.title || "No Title"}</h5><small>${duration}</small>
                            </div><small>Jay Thadeshwar</small>
                        </div>
                    </a>
                `);
                list.lastElementChild.addEventListener("click", e => {
                    e.preventDefault();
                    playEpisode(i);
                });
            });
        });
    });
}



document.addEventListener("DOMContentLoaded", () => {
    fetchPodcast(new URLSearchParams(location.search).get('id'));
});
