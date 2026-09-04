import { useState, useEffect } from 'react';
import { itemDB, rarityColors } from '../data/items';

export default function CafeModal({ gameState, updateGameState, showToast, onClose }) {
    const [subTab, setSubTab] = useState('chat');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { user: '[Babes #099] Alice', text: 'Welcome to the Cafe!' }
    ]);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedTradeItem, setSelectedTradeItem] = useState(null);

    // Otomatis selesaikan quest "Visit Cafe" saat komponen ini dibuka
    useEffect(() => {
        if (!gameState.quests.visitedCafe) {
            updateGameState('player', { xp: gameState.player.xp + 10 });
            updateGameState('quests', { visitedCafe: true });
            showToast('Quest Done: Visit The Cafe! +10 XP');
        }
    }, []);

    const handleSendChat = () => {
        if (chatInput.trim() === '') return;
        setChatHistory([...chatHistory, { user: `[${gameState.player.name}] You`, text: chatInput }]);
        setChatInput('');
        
        if (!gameState.quests.chatted) {
            updateGameState('player', { xp: gameState.player.xp + 20 });
            updateGameState('quests', { chatted: true });
            showToast('Quest Done: Talk to Babes! +20 XP');
        }
    };

    const renderTradeInventory = () => {
        let hasItems = false;
        const items = [];
        ['clothes', 'accessories', 'glasses'].forEach(cat => {
            gameState.inventory[cat].forEach(itemName => {
                hasItems = true;
                const item = itemDB[itemName];
                const color = rarityColors[item.rarity];
                items.push(
                    <div key={itemName} className="item-square" onClick={() => { setSelectedTradeItem(itemName); setIsInventoryOpen(false); showToast(`Item selected: ${itemName}`); }} style={{ borderColor: color, cursor: 'pointer', padding: '15px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800 }}>{itemName}</span>
                        <span style={{ fontSize: '9px', color: color, marginTop: '5px' }}>{item.rarity}</span>
                    </div>
                );
            });
        });
        return hasItems ? items : <p style={{ gridColumn: 'span 2', textAlign: 'center', fontSize: '12px' }}>Your inventory is empty.</p>;
    };

    return (
        <>
            <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
                <div className="modal-header">
                    <h3 className="modal-title">BABES CAFE // SOCIAL HUB</h3>
                    <div className="close-modal" onClick={onClose}>X</div>
                </div>
                <div className="modal-body" style={{ flexDirection: 'column' }}>
                    <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 10px auto' }}>
                        <button className={`tab-btn ${subTab === 'chat' ? 'active' : ''}`} onClick={() => setSubTab('chat')}>GLOBAL CHAT</button>
                        <button className={`tab-btn ${subTab === 'trade' ? 'active' : ''}`} onClick={() => setSubTab('trade')}>TRADE ROOM</button>
                    </div>

                    {subTab === 'chat' && (
                        <div className="modal-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="chat-list" style={{ flex: 1 }}>
                                {chatHistory.map((chat, idx) => (
                                    <div key={idx} className="chat-msg"><span className="chat-user">{chat.user}:</span> {chat.text}</div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" className="input-text" style={{ marginBottom: 0 }} placeholder="Say hello..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                                <button className="btn" onClick={handleSendChat} style={{ width: '120px', marginBottom: 0 }}>SEND</button>
                            </div>
                        </div>
                    )}

                    {subTab === 'trade' && (
                        <div className="modal-section" style={{ flex: 1 }}>
                            <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>Trade securely with other Babes in the Hood.</p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1, background: '#fafafa', border: '2px solid var(--vanilla-cream)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ color: 'var(--lake-blue)', marginTop: 0 }}>YOUR OFFER</h4>
                                    <div className="item-square" onClick={() => setIsInventoryOpen(true)} style={{ width: '60%', margin: '0 auto', background: selectedTradeItem ? 'rgba(152, 205, 204, 0.1)' : 'var(--pale-marigold)', color: selectedTradeItem ? 'var(--lake-blue)' : 'var(--white)', borderColor: selectedTradeItem ? rarityColors[itemDB[selectedTradeItem].rarity] : 'var(--pale-marigold)' }}>
                                        {selectedTradeItem ? (
                                            <>
                                                <span style={{ fontSize: '16px' }}>{selectedTradeItem}</span>
                                                <span style={{ fontSize: '10px', marginTop: '5px', fontWeight: 'normal' }}>(Click to change)</span>
                                            </>
                                        ) : <span>Select Item</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', color: 'var(--powder-pink)' }}>⇄</div>
                                <div style={{ flex: 1, background: '#fafafa', border: '2px solid var(--vanilla-cream)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ color: 'var(--lake-blue)', marginTop: 0 }}>THEIR OFFER</h4>
                                    <div className="item-square" style={{ width: '60%', margin: '0 auto', borderColor: 'var(--powder-pink)', color: 'var(--powder-pink)' }}>Target Item</div>
                                </div>
                            </div>
                            <button className="btn btn-gold" style={{ marginTop: '20px' }} onClick={() => showToast('Web3 Trade integration pending.')}>PROPOSE TRADE</button>
                        </div>
                    )}
                </div>
            </div>

            {/* SUB-MODAL INVENTORY TRADE */}
            {isInventoryOpen && (
                <div className="sub-modal" style={{ display: 'flex', zIndex: 999 }}>
                    <h3 style={{ color: 'var(--lake-blue)', fontFamily: "'Press Start 2P', cursive", fontSize: '12px', marginTop: 0, textAlign: 'center' }}>SELECT ITEM</h3>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
                        {renderTradeInventory()}
                    </div>
                    <button className="btn btn-pink" onClick={() => setIsInventoryOpen(false)}>CANCEL</button>
                </div>
            )}
        </>
    );
}