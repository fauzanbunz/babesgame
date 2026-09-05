import { useState } from 'react';
import { itemDB, rarityColors } from '../data/items';
import CharacterPreview from './CharacterPreview';

export default function HutModal({ gameState, updateGameState, showToast, userNFTs, selectedTokenIndex, setSelectedTokenIndex, onClose }) {
    const [mainTab, setMainTab] = useState('wardrobe');
    const [subTab, setSubTab] = useState('bikini');
    const [nameInput, setNameInput] = useState('');
    // PERBAIKAN: state untuk menampung traits NFT yang di-fetch oleh CharacterPreview,
    // supaya bisa ditampilkan sebagai daftar teks di sisi kanan preview.
    const [nftTraits, setNftTraits] = useState([]);

    const IPFS_BASE = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";

    // Ambil object NFT yang sedang aktif
    const activeNFT = userNFTs[selectedTokenIndex];
    const activeTokenId = activeNFT ? Number(activeNFT.id) : 0;

    // Reset traits saat ganti NFT yang dipilih, supaya tidak nampilin trait NFT lama
    // sesaat sebelum data yang baru selesai di-fetch.
    const handleSelectToken = (index) => {
        setNftTraits([]);
        setSelectedTokenIndex(index);
    };

    const handleSaveName = () => {
        if (nameInput.trim() !== "") {
            updateGameState('player', { name: nameInput });
            showToast("Profile name saved!");
            setNameInput('');
        }
    };

    const handleClaimDaily = () => {
        if (gameState.quests.dailyClaimed) {
            showToast("You already claimed today!"); return;
        }
        updateGameState('player', { babes: gameState.player.babes + 25, xp: gameState.player.xp + 10 });
        updateGameState('stats', { babesEarned: gameState.stats.babesEarned + 25 });
        updateGameState('quests', { dailyClaimed: true });
        showToast("Claimed: +25 $babes & +10 XP");
    };

    const handleEquip = (itemName, category) => {
        updateGameState('equipped', { [category]: itemName });
        updateGameState('quests', { outfitChanged: true });
        showToast(`Equipped: ${itemName} on Babes #${activeTokenId}`);
    };

    const renderInventory = (cat) => {
        // HANYA MENAMPILKAN ITEM YANG KAMU MILIKI DI STATE INVENTORY (Bukan semua isi Shop)
        const itemsList = gameState.inventory[cat] || [];

        if (itemsList.length === 0) {
            return (
                <div style={{ padding: '20px', color: 'var(--lake-blue)', textAlign: 'center', fontWeight: 'bold', width: '100%' }}>
                    Kamu belum memiliki {cat} tambahan. Silakan beli di The Shop!
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
                <div key={itemName} className="item-square" onClick={() => handleEquip(itemName, cat)} style={{ borderColor, background: bgStyle, display: 'flex', flexDirection: 'column', padding: '12px' }}>
                    {item && <div className="rarity-badge" style={{ background: rarityColors[item.rarity], top: '-5px', right: '-5px', left: 'auto', zIndex: 2 }}>{item.rarity}</div>}
                    
                    <div style={{ flex: 1, width: '100%', minHeight: '120px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', overflow: 'hidden' }}>
                        {item ? (
                            <img src={`${IPFS_BASE}/${folderName}/${encodeURIComponent(item.fileName)}.png`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={itemName} />
                        ) : (<span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Preview</span>)}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                        <span style={{ fontWeight: 'bold', display: 'block', fontSize: '12px' }}>{itemName}</span>
                        <span style={{ fontSize: '10px', marginTop: '4px', color: isEquipped ? 'var(--pale-marigold)' : 'var(--lake-blue)', display: 'block', fontWeight: 'bold' }}>
                            {isEquipped ? '(EQUIPPED)' : '(Equip)'}
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
                {/* PANEL KIRI: Player Card */}
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

                        {/* OPER METADATA NFT ASLI KE PREVIEW + TAMPILKAN TRAITS DI SAMPINGNYA */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div className="nft-large" style={{ padding: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 55%', aspectRatio: '1/1' }}>
                                <CharacterPreview equipped={gameState.equipped} activeNFT={activeNFT} onAttributesChange={setNftTraits} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto', maxHeight: '260px', paddingRight: '2px' }}>
                                <h4 className="section-title" style={{ margin: '0 0 2px 0', fontSize: '12px' }}>TRAITS</h4>
                                {nftTraits.length === 0 && (
                                    <span style={{ fontSize: '11px', color: 'var(--lake-blue)', opacity: 0.7 }}>Memuat traits...</span>
                                )}
                                {nftTraits.map((attr, i) => (
                                    <div key={`${attr.trait_type}-${i}`} style={{ display: 'flex', flexDirection: 'column', background: 'var(--vanilla-cream)', padding: '5px 8px', borderRadius: '6px', border: '2px solid var(--lake-blue)' }}>
                                        <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--lake-blue)', opacity: 0.7, textTransform: 'uppercase' }}>{attr.trait_type}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--lake-blue)' }}>{String(attr.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', marginTop: '12px' }}>
                            <input type="text" className="input-text" style={{ marginBottom: 0, padding: '10px', fontSize: '14px' }} placeholder="Change name..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                            <button className="btn btn-pink" onClick={handleSaveName} style={{ width: 'auto', marginBottom: 0, padding: '8px 15px', fontSize: '14px' }}>SAVE</button>
                        </div>
                        <button className="btn btn-gold" onClick={handleClaimDaily} style={{ padding: '10px', fontSize: '14px', marginBottom: 0, opacity: gameState.quests.dailyClaimed ? 0.5 : 1 }}>
                            {gameState.quests.dailyClaimed ? 'CLAIMED ✓' : 'CLAIM DAILY REWARD'}
                        </button>
                    </div>
                </div>

                {/* PANEL KANAN: Wardrobe yang Hanya Menampilkan Item Dimiliki */}
                <div className="col-right" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
