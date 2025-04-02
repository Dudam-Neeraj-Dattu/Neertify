console.log('Script loaded successfully!');

let library = {};
let currentPlaylist = '';
let isPlaying = false;
let currentSong = new Audio();
let currentSongIndex = 0;
let currentSongName = '';
let started = false;

const toggleMenu = () => {
    const open = document.querySelector('.open');

    const close = document.querySelector('.close');

    const leftContainer = document.querySelector('.leftContainer');

    open.addEventListener('click', () => {
        leftContainer.style.left = '0px';
    });

    close.addEventListener('click', () => {
        leftContainer.style.left = '-100%';
    });
}

const getPlaylists = async () => {
    let a = await fetch('http://127.0.0.1:3000/songs/')
    let text = await a.text()
    // console.log(text);
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.querySelectorAll('td a');
    let folderNames = Array.from(links).map(a => a.textContent.replace("/", "")).slice(1);
    return folderNames;
}

const libraryObject = async (playlistName) => {
    let songs = await fetch(`http://127.0.0.1:3000/songs/${playlistName}`);
    let text = await songs.text()
    // console.log(text);
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.querySelectorAll('td a');
    let songNames = Array.from(links).map(a => a.textContent.replace("/", "")).slice(1);

    songNames.sort((a, b) => {
        let numA = parseInt(a.split('.')[0]);
        let numB = parseInt(b.split('.')[0]);
        return numA - numB;
    });

    let songlist = [];
    let songsObject = {};
    songNames.forEach(name => {
        let songName = name.split('.')[1].slice(1);
        let songFileName = name.replaceAll(" ", "%20");
        let audioSrcUrl = `http://127.0.0.1:3000/songs/${playlistName}/${songFileName}`;
        songsObject[songName] = audioSrcUrl;
        songlist.push(songName);
    });
    return songsObject;
}

const populatePlaylists = async (names) => {
    let playlistElement = document.querySelector('.playlists');

    names.forEach(name => {
        let div = document.createElement('div');
        div.classList.add('playlist');

        let img = document.createElement('img');
        img.src = `img/playlistCover/${name.toLowerCase()}.png`;
        img.alt = name;

        let h3 = document.createElement('h3');
        h3.textContent = name;

        div.appendChild(img);
        div.appendChild(h3);

        playlistElement.appendChild(div);
    });

    for (const name of names) {
        library[name] = await libraryObject(name);
    }

    currentPlaylist = names[0];
    currentSongIndex = 0;
    currentSongName = Object.keys(library[currentPlaylist])[currentSongIndex];
    currentSong = new Audio(Object.values(library[currentPlaylist])[currentSongIndex]);
    console.log(library);
    console.log('Playlists populated successfully.');
};

const populateSongs = async (songs) => {
    let ulElement = document.querySelector('.songsList ul');

    // Clear existing list (optional)
    ulElement.innerHTML = '';

    songs.forEach(song => {
        // Create <li> element
        let li = document.createElement('li');

        // Create <div class="song">
        let songDiv = document.createElement('div');
        songDiv.classList.add('song');

        // Create <img> for music icon
        let musicImg = document.createElement('img');
        musicImg.classList.add('invert');
        musicImg.src = 'img/music.svg';
        musicImg.alt = 'Music Icon';

        // Create <p> for song name
        let songName = document.createElement('p');
        songName.textContent = song;

        // Create <p> for "Play Now"
        let playText = document.createElement('p');
        playText.textContent = 'Play Now';

        // Create <img> for play button
        let playImg = document.createElement('img');
        playImg.classList.add('invert');
        playImg.src = 'img/play.svg';
        playImg.alt = 'Play Button';

        // Append elements inside <div class="song">
        songDiv.appendChild(musicImg);
        songDiv.appendChild(songName);
        songDiv.appendChild(playText);
        songDiv.appendChild(playImg);

        // Append <div class="song"> inside <li>
        li.appendChild(songDiv);

        // Append <li> to <ul>
        ulElement.appendChild(li);
    });

    // console.log('Songs populated successfully.');
};

const secondsToMinutesSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


const main = async () => {
    const folderNames = await getPlaylists();
    // console.log(folderNames);
    await populatePlaylists(folderNames);
    await populateSongs(Object.keys(library[folderNames[0]]));

    //toggling the playlist populates the songs in the list
    let togglePlaylist = document.querySelectorAll('.playlist');

    togglePlaylist.forEach(playlist => {
        playlist.addEventListener('click', async () => {
            let playlistName = playlist.textContent;
            await populateSongs(Object.keys(library[playlistName]));

            currentPlaylist = playlist;
            currentSongIndex = 0;
            if (currentSong) {
                currentSong.pause();
                currentSong.currentTime = 0;
            }
            currentSong = new Audio(Object.values(songsObject)[currentSongIndex]);

            currentSongName = Object.keys(songsObject)[currentSongIndex];

            console.log(`Current song: ${currentSongName}`, `Current playlist: ${currentPlaylist}`);

            let songDisplay = document.querySelector('.songName h3');
            songDisplay.innerHTML = currentSongName;
        });
    });


    let togglePlay = document.querySelector('.controlIcons img:nth-child(2)');
    togglePlay.addEventListener('click', async () => {
        if (!isPlaying) {
            currentSong.play();
            isPlaying = true;
            started = true;
            togglePlay.src = 'img/pause.svg';
        }
        else if (isPlaying) {
            currentSong.pause();
            isPlaying = false;
            togglePlay.src = 'img/play.svg';
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".timeStamp h3").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        if (currentSong.currentTime === currentSong.duration) {
            isPlaying = false;
            togglePlay.src = 'img/play.svg';
        }
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })


}

toggleMenu();
main();


