let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let text = await response.text();
    console.log(text);
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.getElementsByTagName("a");
    let songList = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songList.push(link.href.split(`/${folder}/`)[1]);
        }
    }
    return songList;
}

const playMusic = (track, pause = false) => {
    let trackUrl = `${currFolder}${track}`;
    console.log("Playing track:", trackUrl);
    currentSong.src = trackUrl;
    if (!pause) {
        currentSong.play().then(() => {
            console.log("Playback started");
        }).catch(error => {
            console.error("Error playing the audio:", error);
        });
        play.src = "pausesong.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function main() {
    songs = await getSongs("Songs/Animal");
    playMusic(songs[0], true);

    let songUL = document.querySelector(".songList ul");
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Animesh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="playsong.svg" alt="">
                            </div></li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info div:first-child").textContent.trim();
            playMusic(track);
        });
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pausesong.svg";
        } else {
            currentSong.pause();
            play.src = "playsong.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        let currentTime = formatTime(Math.floor(currentSong.currentTime));
        let duration = formatTime(Math.floor(currentSong.duration));
        document.querySelector(".songtime").innerHTML = `${currentTime}/${duration}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburgerContainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
