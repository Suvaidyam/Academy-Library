import { FrappeApiClient } from '../services/FrappeApiClient.js'

let frappe_client = new FrappeApiClient();
let episodes = [];
let podcastDetails = {};

async function fetchPodcast(id) {
    try {
        let res = await frappe_client.get('/get_podcast_details', { name: id });
        const { episodes: eps, ...rest } = res?.message?.data || {};
        episodes = eps || [];
        podcastDetails = rest || {};

        // Set show title
        let show_title1 = document.getElementById('show_title');
        show_title1.innerHTML = podcastDetails?.title || '';

        renderEpisodes();
        if (episodes.length > 0 && episodes[0].source === "Internal") {
            playEpisode(0);
        }
    } catch (err) {
        console.error(err);
    }
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
function getAudioDuration(url, callback) {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.addEventListener("loadedmetadata", () => {
        let seconds = audio.duration;
        let h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        let m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        let s = String(Math.floor(seconds % 60)).padStart(2, '0');
        callback(`${h}:${m}:${s}`);
    });
    audio.addEventListener("error", () => {
        callback("Unknown");
    });
}

function getVideoThumbnail(url, callback) {
    let video = document.createElement('video');
    video.src = url;
    video.crossOrigin = "anonymous";
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
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

    if (episodes[i].source === "External") {
        window.open(episodes[i].podcast_file, "_blank");
        return;
    }

    let src = (frappe_client.baseURL || location.origin) + episodes[i].podcast_file;
    document.getElementById('video_source').src = src;

    let episode_title = document.getElementById('episode_title');
    episode_title.innerHTML = episodes[i]?.title || '';

    let player = document.getElementById('video_player');
    player.load();
    player.play();
}
function getYoutubeThumbnail(url) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}


function renderEpisodes() {
    let list = document.getElementById("episode_list");
    list.innerHTML = '';

    episodes.forEach((ep, i) => {
        let videoUrl = ep.source === 'Internal'
            ? `${frappe_client.baseURL}${ep.podcast_file}`
            : ep.podcast_file;

        console.log("ep.videoUrl", videoUrl);

        if (ep.source === "Internal" && ep.file_type=="Video"){
            // Internal videos: fetch metadata
            getVideoDuration(videoUrl, (duration) => {
                getVideoThumbnail(videoUrl, (thumbnail) => {
                    list.insertAdjacentHTML("beforeend", `
                        
                        <a href="#" class="list-group-item d-flex w-100 justify-content-between">
                            <div class="pr-2">
                                <img src="${thumbnail || ''}" class="img-fluid" width="100">
                            </div>
                            <div class="w-100">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5>${ep?.title || "No Title"}</h5>
                                    <small>${duration}</small>
                                </div>
                                <small>${podcastDetails?.guests_name || ''}</small>
                            </div>
                        </a>
                    `);
                    list.lastElementChild.addEventListener("click", e => {
                        e.preventDefault();
                        playEpisode(i);
                    });
                });
            });
        }else if (ep.source === "Internal" && ep.file_type == "Audio") {
            // Internal audios: fetch audio metadata
            getAudioDuration(videoUrl, (duration) => {
                list.insertAdjacentHTML("beforeend", `
                    <a href="#" class="list-group-item d-flex w-100 justify-content-between">
                        <div class="pr-2">
                            <img src="../assets/img/audio_img.png" class="img-fluid" width="100" alt="Audio">
                        </div>
                        <div class="w-100">
                            <div class="d-flex w-100 justify-content-between">
                                <h5>${ep?.title || "No Title"}</h5>
                                <small>${duration}</small>
                            </div>
                            <small>${podcastDetails?.guests_name || ''}</small>
                        </div>
                    </a>
                `);
                list.lastElementChild.addEventListener("click", e => {
                    e.preventDefault();
                    playEpisode(i);
                });
            });

        }
        else {
            // No need to fetch metadata for external links
            list.insertAdjacentHTML("beforeend", `
                
                <a href="#" class="list-group-item d-flex w-100 justify-content-between">
                    <div class="pr-2">
                        <img src=${getYoutubeThumbnail(videoUrl)} class="img-fluid" width="100" alt="No thumbnail">
                    </div>
                    <div class="w-100">
                        <div class="d-flex w-100 justify-content-between">
                            <h5>${ep?.title || "No Title"}</h5>
                            <small>External Link</small>
                        </div>
                        <small>${podcastDetails?.guests_name || ''}</small>
                    </div>
                </a>
            `);
            list.lastElementChild.addEventListener("click", e => {
                e.preventDefault();
                window.open(ep.podcast_file, "_blank");
            });
        }  
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchPodcast(new URLSearchParams(location.search).get('id'));
});
