import { useState } from 'react';
import { itemDB, rarityColors } from '../data/items';

export default function ShopModal({ gameState, updateGameState, showToast, onClose }) {
    // Sesuaikan default tab dengan kategori yang ada di itemDB
    const [subTab, setSubTab] = useState('bikini');
    
    // Gunakan URL IPFS VIP yang sama dengan HutModal dan CharacterPreview
    const IPFS_BASE = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";

    // Peta folder berdasarkan kategori
    const folderMap = { 
        bikini: '04_Bikini', 
        shades: '07_Shades', 
        bracelet: '09_Bracelet', 
        necklace: '05_Necklace',
        piercing: '03_Piercing'
    };

    const handleBuyItem = (itemName) => {
        const item = itemDB[itemName];
        
        // Cek apakah pemain sudah punya item ini di inventory
        const currentInventory = gameState.inventory[item.category] || [];
        if (currentInventory.includes(itemName)) {
            showToast(`You already own ${itemName}!`);
            return;
        }

        // Cek saldo $babes
        const price = item.price || 500; // Default 500 jika tidak ada di DB
        if (gameState.player.babes >= price) {
            updateGameState('player', { babes: gameState.player.babes - price });
            const updatedCategory = [...currentInventory, itemName];
            updateGameState('inventory', { [item.category]: updatedCategory });
            updateGameState('stats', { itemsOwned: gameState.stats.itemsOwned + 1 });
            updateGameState('player', { xp: gameState.player.xp + 25 });
            updateGameState('quests', { itemBought: true }); 
            showToast(`Purchased ${item.rarity || 'Common'} ${itemName}! +25 XP`);
        } else {
            showToast("Not enough $babes!");
        }
    };

    const renderShopItems = (category) => {
        return Object.keys(itemDB).map(itemName => {
            const item = itemDB[itemName];
            
            // Render jika kategori cocok. (Tampilkan semua item, baik yang gratis maupun berbayar)
            if (item.category === category) {
                const color = rarityColors[item.rarity || 'Common'] || '#fff';
                const folderName = folderMap[category] || '04_Bikini';
                const price = item.price || 500; // Harga dummy jika belum diatur di itemDB
                
                // Cek status kepemilikan
                const isOwned = gameState.inventory[category]?.includes(itemName);

                return (
                    <div 
                        key={itemName} 
                        className="item-square" 
                        style={{ 
                            borderColor: color, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: '15px',
                            cursor: isOwned ? 'default' : 'pointer',
                            opacity: isOwned ? 0.6 : 1 // Redupkan jika sudah punya
                        }} 
                        onClick={() => !isOwned && handleBuyItem(itemName)}
                    >
                        <div className="rarity-badge" style={{ background: color, zIndex: 2 }}>
                            {item.rarity || 'Common'}
                        </div>
                        
                        <div style={{ flex: 1, width: '100%', minHeight: '200px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', overflow: 'hidden', position: 'relative' }}>
                            <img 
                                src={`${IPFS_BASE}/${folderName}/${encodeURIComponent(item.fileName)}.png`} 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1)' }} 
                                alt={itemName} 
                            />
                            {/* Label penanda jika item sudah ada di Wardrobe */}
                            {isOwned && (
                                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
                                    OWNED
                                </div>
                            )}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '16px' }}>{itemName}</span>
                            <span className="item-price" style={{ color: color, marginTop: '8px', display: 'block', fontSize: '14px' }}>
                                {isOwned ? 'PURCHASED' : `${price} $babes`}
                            </span>
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
                
                {/* Menu Navigasi Sesuai Database */}
                <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
                    <button className={`tab-btn ${subTab === 'bikini' ? 'active' : ''}`} onClick={() => setSubTab('bikini')}>BIKINI</button>
                    <button className={`tab-btn ${subTab === 'shades' ? 'active' : ''}`} onClick={() => setSubTab('shades')}>SHADES</button>
                    <button className={`tab-btn ${subTab === 'necklace' ? 'active' : ''}`} onClick={() => setSubTab('necklace')}>NECKLACE</button>
                    <button className={`tab-btn ${subTab === 'bracelet' ? 'active' : ''}`} onClick={() => setSubTab('bracelet')}>BRACELET</button>
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
