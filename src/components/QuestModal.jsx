export default function QuestModal({ gameState, updateGameState, showToast, onClose }) {
    
    // Tautan simulasi, ke depannya bisa dihubungkan ke API Twitter/X asli
    const xProfileUrl = "https://x.com/Babesinhood";
    const latestTweetUrl = "https://x.com/Babesinhood"; // Ganti dengan link post spesifik jika ada
    
    const xMissions = [
        { id: 'xFollow', title: 'Follow @Babesinhood on X', xp: 50, url: xProfileUrl },
        { id: 'xLike', title: 'Like our latest tweet', xp: 20, url: latestTweetUrl },
        { id: 'xRetweet', title: 'Retweet our latest tweet', xp: 30, url: latestTweetUrl },
        { id: 'xComment', title: 'Comment on our latest tweet', xp: 30, url: latestTweetUrl }
    ];

    const inGameMissions = [
        { id: 'dailyClaimed', title: 'Claim Daily Reward in The Hut', xp: 10 },
        { id: 'outfitChanged', title: 'Change your outfit in The Hut', xp: 15 },
        { id: 'visitedCafe', title: 'Visit The Cafe', xp: 10 },
        { id: 'chatted', title: 'Talk to Babes at the Cafe', xp: 20 },
        { id: 'itemBought', title: 'Buy one item from The Shop', xp: 25 }
    ];

    // Fungsi deteksi simulasi untuk X (Membuka tab baru, lalu verifikasi setelah 3 detik)
    const handleXTaskClick = (taskId, url, xpReward, title) => {
        if (gameState.quests[taskId]) {
            showToast("Quest already completed!");
            return;
        }

        window.open(url, '_blank');
        showToast("Detecting action on X...");

        setTimeout(() => {
            updateGameState('player', { xp: gameState.player.xp + xpReward });
            updateGameState('quests', { [taskId]: true });
            showToast(`Quest Verified: ${title} (+${xpReward} XP)`);
        }, 3000); 
    };

    return (
        <div className="babes-modal" style={{ maxWidth: '600px', display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">DAILY QUESTS // MISSIONS</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body" style={{ flexDirection: 'column', overflowY: 'auto', maxHeight: '70vh' }}>
                <p style={{ fontSize: '14px', marginTop: 0, color: 'var(--lake-blue)' }}>Complete activities to earn XP and unlock future features.</p>
                
                <h4 className="section-title" style={{ marginTop: '10px' }}>SOCIAL MISSIONS (X)</h4>
                <div style={{ marginBottom: '20px' }}>
                    {xMissions.map(m => {
                        const isDone = gameState.quests[m.id];
                        return (
                            <div key={m.id} className={`quest-item ${isDone ? 'quest-done' : ''}`} style={{ cursor: isDone ? 'default' : 'pointer' }} onClick={() => !isDone && handleXTaskClick(m.id, m.url, m.xp, m.title)}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '5px' }}>{m.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--powder-pink)' }}>Reward: +{m.xp} XP</div>
                                </div>
                                {isDone ? (
                                    <div className="quest-done-text">✓ VERIFIED</div>
                                ) : (
                                    <button className="btn" style={{ padding: '5px 15px', fontSize: '10px', margin: 0 }}>DO IT</button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <h4 className="section-title">ISLAND MISSIONS</h4>
                <div>
                    {inGameMissions.map(m => {
                        const isDone = gameState.quests[m.id];
                        return (
                            <div key={m.id} className={`quest-item ${isDone ? 'quest-done' : ''}`}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '5px' }}>{m.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--powder-pink)' }}>Reward: +{m.xp} XP</div>
                                </div>
                                {isDone ? (
                                    <div className="quest-done-text">✓ DONE</div>
                                ) : (
                                    <div style={{ color: '#ccc', fontSize: '20px' }}>□</div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <button className="btn btn-pink" onClick={onClose} style={{ marginTop: '20px' }}>BACK TO MAP</button>
            </div>
        </div>
    );
}
