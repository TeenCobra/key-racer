let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer;

let curr_track = document.createElement('audio');

let track_list = [
    {
        name: "Shipping Lanes",
        artist: "Chad Crouch",
        image: "https://img.freepik.com/free-photo/digital-art-galaxy_23-2151050729.jpg?ga=GA1.1.1076150632.1724493676&semt=ais_hybrid",
        path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3",
    },
    {
        name: "Enthusiast",
        artist: "Tours",
        image: "https://img.freepik.com/free-photo/digital-art-galaxy_23-2151050604.jpg?t=st=1724531653~exp=1724535253~hmac=01f76ffa07c190d31c3194399371e5af1a1774ceeb55f139dd2813dbf45c2588&w=740",
        path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
    },
    {
        name: "Night Owl",
        artist: "Broke For Free",
        image: "https://img.freepik.com/free-photo/beautiful-planets-space_23-2149288530.jpg?t=st=1724531570~exp=1724535170~hmac=b1147edbb111041494d13346be829b485572b1dbd9128370c6b7a44b6b6684ee&w=900",
        path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
    }
];

function loadTrack(track_index) {
    clearInterval(updateTimer);
    resetValues();
  
    curr_track.src = track_list[track_index].path;
    curr_track.load();
  
    track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
    track_name.textContent = track_list[track_index].name;
    track_artist.textContent = track_list[track_index].artist;
    now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;
  
    document.body.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  
    curr_track.addEventListener("ended", nextTrack);
  
    updateTimer = setInterval(seekUpdate, 1000);
  
    // Automatically play the track after loading it
    playTrack();
}

function resetValues() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

loadTrack(track_index);

function playpauseTrack() {
    isPlaying ? pauseTrack() : playTrack();
}

function playTrack() {
    curr_track.play().then(() => {
        isPlaying = true;
        playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
        
        // Skip to the next track after 60 seconds (1 minute)
        curr_track.addEventListener("timeupdate", function() {
            if (curr_track.currentTime >= 60) { // 60 seconds
                nextTrack();
            }
        });
    }).catch(error => {
        console.log('Autoplay failed:', error);
    });
}

function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
    if (track_index < track_list.length - 1)
        track_index += 1;
    else 
        track_index = 0;
    
    loadTrack(track_index);
    playTrack();
}

function prevTrack() {
    if (track_index > 0)
        track_index -= 1;
    else 
        track_index = track_list.length - 1;
    
    loadTrack(track_index);
    playTrack();
}

function seekTo() {
    let seekto = curr_track.duration * (seek_slider.value / 100);
    curr_track.currentTime = seekto;
}

function setVolume() {
    curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
    let seekPosition = 0;

    if (!isNaN(curr_track.duration)) {
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;

        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }

        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

function togglePlayer() {
    const player = document.getElementById('music-player');
    const musicButton = document.querySelector('.music-button');
    const unmuteButton = document.querySelector('.unmute-button');

    if (player.style.display === 'flex') {
        player.style.display = 'none';
        musicButton.style.display = 'flex';
        unmuteButton.style.display = 'flex';
    } else {
        player.style.display = 'flex';
        musicButton.style.display = 'none';
        unmuteButton.style.display = 'none';
    }
}

// Keyboard sound
// Preload multiple audio instances for instant playback
const typingSounds = [];
const maxSounds = 5; // Limit simultaneous sounds to prevent excessive memory usage

for (let i = 0; i < maxSounds; i++) {
    typingSounds.push(new Audio("https://www.fesliyanstudios.com/play-mp3/387"));
}

// Play sound instantly without delay
let soundIndex = 0;
document.addEventListener("keypress", () => {
    typingSounds[soundIndex].currentTime = 0; // Reset to start
    typingSounds[soundIndex].play().catch(error => console.log("Audio play failed", error));
    
    // Cycle through available sounds to avoid overlapping delays
    soundIndex = (soundIndex + 1) % maxSounds;
});



