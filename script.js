// console.log('Script loaded successfully!');

let library = {};
let currentPlaylist = '';
let isPlaying = false;
let currentSong = null;
let currentSongIndex = 0;
let currentSongName = '';

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
    // console.log(library);
    // console.log('Playlists populated successfully.');
    let songDisplay = document.querySelector('.songName h3');
    songDisplay.innerHTML = currentSongName;
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

const playSong = async (songsObject, songIndex, songPlaylist) => {
    currentSong.src = Object.values(songsObject)[songIndex];

    currentSongName = Object.keys(songsObject)[songIndex];

    // console.log(`Current song: ${currentSongName}`, `Current playlist: ${songPlaylist}`);

    let songDisplay = document.querySelector('.songName h3');
    songDisplay.innerHTML = currentSongName;

    await currentSong.play();
    isPlaying = true;
    document.querySelector('.controlIcons img:nth-child(2)').src = 'img/pause.svg';
    document.querySelectorAll('.songsList ul li')[songIndex].querySelector('img:nth-child(4)').src = 'img/pause.svg';

}

const toggleListPlayPause = async (i) => {

    if(i === currentSongIndex) {
        if (isPlaying) {
            await currentSong.pause();
            isPlaying = false;
            document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';
            document.querySelector('.controlIcons img:nth-child(2)').src = 'img/play.svg';
            
        } else {
            await currentSong.play();
            isPlaying = true;
            document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/pause.svg';
            document.querySelector('.controlIcons img:nth-child(2)').src = 'img/pause.svg';
        }
    } else {
        document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';
        document.querySelector('.controlIcons img:nth-child(2)').src = 'img/play.svg';
        let songsObject = library[currentPlaylist];
        currentSongIndex = i;
        await playSong(songsObject, i, currentPlaylist);
    }
}

const nextSong = async () => {
    document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';
    let songsObject = library[currentPlaylist];
    currentSongIndex = (currentSongIndex + 1) % Object.keys(songsObject).length;
    await playSong(songsObject, currentSongIndex, currentPlaylist);
}

const prevSong = async () => {
    document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';
    let songsObject = library[currentPlaylist];
    currentSongIndex = (currentSongIndex - 1 + Object.keys(songsObject).length) % Object.keys(songsObject).length;
    await playSong(songsObject, currentSongIndex, currentPlaylist);
}

const main = async () => {
    const folderNames = await getPlaylists();
    // console.log(folderNames);
    await populatePlaylists(folderNames);
    await populateSongs(Object.keys(library[folderNames[0]]));
    // console.log(`Current song: ${currentSongName}`, `Current playlist: ${currentPlaylist}`);
    // Play song on click in songsList    
    let songList = document.querySelectorAll('.songsList ul li');
    // console.log(songList.length);
    for(let i = 0; i < songList.length; i++){
        songList[i].addEventListener('click', async () => {
            await toggleListPlayPause(i);
        });
    }
    //toggling the playlist populates the songs in the list
    let togglePlaylist = document.querySelectorAll('.playlist');

    togglePlaylist.forEach(playlist => {
        playlist.addEventListener('click', async () => {
            let playlistName = playlist.textContent;
            let songsObject = library[playlistName];
            await populateSongs(Object.keys(songsObject));

            currentPlaylist = playlistName;
            currentSongIndex = 0;
            await playSong(songsObject, currentSongIndex, currentPlaylist);

            // Play song on click in songsList    
            songList = document.querySelectorAll('.songsList ul li');
            // console.log(songList.length);
            for(let i = 0; i < songList.length; i++){
                songList[i].addEventListener('click', async () => {
                    await toggleListPlayPause(i);
                });
            }
        });
    });


    let togglePlay = document.querySelector('.controlIcons img:nth-child(2)');
    togglePlay.addEventListener('click', async () => {
        if (!isPlaying) {
            await currentSong.play();
            isPlaying = true;
            togglePlay.src = 'img/pause.svg';
            document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/pause.svg';
        }
        else if (isPlaying) {
            await currentSong.pause();
            isPlaying = false;
            togglePlay.src = 'img/play.svg';
            document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';
        }
    });

    let toggleNext = document.querySelector('.controlIcons img:nth-child(3)');
    toggleNext.addEventListener('click', async () => {        
        await nextSong();
    });

    let togglePrev = document.querySelector('.controlIcons img:nth-child(1)');
    togglePrev.addEventListener('click', async () => {        
        await prevSong();
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", async () => {
        document.querySelector(".timeStamp h3").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        if (currentSong.currentTime === currentSong.duration) {
            isPlaying = false;
            togglePlay.src = 'img/play.svg';
            document.querySelectorAll('.songsList ul li')[currentSongIndex].querySelector('img:nth-child(4)').src = 'img/play.svg';            
            await nextSong();
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


