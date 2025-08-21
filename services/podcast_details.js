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

    const ep = episodes[i];

    // Handle external links
    if (ep.source === "External") {
        window.open(ep.podcast_file, "_blank");
        return;
    }

    const src = frappe_client.baseURL + ep.podcast_file;
    const videoPlayer = document.getElementById('video_player');
    const audioPlayer = document.getElementById('audio_player');
    const episodeTitle = document.getElementById('episode_title');

    episodeTitle.innerHTML = ep?.title || '';

    if (ep?.file_type === "Audio") {
        // Hide video player, show audio player
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.classList.add("d-none");
        audioPlayer.classList.remove("d-none");

        document.getElementById('audio_source').src = src;
        audioPlayer.load();
        audioPlayer.play();
    } else if (ep?.file_type === "Video") {
        // Hide audio player, show video player
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.classList.add("d-none");
        videoPlayer.classList.remove("d-none");

        document.getElementById('video_source').src = src;
        videoPlayer.load();
        videoPlayer.play();
    }
}
function getYoutubeThumbnail(url) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}


async function renderEpisodes() {
    let list = document.getElementById("episode_list");
    list.innerHTML = '';

    const episodePromises = episodes.map((ep, i) => {
        let videoUrl = ep.source === 'Internal'
            ? `${frappe_client.baseURL}${ep.podcast_file}`
            : ep.podcast_file;

        if (ep.source === "Internal" && ep.file_type === "Video") {
            return new Promise(resolve => {
                getVideoDuration(videoUrl, (duration) => {
                    getVideoThumbnail(videoUrl, (thumbnail) => {
                        resolve({
                            html: `
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
                            `,
                            index: i
                        });
                    });
                });
            });
        } else if (ep.source === "Internal" && ep.file_type === "Audio") {
            return new Promise(resolve => {
                getAudioDuration(videoUrl, (duration) => {
                    resolve({
                        html: `
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
                        `,
                        index: i
                    });
                });
            });
        } else {
            return Promise.resolve({
                html: `
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
                `,
                index: i
            });
        }
    });

    const results = await Promise.all(episodePromises);
    results.sort((a, b) => a.index - b.index); // Ensure original order
    results.forEach(item => list.insertAdjacentHTML("beforeend", item.html));
}

document.addEventListener("DOMContentLoaded", () => {
    fetchPodcast(new URLSearchParams(location.search).get('id'));
});
