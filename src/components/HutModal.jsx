import { useState } from 'react';
import { itemDB, rarityColors } from '../data/items';
import CharacterPreview from './CharacterPreview';

export default function HutModal({ gameState, updateGameState, showToast, userNFTs, selectedTokenIndex, setSelectedTokenIndex, onClose }) {
    const [mainTab, setMainTab] = useState('wardrobe');
    const [subTab, setSubTab] = useState('bikini');
    
    const [nameInput, setNameInput] = useState(gameState.player.name !== "Babes #..." ? gameState.player.name : '');
    const [nftTraits, setNftTraits] = useState([]);
    
    const [itemPopup, setItemPopup] = useState(null); 

    const IPFS_BASE = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";

    const activeNFT = userNFTs[selectedTokenIndex];
    const activeTokenId = activeNFT ? Number(activeNFT.id) : 0;

    const handleSelectToken = (index) => {
        setNftTraits([]);
        updateGameState('equipped', { bikini: null, shades: null, bracelet: null, necklace: null, piercing: null });
        setSelectedTokenIndex(index);
    };

    const handleSaveName = () => {
        if (nameInput.trim() !== "") {
            updateGameState('player', { name: nameInput });
            showToast("Global Profile Name Saved!");
        }
    };

    const handleClaimDaily = () => {
        if (gameState.quests.dailyClaimed) {
            showToast("You already claimed today!"); return;
        }
        updateGameState('player', { babes: gameState.player.babes + 25, xp: gameState.player.xp + 10 });
        updateGameState('quests', { dailyClaimed: true });
        showToast("Claimed: +25 $babes & +10 XP");
    };

    const handleActionClick = (itemName, cat) => {
        setItemPopup({ itemName, category: cat });
    };

    const confirmEquip = () => {
        if(!itemPopup) return;
        updateGameState('equipped', { [itemPopup.category]: itemPopup.itemName });
        showToast(`Equipped: ${itemPopup.itemName}`);
        setItemPopup(null);
    };

    const confirmStrip = () => {
        if(!itemPopup) return;
        updateGameState('equipped', { [itemPopup.category]: 'STRIPPED' });
        showToast(`Stripped: ${itemPopup.itemName}`);
        setItemPopup(null);
    };

    const handleMint = () => {
        showToast("MINT Init... (Requires Wallet Confirmation & Burn NFT)");
    };

    const getDisplayTrait = (cat, originalVal) => {
        const eq = gameState.equipped[cat];
        if (eq === 'STRIPPED') return 'None'; 
        if (eq) return eq; 
        return originalVal || 'None'; 
    };

    const renderInventory = (cat) => {
        const itemsList = gameState.inventory[cat] || [];

        if (itemsList.length === 0) {
            return (
                <div style={{ padding: '20px', color: 'var(--lake-blue)', textAlign: 'center', fontWeight: 'bold', width: '100%' }}>
                    You don't have any extra {cat} yet.
                </div>
            );
        }

        return itemsList.map(itemName => {
            const item = itemDB[itemName];
            const isEquipped = gameState.equipped[cat] === itemName;
            const borderColor = isEquipped ? 'var(--pale-marigold)' : rarityColors[item?.rarity || 'Common'];
            const bgStyle = isEquipped ? 'rgba(241, 187, 88, 0.2)' : '';
            const folderMap = { bikini: '04_Bikini', shades: '07_Shades', bracelet: '09_Bracelet', necklace: '05_Necklace', piercing: '03_Piercing' };
            const folderName = folderMap[cat] || '04_Bikini';

            return (
                <div key={itemName} className="item-square" onClick={() => handleActionClick(itemName, cat)} style={{ borderColor, background: bgStyle, display: 'flex', flexDirection: 'column', padding: '12px', cursor: 'pointer' }}>
                    {item && <div className="rarity-badge" style={{ background: rarityColors[item.rarity], top: '-5px', right: '-5px', left: 'auto', zIndex: 2 }}>{item.rarity}</div>}
                    
                    <div style={{ flex: 1, width: '100%', aspectRatio: '1/1', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', overflow: 'hidden', position: 'relative' }}>
                        {item ? (
                            <>
                                <img src="/manekin.png" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Mannequin" />
                                <img src={`${IPFS_BASE}/${folderName}/${encodeURIComponent(item.fileName)}.png`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 10 }} alt={itemName} />
                            </>
                        ) : (<span style={{ color: '#94a3b8', fontWeight: 'bold', zIndex: 10 }}>Preview</span>)}
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                        <span style={{ fontWeight: 'bold', display: 'block', fontSize: '12px' }}>{itemName}</span>
                        <span style={{ fontSize: '10px', marginTop: '4px', color: isEquipped ? 'var(--pale-marigold)' : 'var(--lake-blue)', display: 'block', fontWeight: 'bold' }}>
                            {isEquipped ? '(EQUIPPED)' : '(Click to Action)'}
                        </span>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">THE HUT // PLAYER HOME</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body">
                
                <div className="col-left" style={{ flex: 0.8, display: 'flex', flexDirection: 'column' }}>
                    <div className="modal-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 className="section-title" style={{ margin: 0 }}>PLAYER CARD</h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--vanilla-cream)', padding: '8px 12px', borderRadius: '12px', border: '3px solid var(--lake-blue)', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--lake-blue)' }}>SELECT NFT:</span>
                            <select 
                                value={selectedTokenIndex} 
                                onChange={(e) => handleSelectToken(Number(e.target.value))}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '2px solid var(--lake-blue)', fontWeight: 'bold', background: 'var(--white)', cursor: 'pointer', color: 'var(--lake-blue)', fontSize: '13px', outline: 'none' }}
                            >
                                {userNFTs.map((nft, index) => (
                                    <option key={index} value={index}>Babes #{Number(nft.id)}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div className="nft-large" style={{ padding: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 55%', aspectRatio: '1/1' }}>
                                <CharacterPreview equipped={gameState.equipped} activeNFT={activeNFT} onAttributesChange={setNftTraits} />
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', maxHeight: '260px', paddingRight: '2px' }}>
                                <h4 className="section-title" style={{ margin: '0 0 2px 0', fontSize: '12px' }}>TRAITS</h4>
                                
                                {(() => {
                                    const CUSTOMIZABLE = ['bikini', 'necklace', 'shades', 'bracelet'];
                                    
                                    if (nftTraits.length === 0) {
                                        return <span style={{ fontSize: '11px', color: 'var(--lake-blue)', opacity: 0.7 }}>Loading traits...</span>;
                                    }
                                    
                                    return CUSTOMIZABLE.map((cat, i) => {
                                        const origAttr = nftTraits.find(a => a.trait_type?.toLowerCase() === cat);
                                        const origVal = origAttr ? origAttr.value : 'None';
                                        const displayVal = getDisplayTrait(cat, origVal);

                                        return (
                                            <div key={`${cat}-${i}`} style={{ display: 'flex', flexDirection: 'column', background: 'var(--vanilla-cream)', padding: '5px 8px', borderRadius: '6px', border: '2px solid var(--lake-blue)' }}>
                                                <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--lake-blue)', opacity: 0.7, textTransform: 'uppercase' }}>{cat}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: displayVal === 'None' ? '#94a3b8' : 'var(--lake-blue)' }}>{displayVal}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        <button className="btn" onClick={handleMint} style={{ background: '#111', color: '#fff', border: '2px solid #333', padding: '10px', fontSize: '14px', marginBottom: '15px', letterSpacing: '1px' }}>
                            🔥 MINT (BURN & REPLACE)
                        </button>

                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <input type="text" className="input-text" style={{ marginBottom: 0, padding: '10px', fontSize: '14px' }} placeholder="Global Profile Name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                            <button className="btn btn-pink" onClick={handleSaveName} style={{ width: 'auto', marginBottom: 0, padding: '8px 15px', fontSize: '14px' }}>SAVE</button>
                        </div>
                        <button className="btn btn-gold" onClick={handleClaimDaily} style={{ padding: '10px', fontSize: '14px', marginBottom: 0, opacity: gameState.quests.dailyClaimed ? 0.5 : 1 }}>
                            {gameState.quests.dailyClaimed ? 'CLAIMED ✓' : 'CLAIM DAILY REWARD'}
                        </button>
                    </div>
                </div>

                <div className="col-right" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    
                    {itemPopup && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '14px' }}>
                            <div style={{ background: 'var(--vanilla-cream)', padding: '20px', borderRadius: '12px', border: '4px solid var(--lake-blue)', textAlign: 'center', width: '80%' }}>
                                <h4 style={{ color: 'var(--lake-blue)', margin: '0 0 15px 0', fontSize: '18px' }}>{itemPopup.itemName}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button className="btn btn-gold" onClick={confirmEquip} style={{ margin: 0 }}>EQUIP ITEM</button>
                                    <button className="btn btn-pink" onClick={confirmStrip} style={{ margin: 0 }}>STRIP (UNEQUIP)</button>
                                    <button className="btn" onClick={() => setItemPopup(null)} style={{ background: '#94a3b8', margin: 0 }}>CANCEL</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="tab-container" style={{ flexShrink: 0 }}>
                            <button className={`tab-btn ${mainTab === 'wardrobe' ? 'active' : ''}`} onClick={() => setMainTab('wardrobe')}>WARDROBE</button>
                            <button className={`tab-btn ${mainTab === 'stats' ? 'active' : ''}`} onClick={() => setMainTab('stats')}>STATS</button>
                        </div>

                        {mainTab === 'wardrobe' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <div className="tab-container" style={{ marginBottom: '10px', flexShrink: 0 }}>
                                    <button className={`tab-btn ${subTab === 'bikini' ? 'active' : ''}`} style={{ fontSize: '9px', padding: '8px' }} onClick={() => setSubTab('bikini')}>BIKINI</button>
                                    <button className={`tab-btn ${subTab === 'shades' ? 'active' : ''}`} style={{ fontSize: '9px', padding: '8px' }} onClick={() => setSubTab('shades')}>SHADES</button>
                                    <button className={`tab-btn ${subTab === 'bracelet' ? 'active' : ''}`} style={{ fontSize: '9px', padding: '8px' }} onClick={() => setSubTab('bracelet')}>BRACELET</button>
                                    <button className={`tab-btn ${subTab === 'necklace' ? 'active' : ''}`} style={{ fontSize: '9px', padding: '8px' }} onClick={() => setSubTab('necklace')}>NECKLACE</button>
                                </div>
                                <div className="item-grid" style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>{renderInventory(subTab)}</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
