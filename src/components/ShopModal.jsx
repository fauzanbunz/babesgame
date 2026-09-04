import { useState } from 'react';
import { itemDB, rarityColors } from '../data/items';

export default function ShopModal({ gameState, updateGameState, showToast, onClose }) {
    const [subTab, setSubTab] = useState('clothes');
    
    // Link utama Pinata Anda
    const IPFS_BASE = "https://gateway.pinata.cloud/ipfs/bafybeieksckbp7kmwgedsjvlgqrqvm57qqwgu3nykch6dkrhi724ysk3qu";

    const getFileName = (itemName) => {
        if (itemName === 'Red Bikini') return 'shop_1';
        if (itemName === 'Neon Bikini') return 'shop_2';
        if (itemName === 'Baju Shop 1') return 'shop_1';
        if (itemName === 'Baju Shop 2') return 'shop_2';
        if (itemName === 'Baju Shop 3') return 'shop_3';
        if (itemName === 'Baju Shop 4') return 'shop_4';
        if (itemName === 'Baju Shop 5') return 'shop_5';
        if (itemName === 'Baju Shop 6') return 'shop_6';
        if (itemName === 'Baju Shop 7') return 'shop_7';
        if (itemName === 'Baju Shop 8') return 'shop_8';
        if (itemName === 'Baju Shop 9') return 'shop_9';
        if (itemName === 'Baju Shop 10') return 'shop_10';
        return 'cloth_default';
    };

    const handleBuyItem = (itemName) => {
        const item = itemDB[itemName];
        if (gameState.inventory[item.category].includes(itemName)) {
            showToast(`You already own ${itemName}!`);
            return;
        }
        if (gameState.player.babes >= item.price) {
            updateGameState('player', { babes: gameState.player.babes - item.price });
            const updatedCategory = [...gameState.inventory[item.category], itemName];
            updateGameState('inventory', { [item.category]: updatedCategory });
            updateGameState('stats', { itemsOwned: gameState.stats.itemsOwned + 1 });
            updateGameState('player', { xp: gameState.player.xp + 25 });
            updateGameState('quests', { itemBought: true }); 
            showToast(`Purchased ${item.rarity} ${itemName}! +25 XP`);
        } else {
            showToast("Not enough $babes!");
        }
    };

    const renderShopItems = (category) => {
        return Object.keys(itemDB).map(itemName => {
            const item = itemDB[itemName];
            if (item.category === category && item.price > 0) {
                const color = rarityColors[item.rarity];
                return (
                    <div key={itemName} className="item-square" style={{ borderColor: color, display: 'flex', flexDirection: 'column', padding: '15px' }} onClick={() => handleBuyItem(itemName)}>
                        <div className="rarity-badge" style={{ background: color, zIndex: 2 }}>{item.rarity}</div>
                        
                        {/* KOTAK ABU-ABU FULL FRAME & GAMBAR DI-ZOOM (SCALE) */}
                        <div style={{ flex: 1, width: '100%', minHeight: '200px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', overflow: 'hidden' }}>
                            {item.category === 'clothes' ? (
                                <img 
                                    src={`${IPFS_BASE}/${getFileName(itemName)}.png`} 
                                    // Scale 2.5 akan nge-zoom gambar untuk membuang area transparan yang kosong
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1)' }} 
                                    alt={itemName} 
                                />
                            ) : (
                                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Item Preview</span>
                            )}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '16px' }}>{itemName}</span>
                            <span className="item-price" style={{ color: color, marginTop: '8px', display: 'block', fontSize: '14px' }}>{item.price} $babes</span>
                        </div>
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">THE SHOP // MARKETPLACE</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body" style={{ flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 800, color: 'var(--powder-pink)', fontSize: '18px' }}>
                    YOUR BALANCE: <span>{gameState.player.babes}</span> $babes
                </div>
                <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
                    <button className={`tab-btn ${subTab === 'clothes' ? 'active' : ''}`} onClick={() => setSubTab('clothes')}>BIKINIS</button>
                    <button className={`tab-btn ${subTab === 'accessories' ? 'active' : ''}`} onClick={() => setSubTab('accessories')}>TATTOOS</button>
                    <button className={`tab-btn ${subTab === 'glasses' ? 'active' : ''}`} onClick={() => setSubTab('glasses')}>GLASSES</button>
                </div>
                <div className="modal-section" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="item-grid">
                        {renderShopItems(subTab)}
                    </div>
                </div>
            </div>
        </div>
    );
}
