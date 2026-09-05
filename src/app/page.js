"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { useState, useEffect } from "react";
import { readContract, getContract } from "thirdweb";
import { getOwnedTokenIds } from "thirdweb/extensions/erc721";
import { resolveScheme } from "thirdweb/storage"; 

// IMPORT ALL MODALS
import HutModal from "../components/HutModal";
import ShopModal from "../components/ShopModal";
import MusicHUD from '../components/MusicHUD';
import CafeModal from "../components/CafeModal";
import ClubModal from "../components/ClubModal";
import GuardModal from "../components/GuardModal";
import QuestModal from "../components/QuestModal";

import { NFT_CONTRACT_ADDRESS, RPC_ENDPOINTS, makeRobinhoodChain } from "../chain-config";

const defaultState = {
    player: { name: "Babes #...", level: 1, xp: 0, babes: 1000, eth: 0.5, reputation: "Island Tourist" },
    inventory: { bikini: [], shades: [], bracelet: [], necklace: [], piercing: [] },
    equipped: { bikini: null, shades: null, bracelet: null, necklace: null, piercing: null },
    quests: { 
        dailyClaimed: false, chatted: false, itemBought: false, voted: false, 
        contestJoined: false, outfitChanged: false, visitedCafe: false,
        xFollow: false, xLike: false, xRetweet: false, xComment: false 
    },
    stats: { babesEarned: 1000, itemsOwned: 0 }
};

export default function BabesMap() {
    const account = useActiveAccount();
    const [gameState, setGameState] = useState(defaultState);
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeModal, setActiveModal] = useState(null); 
    const [toastMsg, setToastMsg] = useState('');
    const [selectedTokenIndex, setSelectedTokenIndex] = useState(0); 
    
    const [userNFTIds, setUserNFTIds] = useState([]);
    const [authStatus, setAuthStatus] = useState("loading"); 
    const [errorDetail, setErrorDetail] = useState(""); 

    // ULTIMATE DETECTION SYSTEM (SMART RADAR 666)
    useEffect(() => {
        if (!account?.address) {
            setAuthStatus("loading");
            return;
        }

        async function fetchRealAssets() {
            setAuthStatus("loading");
            let foundIds = [];
            
            console.log("🕵️ Interrogating Smart Contract for:", account.address);

            let balanceNum = null;
            let contract = null;
            let lastErr = null;

            for (const rpcUrl of RPC_ENDPOINTS) {
                try {
                    const chain = makeRobinhoodChain(rpcUrl);
                    const c = getContract({ client: client, chain: chain, address: NFT_CONTRACT_ADDRESS });

                    const bal = await readContract({
                        contract: c,
                        method: "function balanceOf(address owner) view returns (uint256)",
                        params: [account.address]
                    });

                    balanceNum = Number(bal);
                    contract = c;
                    console.log(`⚖️ NFT Balance detected: ${balanceNum}`);
                    break; 
                } catch (err) {
                    lastErr = err;
                }
            }

            if (balanceNum === null) {
                console.error("❌ All RPCs failed reading On-Chain:", lastErr);
                setErrorDetail(lastErr?.message || String(lastErr));
                setAuthStatus("error");
                return;
            }

            try {
                if (balanceNum > 0) {
                    try {
                        const owned = await getOwnedTokenIds({ contract, owner: account.address });
                        if (owned && owned.length > 0) {
                            foundIds = owned.map(id => ({ id: Number(id) }));
                        }
                    } catch (extErr) {
                        console.warn("⚠️ Standard API failed, activating Smart Radar...");
                    }

                    if (foundIds.length === 0) {
                        console.warn(`📡 Activating Smart Radar to find ${balanceNum} NFTs...`);
                        const MAX_SUPPLY = 666;
                        const BATCH_SIZE = 50; 

                        for (let i = 1; i <= MAX_SUPPLY; i += BATCH_SIZE) {
                            const batch = [];
                            for (let j = i; j < i + BATCH_SIZE && j <= MAX_SUPPLY; j++) {
                                batch.push(
                                    readContract({
                                        contract: contract,
                                        method: "function ownerOf(uint256 tokenId) view returns (address)",
                                        params: [j]
                                    }).then(owner => (owner.toLowerCase() === account.address.toLowerCase() ? { id: j } : null)).catch(() => null)
                                );
                            }
                            const results = await Promise.all(batch);
                            foundIds.push(...results.filter(res => res !== null));

                            if (foundIds.length === balanceNum) {
                                console.log("🎯 All NFTs found! Shutting down radar.");
                                break; 
                            }
                        }
                    }

                    if (foundIds.length === 0) foundIds = [{ id: 20 }]; 

                    console.log("✅ Access Granted. Registered IDs:", foundIds);
                    setUserNFTIds(foundIds);
                    setAuthStatus("granted");

                } else {
                    console.warn("⛔ Access Denied. Smart contract states 0 balance.");
                    setUserNFTIds([]);
                    setAuthStatus("denied"); 
                }
            } catch (err) {
                console.error("❌ Fatal Error processing IDs:", err);
                setErrorDetail(err?.message || String(err));
                setAuthStatus("error");
            }
        }
        
        fetchRealAssets();
    }, [account?.address]); 

    // AUTO-HARVESTER SCRIPT
    useEffect(() => {
        if (userNFTIds.length === 0) return;

        async function harvestWardrobe() {
            console.log("👗 Harvesting wardrobe from all your NFTs...");
            let newInventory = { bikini: [], shades: [], bracelet: [], necklace: [], piercing: [] };
            const chain = makeRobinhoodChain(RPC_ENDPOINTS[0]);
            const nftContract = getContract({ client: client, chain: chain, address: NFT_CONTRACT_ADDRESS });

            for (let nft of userNFTIds) {
                try {
                    const uri = await readContract({
                        contract: nftContract, method: "function tokenURI(uint256 tokenId) view returns (string)", params: [nft.id]
                    });
                    
                    let resolvedUrl = uri;
                    if (uri.startsWith("ipfs://")) resolvedUrl = resolveScheme({ client, uri: uri }); 
                    else if (uri.includes("mypinata.cloud")) resolvedUrl = uri.replace("https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/", "https://ipfs.io/ipfs/");
                    
                    const res = await fetch(resolvedUrl);
                    const data = await res.json();
                    
                    if (data.attributes) {
                        data.attributes.forEach(attr => {
                            const type = attr.trait_type?.toLowerCase();
                            const val = attr.value;
                            if (newInventory[type] && !newInventory[type].includes(val) && val !== "None") {
                                newInventory[type].push(val);
                            }
                        });
                    }
                } catch (e) {
                    console.error("❌ Failed to harvest item for NFT #" + nft.id, e);
                }
            }
            
            setGameState(prev => {
                const updatedState = { ...prev, inventory: newInventory };
                localStorage.setItem('babesGameState', JSON.stringify(updatedState));
                return updatedState;
            });
            console.log("🛍️ Auto-Wardrobe filled:", newInventory);
        }
        harvestWardrobe();
    }, [userNFTIds]); 

    useEffect(() => {
        const savedState = JSON.parse(localStorage.getItem('babesGameState'));
        if (savedState) setGameState({ ...defaultState, ...savedState });
        setIsLoaded(true);
    }, []);

    const updateGameState = (section, data) => {
        setGameState(prev => {
            const newState = { ...prev, [section]: { ...prev[section], ...data } };
            localStorage.setItem('babesGameState', JSON.stringify(newState));
            return newState;
        });
    };

    let toastTimeout;
    const showToast = (msg) => {
        setToastMsg(msg);
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => setToastMsg(''), 3000);
    };

    // PARTICLE EFFECT COORDINATES
    const sparkles = [
        // Waterfall
        { left: '30%', top: '35%', delay: '0s', size: '4px' },
        { left: '32%', top: '42%', delay: '0.5s', size: '5px' },
        { left: '27%', top: '48%', delay: '1s', size: '3px' },
        // Ocean Left
        { left: '15%', top: '80%', delay: '0.2s', size: '5px' },
        { left: '25%', top: '88%', delay: '0.7s', size: '4px' },
        { left: '10%', top: '75%', delay: '1.2s', size: '6px' },
        { left: '35%', top: '92%', delay: '0.4s', size: '3px' },
        // Ocean Right
        { left: '85%', top: '65%', delay: '0.3s', size: '4px' },
        { left: '90%', top: '72%', delay: '0.8s', size: '5px' },
        { left: '95%', top: '78%', delay: '1.1s', size: '4px' }
    ];

    if (!account) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lake-blue)' }}>
                <img src="/logo babes.svg" alt="Babes Logo" style={{ width: '250px', marginBottom: '30px' }} />
                <h2 style={{ color: 'var(--pale-marigold)', fontFamily: "'Lilita One', cursive", fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
                    YOU MUST CONNECT WALLET<br/>TO ENTER THE ISLAND
                </h2>
                <ConnectButton client={client} />
            </div>
        );
    }

    if (!isLoaded || authStatus === "loading") {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: '#fff', fontFamily: "'Lilita One', cursive" }}>Activating Blockchain Radar...</div>;
    }

    if (authStatus === "error") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lake-blue)', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'orange', fontFamily: "'Lilita One', cursive", fontSize: '28px', marginBottom: '15px' }}>CONNECTION FAILED ⚠️</h2>
                <p style={{ color: '#fff', fontSize: '16px', marginBottom: '10px', maxWidth: '400px', lineHeight: '1.5' }}>
                    The system failed to read on-chain data.
                </p>
                <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>TRY AGAIN</button>
            </div>
        );
    }

    if (authStatus === "denied") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lake-blue)', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--powder-pink)', fontFamily: "'Lilita One', cursive", fontSize: '28px', marginBottom: '15px' }}>ACCESS DENIED 🏝️</h2>
                <p style={{ color: '#fff', fontSize: '16px', marginBottom: '25px', maxWidth: '400px', lineHeight: '1.5' }}>
                    System detected 0 Babes in the Hood NFTs.
                </p>
                <ConnectButton client={client} />
            </div>
        );
    }

    const activeTokenId = userNFTIds[selectedTokenIndex] ? userNFTIds[selectedTokenIndex].id : (userNFTIds[0]?.id || 0);

    return (
        <>
            {/* SPARKLES CSS ANIMATION */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .sparkle-particle {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 6px white, 0 0 12px cyan;
                    pointer-events: none;
                    z-index: 5;
                }
            `}</style>

            <div id="game-toast" style={{ transform: toastMsg ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)', opacity: toastMsg ? 1 : 0 }}>{toastMsg}</div>
            
            <div id="map-container">
                <img id="map-frame" src="/frame2.webp" alt="Map Frame" />
                
                {/* MUSIC HUD */}
                <div style={{ position: 'absolute', bottom: '30px', left: '30px', zIndex: 50 }}>
                    <MusicHUD />
                </div>

                <img id="map-logo" src="/logo babes.svg" alt="Babes Logo" />

                <div className="hud-profile">
                    <div className="hud-avatar">BABE<br/><span style={{ fontSize: '5px', marginTop: '2px' }}>#{activeTokenId}</span></div>
                    <div className="hud-info">
                        <div className="hud-name">{gameState.player.name}</div>
                        <div className="hud-xp-container"><span>LV. {gameState.player.level}</span><span>{gameState.player.xp}/1000 XP</span></div>
                        <div className="hud-balance">🪙 {gameState.player.babes} $babes</div>
                    </div>
                </div>

                {/* DAILY QUEST BUTTON */}
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                    <button className="btn btn-gold" onClick={() => setActiveModal('quest')} style={{ padding: '10px 20px', fontSize: '14px', boxShadow: '0 5px 0 #b38b36', letterSpacing: '1px', margin: 0 }}>
                        📜 DAILY QUESTS
                    </button>
                </div>

                <img id="map-image" src="/map-babes.webp" alt="Babes Island Map" />
                
                {/* INJECT SPARKLES PARTICLES OVER THE MAP */}
                {sparkles.map((s, i) => (
                    <div key={i} className="sparkle-particle" style={{ 
                        left: s.left, top: s.top, 
                        width: s.size, height: s.size, 
                        animation: `twinkle 2s infinite ease-in-out ${s.delay}` 
                    }} />
                ))}

                <img id="airplane" src="/plane.webp" alt="Flying Plane" />
                
                {/* CALIBRATED BUILDING LABELS */}
                <div className="building-label" style={{ left: '48%', top: '57%' }} onClick={() => setActiveModal('shop')}>THE SHOP</div>
                <div className="building-label" style={{ left: '54%', top: '62%' }} onClick={() => setActiveModal('guard')}>GUARD TOWER</div>
                <div className="building-label" style={{ left: '61%', top: '45%' }} onClick={() => setActiveModal('cafe')}>THE CAFE</div>
                <div className="building-label" style={{ left: '72%', top: '25%' }} onClick={() => setActiveModal('club')}>BABES CLUB</div>
                <div className="building-label" style={{ left: '80%', top: '33%' }} onClick={() => setActiveModal('hut')}>THE HUT</div>
            </div>

            {activeModal && <div id="modal-overlay" style={{ display: 'block', opacity: 1 }} onClick={() => setActiveModal(null)}></div>}
            
            {/* RENDER ALL MODALS */}
            {activeModal === 'hut' && <HutModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} userNFTs={userNFTIds} selectedTokenIndex={selectedTokenIndex} setSelectedTokenIndex={setSelectedTokenIndex} onClose={() => setActiveModal(null)} />}
            {activeModal === 'shop' && <ShopModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} onClose={() => setActiveModal(null)} />}
            {activeModal === 'cafe' && <CafeModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} onClose={() => setActiveModal(null)} />}
            {activeModal === 'club' && <ClubModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} onClose={() => setActiveModal(null)} />}
            {activeModal === 'guard' && <GuardModal showToast={showToast} onClose={() => setActiveModal(null)} />}
            {activeModal === 'quest' && <QuestModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} onClose={() => setActiveModal(null)} />}
        </>
    );
}
