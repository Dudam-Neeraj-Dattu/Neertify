console.log('Script loaded successfully!');

function toggleMenu() {
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
    
    console.log('Songs populated successfully.');
};

const updateSeekBar = async (song) => { 
    let songDisplay = document.querySelector('.songName h3');
    songDisplay.innerHTML = song
    
    
    
}
const defaultSongsLoader = async (playlistName) => {
    let songs = await fetch(`http://127.0.0.1:3000/songs/${playlistName}`);
    let text = await songs.text()
    // console.log(songsText);
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.querySelectorAll('td a');    
    let songNames = Array.from(links).map(a => a.textContent.replace("/", "")).slice(1);

    songNames.sort((a, b) => {
        let numA = parseInt(a.split('.')[0]);
        let numB = parseInt(b.split('.')[0]); 
        return numA - numB; 
    });
    
    console.log(songNames);
    
    songlist = [];
    songNames.forEach(name => {
        songlist.push(name.split('.')[1].slice(1));
    });
    console.log(songlist);
    await populateSongs(songlist);  
    await updateSeekBar(songlist[0]);
}


async function main() {
    const folderNames = await getPlaylists();    
    console.log(folderNames);
    await populatePlaylists(folderNames);
    await defaultSongsLoader(folderNames[0]);
    // await populateSongs(songs);
}

toggleMenu();
main();
