import React, { useState, useRef, useEffect } from 'react';

export default function MusicHUD() {
    // Daftar lagu dummy (Silakan ganti dengan URL atau file lokalmu)
    const tracks = [
        { title: "Sand In My Cup", src: "/music/track1.mp3" },
        { title: "Island Breeze", src: "/music/track2.mp3" },
        { title: "Neon Sunset", src: "/music/track3.mp3" }
    ];

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const audioRef = useRef(null);

    // Fungsi Toggle Play/Pause
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Fungsi Next Track
    const nextTrack = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
    };

    // Auto-play saat ganti lagu
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio autoplay prevented"));
            }
        }
    }, [currentTrackIndex]);

    return (
        <>
            {/* CSS ANIMASI UNTUK VISUALIZER */}
            <style>{`
                @keyframes equalize {
                    0% { height: 4px; }
                    50% { height: 25px; }
                    100% { height: 10px; }
                }
                .eq-bar {
                    width: 6px;
                    background: linear-gradient(to top, #4facfe, #f093fb, #f5576c, #fab1a0);
                    border-radius: 2px;
                    transition: height 0.2s ease;
                }
                .eq-bar.playing {
                    animation: equalize 1s infinite alternate;
                }
                .control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .control-btn:hover {
                    background: var(--powder-pink);
                    transform: scale(1.1);
                }
            `}</style>

            <div style={{
                background: 'rgba(15, 23, 42, 0.85)', // Warna latar gelap
                backdropFilter: 'blur(12px)', // Efek kaca
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                fontFamily: "'Lilita One', cursive",
                minWidth: '280px'
            }}>
                
                {/* 1. VISUALIZER SECTION DENGAN EFEK PANTULAN */}
                <div style={{ 
                    display: 'flex', 
                    gap: '4px', 
                    height: '30px', 
                    alignItems: 'flex-end',
                    /* INI ADALAH TRIK CSS UNTUK MEMBUAT PANTULAN SEPERTI GAMBAR A */
                    WebkitBoxReflect: 'below 2px linear-gradient(transparent, rgba(0,0,0,0.5))' 
                }}>
                    {[
                        { delay: '0.1s', dur: '0.8s' },
                        { delay: '0.3s', dur: '1.2s' },
                        { delay: '0.0s', dur: '0.9s' },
                        { delay: '0.4s', dur: '1.1s' },
                        { delay: '0.2s', dur: '0.7s' },
                        { delay: '0.5s', dur: '1.3s' },
                        { delay: '0.1s', dur: '0.9s' },
                    ].map((anim, idx) => (
                        <div 
                            key={idx} 
                            className={`eq-bar ${isPlaying ? 'playing' : ''}`} 
                            style={{ 
                                animationDelay: anim.delay, 
                                animationDuration: anim.dur,
                                height: isPlaying ? '15px' : '4px' // Tinggi default saat pause
                            }} 
                        />
                    ))}
                </div>

                {/* 2. TRACK INFO SECTION */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ 
                        fontSize: '10px', 
                        color: isPlaying ? 'var(--pale-marigold)' : '#94a3b8', 
                        letterSpacing: '1px',
                        marginBottom: '2px'
                    }}>
                        {isPlaying ? '▶ NOW PLAYING' : '⏸ PAUSED'}
                    </span>
                    <span style={{ 
                        fontSize: '16px', 
                        color: 'white', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {tracks[currentTrackIndex].title}
                    </span>
                </div>

                {/* 3. CONTROLS SECTION */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="control-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button className="control-btn" onClick={nextTrack} title="Next Track">
                        '⏭'
                    </button>
                </div>

                {/* HIDDEN AUDIO ELEMENT */}
                <audio 
                    ref={audioRef} 
                    src={tracks[currentTrackIndex].src} 
                    onEnded={nextTrack} // Otomatis putar lagu selanjutnya kalau habis
                />
            </div>
        </>
    );
}
