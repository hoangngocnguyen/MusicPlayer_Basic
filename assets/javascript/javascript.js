// 1. Xử lí chữ chạy
let marqueeAnimation = '';
function handlerMarqueeText(element) {
    if (element.scrollWidth > element.clientWidth) {
        const marqueeDouble = `<span>${element.textContent}</span><span>${element.textContent}</span>`
        element.innerHTML = marqueeDouble;      
        element.children[1].style.paddingRight = "calc(50%)";
        element.children[0].style.paddingRight = "calc(50%)";
        
        marqueeAnimation = element.animate(
            [
                { transform: 'translateX(0%)'},
                { transform: 'translateX(0%)'},
                { transform: `translateX(-${element.scrollWidth / 2}px)`}
            ],
            {
                duration: 8000,  // 6s
                iterations: Infinity,
                easing: 'linear'
            }
        );
    } else {
        marqueeAnimation = element.animate(
            [
                { transform: 'translateX(0%)'},
                { transform: 'translateX(0%)'}
            ],
            {
                duration: 6000,  // 6s
                iterations: Infinity,
                easing: 'linear'
            }
        );
    }
}


// Danh sách cần xử lí
/**
 * 1. Render songs --> OK
 * 2. Scroll top    --> OK
 * 3. Play / pause --> OK
 * 4. Range music progress (seek: tìm kiếm) --> OK
 * 5.1 Set time during playing audio --> OK
 * 5.2 CD rotate --> OK
 * 6. next / prev --> 95%
 * 7. Random --> OK
 * 8. Repeat 1 / Repeat PlayList --> OK
 * 11. When the audio ended (1. next, 2. repeat) ---> OK
 * 9. Active song (name) --> OK
 * 10. Play song when click ---> OK
 * 11. Press Enter to play / pause ---> OK
 * 12. Press Right, Left to seek ---> OK
 * 13. Volume input
 */

/** BUG
 * 1. Thanh range khi chuyển bài dấu chấm rơi vào giữa rồi về ban đầu
 * 
 */

// HÀM format time dạng 2 số mm::ss
function formatTime(time) {
    return time.toString().padStart(2, '0');
}


// Các biến
const dashboard = document.querySelector('.dashboard')
const headerMusicName = document.querySelector('.header__music-name');
const audio = document.getElementById('audio');
const cd = document.querySelector('.cd');
const cdThumbnail = document.querySelector('.cd-thumbnail');
const playBtn = document.querySelector('.btn-toggle-play');
const prevBtn = document.querySelector('.btn-prev');
const nextBtn = document.querySelector('.btn-next')
const repeatBtn = document.querySelector('.btn-repeat')
const shuffleBtn = document.querySelector('.btn-shuffle')
const progress = document.getElementById('progress');
const currentTimeElement = document.querySelector('.progress-time__current')
const totalTimeElement = document.querySelector('.progress-time__total')

const playlist = document.querySelector('.playlist');

const volumeInput = document.getElementById('volumeInput');
const volumePercent = document.querySelector('.volume-percent');



const PLAYER_STORAGE_KEY = "PLAYER_STORAGE_KEY";
let app = {
    songs: [
        {
            name: "Lặng Lẽ Say Mê Remix",
            author: "ARS Remix",
            audioSrc: "./assets/music/những-lời-dối-gian--ars-remix--nhạc-hot-tiktok-2023-cực-chiến--haianh-music.mp3",
            thumbnailSrc: "https://i1.sndcdn.com/artworks-YzTYnlxm3EfYVX9S-HPoH3g-t500x500.jpg"
        },
        {
            name: "The Hills x Where Have You Been",
            author: "Thereon Remix",
            audioSrc: "./assets//music//TheHill-nhạc-hot-tiktok-2023--lq-music.mp3",
            thumbnailSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh4P3SLuJqmwFt24qU7RdW_esuPQSbWJJJ4w&s"
        },
        {
            name: "Cheri Cheri Lady (Remix)",
            author: "Vũ Kem Remix",
            audioSrc: "./assets/music/Cheri Cheri Lady I Vũ Kem Remix.mp3",
            thumbnailSrc: "https://i1.sndcdn.com/artworks-O4v1zpA3zuCkb2yl-NKfVvQ-t500x500.jpg"
        },
        {
            name: "Em Là Kẻ Đáng Thương Remix",
            author: "Luna Music",
            audioSrc: "./assets/music/Em Là Kẻ Đáng Thương Remix - Luna Music  Nhạc Hot Tik Tok [ Nhớ Đeo Tai Nghe ].mp3",
            thumbnailSrc: "https://avatar-ex-swe.nixcdn.com/song/2023/01/05/c/a/8/d/1672878969008_640.jpg"
        },
        {
            name: "Anh thèm được ngủ",
            author: "Khói",
            audioSrc: "./assets/music/AnhThemDuocNgu-Khoi.mp3",
            thumbnailSrc: "./assets/img/AnhThemDuocNgu-Khoi.jpg"
        },
        {
            name: "Careless Whisper (Cover)",
            author: "First To Eleven",
            audioSrc: "./assets/music/Careless Whisper - George Michael (Acoustic Cover by First To Eleven).mp3",
            thumbnailSrc: "https://i.scdn.co/image/ab6761610000e5ebfe0f3ad2c4a002e99e23a490"
        },
        {
            name: "Tài liệu không có tiêu đề",
            author: "Khói",
            audioSrc: "./assets/music/TaiLieuKhongCoTieuDe-Khoi.mp3",
            thumbnailSrc: "./assets/img/TaiLieuKhongCoTieuDe-Khoi.jpg"
        },
        {
            name: "Love In The Rain (Cover)",
            author: "Thành Khuê An",
            audioSrc: "./assets/music/Cuộc tình trong cơn mưa - thành khuê an.mp3",
            thumbnailSrc: "https://t3.ftcdn.net/jpg/05/61/99/50/360_F_561995097_a0dHcJrC2lCdOj6CBp6xBeGYv0hCsMyM.jpg"
        },
        {
            name: "Chưa bao giờ - Remix",
            author: "Trường Alex Remix",
            audioSrc: "./assets/music/truong-alex-remix-bay-gio-em-biet-vi-sao-gap-nhau-bien-xo-song-trao-remix.mp3",
            thumbnailSrc: "./assets/img/ChuaBaoGioRemix.png"
        }
    ],
    
    currentIndex: 0,
    get currentSong() {
        return this.songs[this.currentIndex];
    },
    currentVolume: audio.volume,
    get isPlaying() {
        return !audio.paused;
    },
    isRepeating: false,
    isShuffling: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig(property, value) {
        // Thêm thuộc tính cho object "config" (obj. hoặc obj[""])
        this.config[property] = value;
        // Đẩy lên storage
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    loadConfig() {
        audio.loop = this.config.isRepeat;
        repeatBtn.classList.toggle('active', audio.loop);

        this.isShuffling = this.config.isShuffling || false;
        shuffleBtn.classList.toggle('active', this.isShuffling);
    },
    setUpCD() {
        // Thay ảnh, tên ở dashboard (bài hiện tại)
        // Gắn src audio (bài hiện tại)
        var currentSong = this.currentSong;
        headerMusicName.textContent = currentSong.name;
        cdThumbnail.style.backgroundImage = `url(${currentSong.thumbnailSrc})`;
        audio.src = `${currentSong.audioSrc}`

        handlerMarqueeText(headerMusicName);
    },
    activeSong() {
        this.setUpCD();

        // Active song current: 
        const songElements = document.querySelectorAll('.song');
        const songActive = songElements[app.currentIndex];

        songElements.forEach(function(songElement) {
            songElement.classList.remove('active');
        })
        songActive.classList.add('active');
    },
    renderSongs() {
        // Tạo ra 1 playlist audio
        let htmls = this.songs.map(function(song, index) {
            return `
            <div class="song">
                <div class="song-thumbnail" style="background-image: url(${song.thumbnailSrc});"></div>
                <div class="content">
                    <h3 class="song__name">${song.name}</h3>
                    <p class="song__author">${song.author}</p>
                </div>
                <div class="option" data-option="${index}">
                    <i class="fa-solid fa-ellipsis"></i>
                    <ul class="option-list">
                        <li class="option-item">
                            <a href="${song.audioSrc}" download="${song.name}" class="option-link option-download">Tải bài hát</a>
                        </li>
                    </ul>
                </div>
            </div>`
        })
        
        playlist.innerHTML = htmls.join('')
        this.activeSong();
    },
    get randomSongIndex () {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random()*app.songs.length);
        } while (randomIndex === app.currentIndex)

        return randomIndex;
    },
    playNextSong() {
        // Đổi bài + setup CD
        if (!app.isShuffling) {
            app.currentIndex++;
            if (app.currentIndex >= app.songs.length) {
                app.currentIndex = 0;
            }
        } else {
            app.currentIndex = app.randomSongIndex;
        }
        
        app.activeSong();
        audio.play();
    },
    playPrevSong() {
        // Đổi bài + setup CD
        if (!app.isShuffling) {
            app.currentIndex--;
            if (app.currentIndex < 0) {
                app.currentIndex = app.songs.length - 1;
            }
        } else {
            app.currentIndex = app.randomSongIndex;
        }

        app.activeSong();
        audio.play();
    },
    setUpTimeFormat(element, totalTime) {
        let minutes = Math.floor(totalTime / 60);
        let hours = 0;
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes = Math.floor(minutes % 60);
        }
        let seconds = Math.floor(totalTime % 60);

        let hoursFormat = `${formatTime(hours)}:`;
        element.textContent = `${hours > 0 ? hoursFormat: ''}${formatTime(minutes)}:${formatTime(seconds)}`;
    },
    
    handleEvent() {
        const songElements = document.querySelectorAll('.song');
        const options = document.querySelectorAll('.option')

        // Xử lí Scroll top ở playlist, cd thu lại
        const cdThumbnailHeight = cdThumbnail.clientHeight;
        window.onscroll = function() {
            let scrollTop = document.documentElement.scrollTop;
            let cdWidthRest = cdThumbnailHeight - scrollTop < 0 ? 0 : cdThumbnailHeight - scrollTop;
            cdThumbnail.style.height = `${cdWidthRest}px`
            cdThumbnail.style.width = `${cdWidthRest}px`
            cd.style.opacity = cdWidthRest / cdThumbnailHeight;

            // xử lí vòng tròn nhỏ
            var beforeElementWidth = (30 * cdWidthRest / cdThumbnailHeight);
            var borderWidth = (10 * cdWidthRest / cdThumbnailHeight);

            // Change css
            cdThumbnail.style.setProperty("--width", `${beforeElementWidth}px`);
            cdThumbnail.style.setProperty("--border-width", `${borderWidth}px`);
        }

        // Xử lí khi click nút play / pause:
        playBtn.onclick = function() {
            if (!app.isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        }

        // Xử lí khi nhấn keyboard
        document.onkeydown = function(event) {
            // Viết mã  prevent Default ở đây khiến không thể F12 bật console

            // Play / pause
            if (event.key === ' ') {
                // Ngăn chặn hành vi mặc định: scroll
                event.preventDefault();
                playBtn.click();
            }

            // Seek
            if (event.key === 'ArrowLeft') {
                audio.currentTime -= 5; 
            }
            if (event.key === 'ArrowRight') {
                audio.currentTime += 5; 
            }

            // Up / Down volume (max: 1.0 default, lo relate with device)
            if (event.key == 'ArrowUp' && audio.volume <= 1.0) {
                // Ngăn chặn hành vi mặc định: scroll
                event.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.05)
            }
            
            if (event.key == 'ArrowDown' && audio.volume >= 0) {
                // Ngăn chặn hành vi mặc định: scroll
                event.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.05)
            }
        }


        // Khi play / pause : 
        audio.onpause = function() {
            playBtn.classList.remove('playing')
            cdThumbnail.style.animationPlayState = 'paused';
        }
        audio.onplay = function() {
            playBtn.classList.add('playing')
            cdThumbnail.style.animation = "rotateCD 6s linear infinite"
        }
          
    
        
        // Xử lí seek
        audio.onloadedmetadata = function() {
            // Cập nhật phần tử thời gian (ban đầu & tổng)
            app.setUpTimeFormat(currentTimeElement, 0);
            app.setUpTimeFormat(totalTimeElement, audio.duration);
            
            
            progress.oninput = function() {
                audio.currentTime = progress.value * audio.duration / 100;
            }

            audio.ontimeupdate = function() {
                // Kiem tra nhac co the phat duoc chua
                if (audio.readyState >= 2) {
                    progress.value = audio.currentTime * 100  / audio.duration;
                } else {
                    progress.value = 0;
                }

                // Xử lí màu
                var value =  progress.value / progress.max * 100 ;
                progress.style.background = 'linear-gradient(to right,var(--primary-color) 0%,var(--primary-color) ' + value + '%, #fff ' + value + '%, white 100%)';
                
                // Xử lí cập nhật thời gian hiện tại
                app.setUpTimeFormat(currentTimeElement, audio.currentTime)
            }
            
            
        }

        
        // Xử lí next, prev
        nextBtn.onclick = app.playNextSong;
        prevBtn.onclick = app.playPrevSong;


        // When on / off shuffle button (=>next / prev)
        shuffleBtn.onclick = function() {
            app.isShuffling = !app.isShuffling;
            shuffleBtn.classList.toggle('active', app.isShuffling);
            app.setConfig("isShuffling", app.isShuffling);
        }
        
        // When on / off repeat button
        repeatBtn.onclick = function() {
            audio.loop = !audio.loop;
            repeatBtn.classList.toggle('active', audio.loop);                app.setConfig("isRepeat", true);
            app.setConfig("isRepeat", audio.loop);
        }


        // When the audio ended (=> repeat / next)
        audio.onended = function() {
            if (!audio.loop) {
                app.playNextSong();
            }
        }

        // When click song in playlist => play
        
        songElements.forEach(function(songElement, index) {
            songElement.onclick = function() {
                app.currentIndex = index;
                app.activeSong();
                audio.play();
            }
        })

        // When click option
        options.forEach(function(option) {
            option.addEventListener('click', function(e) {
                // Ngăn chặn việc click song lan vào option
                e.stopPropagation() 
            })
        })


    

        // When volume change
        audio.onvolumechange = function() {
            volumePercent.textContent = `${Math.floor(audio.volume * 100)}%`
            
            if (audio.volume === 0) {
                $('.volume-icon').addClass('muted')
            } else {
                $('.volume-icon').removeClass('muted')
            }
        }
        // On / Muted When Click volume button
        $('.volume-icon--on').click(function() {
            // Update currentVolume ==> return old volume when click muted button
            app.currentVolume = audio.volume;
            // Reset volume
            audio.volume = 0;
            $('.volume-icon').addClass('muted')
        })
        $('.volume-icon--muted').click(function() {
            audio.volume = app.currentVolume;
            $('.volume-icon').removeClass('muted')
        })

        
    },
    start() {
        // Load config
        this.loadConfig();

        this.renderSongs();
        // Set up volume percent
        volumePercent.textContent = `${Math.floor(audio.volume * 100)}%`
         
        this.handleEvent();

        // Xử lí chữ chạy
        const songNames = document.querySelectorAll('.song__name')
        const authorNames = document.querySelectorAll('.song__author')
        songNames.forEach(function(songName) {
            handlerMarqueeText(songName)
        }) 
        authorNames.forEach(function(authorName) {
            handlerMarqueeText(authorName)
        })
        

        // Margin top cho playlist
        var dashboardHeight = $('.dashboard').height();
        console.log(dashboardHeight)
        $('.playlist').css('margin-top', `${dashboardHeight + 16}px`)
    }
}

app.start();










