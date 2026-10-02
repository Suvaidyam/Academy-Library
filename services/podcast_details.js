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
        if (episodes.length > 0) {
            playEpisode(0, { autoplay: false });
        }
    } catch (err) {
        console.error(err);
    }
}

// podcast_file may be a Frappe path ("/files/x.mp4") or already a full URL.
function resolveFileUrl(path) {
    if (!path) return '';
    return /^(https?:)?\/\//i.test(path) ? path : frappe_client.baseURL + path;
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
    video.onerror = () => callback('');
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
        try {
            callback(canvas.toDataURL('image/png'));
        } catch (e) {
            // Cross-origin video without CORS headers taints the canvas
            callback('');
        }
    };
    video.onerror = () => callback('');
}

const VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|mkv)(\?|#|$)/i;
const AUDIO_EXT = /\.(mp3|wav|m4a|aac|oga|flac|opus)(\?|#|$)/i;

function getYoutubeId(url) {
    const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    return m ? m[1] : null;
}

function getDriveId(url) {
    if (!/drive\.google\.com|docs\.google\.com/i.test(url)) return null;
    const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
    return m ? m[1] : null;
}

// Works out how a podcast_file URL should be played:
//   { kind: 'embed', src, thumb }  -> iframe (YouTube, Drive, Vimeo, ...)
//   { kind: 'video' | 'audio', src } -> native player
//   { kind: 'link', src }          -> can't be played inline, open in new tab
function resolveMedia(ep) {
    const url = (ep.source === "Internal" ? resolveFileUrl(ep.podcast_file) : (ep.podcast_file || '')).trim();
    let m;

    const ytId = getYoutubeId(url);
    if (ytId) {
        return { kind: 'embed', src: `https://www.youtube.com/embed/${ytId}?rel=0`, thumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, url };
    }

    const driveId = getDriveId(url);
    if (driveId) {
        return { kind: 'embed', src: `https://drive.google.com/file/d/${driveId}/preview`, thumb: `https://drive.google.com/thumbnail?id=${driveId}&sz=w320`, url };
    }

    if ((m = url.match(/vimeo\.com\/(?:.*\/)?(?:video\/)?(\d+)/i))) {
        return { kind: 'embed', src: `https://player.vimeo.com/video/${m[1]}`, thumb: `https://vumbnail.com/${m[1]}.jpg`, url };
    }

    if ((m = url.match(/(?:dailymotion\.com\/(?:embed\/)?video\/|dai\.ly\/)([a-z0-9]+)/i))) {
        return { kind: 'embed', src: `https://www.dailymotion.com/embed/video/${m[1]}`, thumb: `https://www.dailymotion.com/thumbnail/video/${m[1]}`, url };
    }

    if ((m = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/i))) {
        return { kind: 'embed', src: `https://www.loom.com/embed/${m[1]}`, url };
    }

    if ((m = url.match(/streamable\.com\/(?:e\/)?([a-z0-9]+)/i))) {
        return { kind: 'embed', src: `https://streamable.com/e/${m[1]}`, url };
    }

    if (/facebook\.com\/.+\/videos\/|fb\.watch\//i.test(url)) {
        return { kind: 'embed', src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`, url };
    }

    if (AUDIO_EXT.test(url) || ep.file_type === "Audio") return { kind: 'audio', src: url, url };
    if (VIDEO_EXT.test(url) || ep.file_type === "Video" || ep.source === "Internal") return { kind: 'video', src: url, url };

    // Unknown external page: try it as a direct video; the error handler falls back to a link
    return { kind: 'video', src: url, url };
}

function showPlayer(kind) {
    document.getElementById('video_player').classList.toggle('d-none', kind !== 'video');
    document.getElementById('audio_player').classList.toggle('d-none', kind !== 'audio');
    document.getElementById('embed_player').classList.toggle('d-none', kind !== 'embed');
    document.getElementById('player_fallback').classList.toggle('d-none', kind !== 'link');
}

function stopAllPlayers() {
    const videoPlayer = document.getElementById('video_player');
    const audioPlayer = document.getElementById('audio_player');
    videoPlayer.pause();
    audioPlayer.pause();
    videoPlayer.removeAttribute('src');
    audioPlayer.removeAttribute('src');
    videoPlayer.onerror = null;
    audioPlayer.onerror = null;
    document.getElementById('embed_frame').src = 'about:blank';
}

function showFallback(url) {
    stopAllPlayers();
    document.getElementById('player_fallback_link').href = url || '#';
    showPlayer('link');
}

function playEpisode(i, { autoplay = true } = {}) {
    if (!episodes[i]) return;

    const ep = episodes[i];
    const media = resolveMedia(ep);

    document.getElementById('episode_title').innerHTML = ep?.title || '';
    stopAllPlayers();

    if (!media.src) {
        showFallback('');
        return;
    }

    if (media.kind === 'embed') {
        const frame = document.getElementById('embed_frame');
        const sep = media.src.includes('?') ? '&' : '?';
        // Must be set before src: live server sends Referrer-Policy: same-origin, and YouTube needs a Referer (Error 153)
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        frame.src = autoplay ? `${media.src}${sep}autoplay=1` : media.src;
        showPlayer('embed');
        return;
    }

    const player = document.getElementById(media.kind === 'audio' ? 'audio_player' : 'video_player');
    player.onerror = () => showFallback(media.url);
    player.src = media.src;
    showPlayer(media.kind);
    player.load();
    if (autoplay) player.play().catch(() => {});
}

async function renderEpisodes() {
  let list = document.getElementById("episode_list");
  list.innerHTML = "";

  const episodePromises = episodes.map((ep, i) => {
    const media = resolveMedia(ep);
    const itemHtml = (thumb, meta) => `
                    <a href="#" class="episode-item list-group-item d-flex w-100 justify-content-between" data-index="${i}">
                        <div class="pr-2">
                            ${thumb
                              ? `<img src="${thumb}" class="img-fluid" width="100" alt="" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'bi bi-play-btn fs-1 text-success'}))">`
                              : `<i class="bi bi-play-btn fs-1 text-success"></i>`}
                        </div>
                        <div class="w-100">
                            <div class="d-flex w-100 justify-content-between">
                                <h5>${ep?.title || "No Title"}</h5>
                                <small>${meta || ""}</small>
                            </div>
                            <small>${podcastDetails?.guests_name || ""}</small>
                        </div>
                    </a>
                `;

    if (media.kind === 'audio') {
      return new Promise((resolve) => {
        getAudioDuration(media.src, (duration) => {
          resolve({ html: itemHtml("../assets/img/audio_img.png", duration) });
        });
      });
    }

    if (media.kind === 'video') {
      const fallback = new Promise((resolve) =>
        setTimeout(() => resolve({ html: itemHtml("", "") }), 8000)
      );
      const loaded = new Promise((resolve) => {
        getVideoDuration(media.src, (duration) => {
          getVideoThumbnail(media.src, (thumbnail) => {
            resolve({ html: itemHtml(thumbnail, duration) });
          });
        });
      });
      // Don't let one slow/unreachable video block the whole list
      return Promise.race([loaded, fallback]);
    }

    return Promise.resolve({ html: itemHtml(media.thumb, "") });
  });

  const results = await Promise.all(episodePromises);

  results.forEach((item) => {
    list.insertAdjacentHTML("beforeend", item.html);
  });

  // ✅ Attach click event listeners AFTER inserting
  list.querySelectorAll(".episode-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const index = parseInt(el.dataset.index, 10);
      playEpisode(index);
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
    fetchPodcast(new URLSearchParams(location.search).get('id'));
});
