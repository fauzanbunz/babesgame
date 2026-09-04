import React, { useState, useEffect, useRef } from 'react';

// Daftar lagu Anda (Mengarah ke folder public Next.js)
const ALL_TRACKS = [
  { title: "Beach Party Tape 2", src: "/Beach Party Tape (2).mp3" },
  { title: "Boardwalk Boogie", src: "/Boardwalk Boogie.mp3" },
  { title: "Salt On My Lips (Mix 1)", src: "/Salt On My Lips (1).mp3" },
  { title: "Salt On My Lips", src: "/Salt On My Lips.mp3" },
  { title: "Salt On Skin (Mix 1)", src: "/Salt On Skin (1).mp3" },
  { title: "Salt On Skin", src: "/Salt On Skin.mp3" },
  { title: "Sand In My Cup (Mix 1)", src: "/Sand In My Cup (1).mp3" },
  { title: "Sand In My Cup", src: "/Sand In My Cup.mp3" }
];

export default function MusicHUD() {
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Saat komponen dimuat, acak urutan lagu agar selalu berbeda
    useEffect(() => {
        const shuffled = [...ALL_TRACKS].sort(() => 0.5 - Math.random());
        setPlaylist(shuffled);
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
        
        // Mainkan lagu berikutnya jika statusnya sedang Play
        if (isPlaying && audioRef.current) {
            setTimeout(() => {
                audioRef.current.play();
            }, 100);
        }
    };

    // Mencegah error jika playlist belum siap
    if (playlist.length === 0) return null;

    const currentTrack = playlist[currentIndex];

    return (
        <div className="music-hud">
            {/* Elemen Audio Tersembunyi */}
            <audio 
                ref={audioRef} 
                src={currentTrack.src} 
                onEnded={nextTrack} // Ganti lagu otomatis saat habis
            />

            {/* Equalizer Visual (Gambar A) */}
            <div className="eq-container">
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
                <div className={`eq-bar ${isPlaying ? 'playing' : ''}`}></div>
            </div>

            {/* Informasi Lagu */}
            <div className="music-info">
                <span className="music-status">{isPlaying ? 'NOW PLAYING' : 'PAUSED'}</span>
                <span className="music-title">{currentTrack.title}</span>
            </div>

            {/* Tombol Kontrol */}
            <div className="music-controls">
                <button className="music-btn" onClick={togglePlay}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button className="music-btn" onClick={nextTrack} style={{ background: 'var(--pastel-turquoise)' }}>
                    ⏭
                </button>
            </div>
        </div>
    );
}
