import { useState } from 'react';
import { itemDB, rarityColors } from '../data/items';

export default function ShopModal({ gameState, updateGameState, showToast, onClose }) {
    const [subTab, setSubTab] = useState('bikini');
    const [buyPopup, setBuyPopup] = useState(null); 

    const IPFS_BASE = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";

    const folderMap = { 
        bikini: '04_Bikini', 
        shades: '07_Shades', 
        bracelet: '09_Bracelet', 
        necklace: '05_Necklace',
        piercing: '03_Piercing'
    };

    const getPrice = (item) => {
        if (item.price) return item.price; 
        
        const rarity = (item.rarity || 'Common').toLowerCase();
        if (rarity === 'legendary') return 2500;
        if (rarity === 'epic') return 1000;
        if (rarity === 'rare') return 500;
        if (rarity === 'uncommon') return 250;
        return 100; 
    };

    const handleItemClick = (itemName) => {
        const item = itemDB[itemName];
        const currentInventory = gameState.inventory[item.category] || [];
        
        if (currentInventory.includes(itemName)) {
            showToast(`You already own ${itemName}!`);
            return;
        }
        setBuyPopup(itemName);
    };

    const confirmBuy = () => {
        if (!buyPopup) return;
        
        const itemName = buyPopup;
        const item = itemDB[itemName];
        const price = getPrice(item);

        if (gameState.player.babes >= price) {
            updateGameState('player', { babes: gameState.player.babes - price });
            const currentInventory = gameState.inventory[item.category] || [];
            const updatedCategory = [...currentInventory, itemName];
            updateGameState('inventory', { [item.category]: updatedCategory });
            updateGameState('stats', { itemsOwned: gameState.stats.itemsOwned + 1 });
            updateGameState('player', { xp: gameState.player.xp + 25 });
            updateGameState('quests', { itemBought: true }); 
            showToast(`Purchased ${item.rarity || 'Common'} ${itemName}! +25 XP`);
        } else {
            showToast("Not enough $babes!");
        }
        setBuyPopup(null);
    };

    const renderShopItems = (category) => {
        return Object.keys(itemDB).map(itemName => {
            const item = itemDB[itemName];
            
            if (item.category === category) {
                const color = rarityColors[item.rarity || 'Common'] || '#fff';
                const folderName = folderMap[category] || '04_Bikini';
                const price = getPrice(item);
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
                            opacity: isOwned ? 0.6 : 1 
                        }} 
                        onClick={() => !isOwned && handleItemClick(itemName)}
                    >
                        <div className="rarity-badge" style={{ background: color, zIndex: 2 }}>
                            {item.rarity || 'Common'}
                        </div>
                        
                        {/* PERBAIKAN: Frame Gambar Item Toko + Manekin */}
                        <div style={{ flex: 1, width: '100%', aspectRatio: '1/1', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden', position: 'relative' }}>
                            <img src="/manekin.png" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Mannequin" />
                            
                            <img 
                                src={`${IPFS_BASE}/${folderName}/${encodeURIComponent(item.fileName)}.png`} 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 10 }} 
                                alt={itemName} 
                            />
                            
                            {isOwned && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                                    <span style={{ color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', background: 'rgba(0,0,0,0.7)' }}>
                                        OWNED
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', fontSize: '14px' }}>{itemName}</span>
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
            
            {/* OVERLAY POPUP PEMBELIAN */}
            {buyPopup && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '14px' }}>
                    <div style={{ background: 'var(--vanilla-cream)', padding: '20px', borderRadius: '12px', border: '4px solid var(--lake-blue)', textAlign: 'center', width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        <h4 style={{ color: 'var(--lake-blue)', margin: '0 0 10px 0', fontSize: '20px', fontFamily: "'Lilita One', cursive" }}>CONFIRM PURCHASE</h4>
                        
                        {/* PERBAIKAN: Frame Gambar Popup + Manekin */}
                        <div style={{ width: '150px', height: '150px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden', position: 'relative', border: `3px solid ${rarityColors[itemDB[buyPopup].rarity || 'Common']}` }}>
                            <img src="/manekin.png" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Mannequin" />
                            
                            <img 
                                src={`${IPFS_BASE}/${folderMap[itemDB[buyPopup].category] || '04_Bikini'}/${encodeURIComponent(itemDB[buyPopup].fileName)}.png`} 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 10 }} 
                                alt={buyPopup} 
                            />
                        </div>
                        
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111', marginBottom: '5px' }}>{buyPopup}</span>
                        <span style={{ fontWeight: '900', fontSize: '18px', color: 'var(--pale-marigold)', marginBottom: '20px' }}>
                            {getPrice(itemDB[buyPopup])} $babes
                        </span>

                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button className="btn btn-gold" onClick={confirmBuy} style={{ margin: 0, flex: 1, padding: '10px' }}>BUY ITEM</button>
                            <button className="btn btn-pink" onClick={() => setBuyPopup(null)} style={{ margin: 0, flex: 1, padding: '10px' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="modal-header">
                <h3 className="modal-title">THE SHOP // MARKETPLACE</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body" style={{ flexDirection: 'column', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 800, color: 'var(--powder-pink)', fontSize: '18px' }}>
                    YOUR BALANCE: <span>{gameState.player.babes}</span> $babes
                </div>
                
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
