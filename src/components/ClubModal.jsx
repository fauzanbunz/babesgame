import { itemDB, rarityColors } from '../data/items';

export default function ClubModal({ gameState, updateGameState, showToast, onClose }) {
    
    // Kalkulasi Skor Style secara Real-Time
    let totalScore = 0;
    const scoreBreakdown = [];
    
    ['clothes', 'accessories', 'glasses'].forEach(cat => {
        const itemName = gameState.equipped[cat];
        if (itemName && itemDB[itemName]) {
            const item = itemDB[itemName];
            totalScore += item.score;
            scoreBreakdown.push(
                <div key={itemName} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{itemName} <span style={{ fontSize: '8px', color: rarityColors[item.rarity] }}>({item.rarity})</span></span>
                    <span>+{item.score}</span>
                </div>
            );
        }
    });

    const handleJoinContest = () => {
        if (gameState.quests.contestJoined) {
            showToast("Already registered for this week!"); return;
        }
        if (gameState.player.babes < 50) {
            showToast("Need 50 $babes to enter!"); return;
        }
        
        const reward = totalScore * 3; // Hadiah sesuai dengan skor!
        
        updateGameState('player', { 
            babes: gameState.player.babes - 50 + reward,
            xp: gameState.player.xp + 50 
        });
        updateGameState('stats', { babesEarned: gameState.stats.babesEarned + reward });
        updateGameState('quests', { contestJoined: true });
        
        showToast(`Paid 50 fee. Scored ${totalScore}! Won ${reward} $babes & +50 XP!`);
    };

    const handleVote = (babeId) => {
        if (!gameState.quests.voted) {
            updateGameState('player', { xp: gameState.player.xp + 20 });
            updateGameState('quests', { voted: true });
            showToast(`Voted for ${babeId}! Quest Done: +20 XP`);
        } else {
            showToast(`Voted for ${babeId}! Thanks.`);
        }
    };

    return (
        <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">BABES CLUB // CONTEST</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body">
                <div className="col-left" style={{ flex: 1.2 }}>
                    <div className="modal-section" style={{ flex: 1 }}>
                        <h4 className="section-title">COMMUNITY VOTE</h4>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div className="nft-large" style={{ borderColor: 'var(--powder-pink)', padding: '30px 10px' }}>Babes #102</div>
                                <button className="btn btn-pink" style={{ padding: '10px', fontSize: '12px' }} onClick={() => handleVote('#102')}>VOTE #102</button>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div className="nft-large" style={{ padding: '30px 10px' }}>Babes #888</div>
                                <button className="btn" style={{ padding: '10px', fontSize: '12px' }} onClick={() => handleVote('#888')}>VOTE #888</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-right" style={{ flex: 0.8 }}>
                    <div className="modal-section" style={{ flex: 1, textAlign: 'center' }}>
                        <h4 className="section-title" style={{ color: 'var(--powder-pink)' }}>THIS WEEK'S THEME</h4>
                        <h3 style={{ fontFamily: "'Press Start 2P'", color: 'var(--lake-blue)', fontSize: '14px', marginTop: 0 }}>SUMMER PARTY</h3>
                        
                        <div style={{ background: 'rgba(152, 205, 204, 0.1)', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '2px dashed var(--pastel-turquoise)', textAlign: 'left' }}>
                            <p style={{ fontWeight: 800, color: 'var(--lake-blue)', margin: '0 0 10px 0', fontSize: '12px', textAlign: 'center' }}>STYLE SCORE (60%)</p>
                            <div style={{ fontSize: '12px', lineHeight: 2, color: 'var(--lake-blue)', fontWeight: 'bold' }}>
                                {scoreBreakdown.length > 0 ? scoreBreakdown : <div style={{textAlign: 'center', opacity: 0.5}}>No items equipped</div>}
                            </div>
                            <hr style={{ border: '1px dashed var(--pastel-turquoise)', margin: '10px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', color: 'var(--powder-pink)' }}>
                                <span>TOTAL SCORE:</span> <span>{totalScore}</span>
                            </div>
                        </div>

                        <button className="btn btn-gold" onClick={handleJoinContest} style={{ opacity: gameState.quests.contestJoined ? 0.5 : 1 }}>
                            {gameState.quests.contestJoined ? 'REGISTERED ✓' : 'PAY 50 $BABES TO JOIN'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}