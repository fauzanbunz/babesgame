export default function QuestModal({ gameState, onClose }) {
    const missions = [
        { id: 'dailyClaimed', title: 'Claim Daily Reward in The Hut', xp: 10 },
        { id: 'outfitChanged', title: 'Change your outfit in The Hut', xp: 15 },
        { id: 'visitedCafe', title: 'Visit The Cafe', xp: 10 },
        { id: 'chatted', title: 'Talk to Babes at the Cafe', xp: 20 },
        { id: 'itemBought', title: 'Buy one item from The Shop', xp: 25 }
    ];

    return (
        <div className="babes-modal" style={{ maxWidth: '600px', display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">DAILY MISSIONS</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body" style={{ flexDirection: 'column', overflowY: 'auto' }}>
                <p style={{ fontSize: '14px', marginTop: 0 }}>Complete activities to earn XP and progress your level.</p>
                
                <div>
                    {missions.map(m => {
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