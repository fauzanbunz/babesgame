"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { useState, useEffect } from "react";
import { readContract, getContract } from "thirdweb";
import { getOwnedTokenIds } from "thirdweb/extensions/erc721";
// TAMBAHAN: Senjata anti-CORS Thirdweb untuk mengisi lemari
import { resolveScheme } from "thirdweb/storage"; 

import HutModal from "../components/HutModal";
import ShopModal from "../components/ShopModal";
import MusicHUD from '../components/MusicHUD';

// Chain & RPC diimpor dari config terpusat
import { NFT_CONTRACT_ADDRESS, RPC_ENDPOINTS, makeRobinhoodChain } from "../chain-config";

const defaultState = {
    player: { name: "Babes #...", level: 1, xp: 0, babes: 1000, eth: 0.5, reputation: "Island Tourist" },
    inventory: { bikini: [], shades: [], bracelet: [], necklace: [], piercing: [] },
    equipped: { bikini: null, shades: null, bracelet: null, necklace: null, piercing: null },
    quests: { dailyClaimed: false, chatted: false, itemBought: false, voted: false, contestJoined: false, outfitChanged: false, visitedCafe: false },
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

    // 1. SISTEM DETEKSI (Menggunakan API token-balances yang terbukti sukses)
    useEffect(() => {
        if (!account?.address) {
            setAuthStatus("loading");
            return;
        }

        async function fetchRealAssets() {
            setAuthStatus("loading");
            let foundIds = [];
            
            console.log("🕵️ Interogasi Smart Contract untuk:", account.address);

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
                    console.log(`⚖️ Saldo NFT via ${rpcUrl}:`, balanceNum);
                    break; 
                } catch (err) {
                    console.warn(`⚠️ RPC gagal (${rpcUrl}):`, err?.message || err);
                    lastErr = err;
                }
            }

            if (balanceNum === null) {
                console.error("❌ Semua RPC gagal saat membaca On-Chain:", lastErr);
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
                        console.warn("⚠️ On-chain ID fetch gagal, mencoba API...", extErr);
                    }

                    if (foundIds.length === 0) {
                        try {
                            // PERBAIKAN: Kembali menggunakan jalur token-balances yang terbukti kebal error
                            const url = `https://robinhoodchain.blockscout.com/api/v2/addresses/${account.address}/token-balances`;
                            const response = await fetch(url);
                            const data = await response.json();
                            
                            const items = Array.isArray(data) ? data : (data.items || []);
                            const bbhTokens = items.filter(item =>
                                item?.token?.address?.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase()
                            );
                            
                            if (bbhTokens.length > 0) {
                                foundIds = bbhTokens.map(t => ({ 
                                    id: Number(t.token_instance?.id ?? t.token_id ?? 0) 
                                })).filter(item => item.id !== 0 && !isNaN(item.id));
                            }
                        } catch (apiErr) {
                            console.error("❌ API Blockscout Gagal:", apiErr);
                        }
                    }

                    if (foundIds.length === 0) {
                        console.warn("⚠️ Mesin pencari ID ngadat, tapi kamu sah memiliki NFT. Membuka gerbang...");
                        foundIds = [{ id: 20 }]; 
                    }

                    console.log("✅ Akses Diberikan. ID Terdaftar:", foundIds);
                    setUserNFTIds(foundIds);
                    setAuthStatus("granted");

                } else {
                    console.warn("⛔ Akses Ditolak. Smart contract menyatakan saldo 0.");
                    setUserNFTIds([]);
                    setAuthStatus("denied"); 
                }
            } catch (err) {
                console.error("❌ Fatal Error saat membaca On-Chain:", err);
                setErrorDetail(err?.message || String(err));
                setAuthStatus("error");
            }
        }
        
        fetchRealAssets();
    }, [account?.address]); 

    // 2. SCRIPT AUTO-HARVESTER (Dilindungi Jalur VIP Thirdweb)
    useEffect(() => {
        if (userNFTIds.length === 0) return;

        async function harvestWardrobe() {
            console.log("👗 Mengumpulkan koleksi baju dari semua NFT milikmu...");
            
            let newInventory = { bikini: [], shades: [], bracelet: [], necklace: [], piercing: [] };
            
            const chain = makeRobinhoodChain(RPC_ENDPOINTS[0]);
            const nftContract = getContract({ client: client, chain: chain, address: NFT_CONTRACT_ADDRESS });

            for (let nft of userNFTIds) {
                try {
                    const uri = await readContract({
                        contract: nftContract,
                        method: "function tokenURI(uint256 tokenId) view returns (string)",
                        params: [nft.id]
                    });
                    
                    let resolvedUrl = uri;
                    
                    // PERBAIKAN: Gunakan resolveScheme agar tidak diblokir CORS oleh gateway publik
                    if (uri.startsWith("ipfs://")) {
                        resolvedUrl = resolveScheme({ client, uri: uri }); 
                    } else if (uri.includes("mypinata.cloud")) {
                        resolvedUrl = uri.replace("https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/", "https://ipfs.io/ipfs/");
                    }
                    
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
                    console.error("❌ Gagal panen item untuk NFT #" + nft.id, e);
                }
            }
            
            setGameState(prev => {
                const updatedState = { ...prev, inventory: newInventory };
                localStorage.setItem('babesGameState', JSON.stringify(updatedState));
                return updatedState;
            });
            console.log("🛍️ Wardrobe otomatis penuh:", newInventory);
        }
        
        harvestWardrobe();
    }, [userNFTIds]); 

    useEffect(() => {
        const savedState = JSON.parse(localStorage.getItem('babesGameState'));
        if (savedState) {
            setGameState({ ...defaultState, ...savedState });
        }
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
        return <div style={{ textAlign: 'center', marginTop: '50px', color: '#fff', fontFamily: "'Lilita One', cursive" }}>Interrogating Smart Contract...</div>;
    }

    if (authStatus === "error") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lake-blue)', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'orange', fontFamily: "'Lilita One', cursive", fontSize: '28px', marginBottom: '15px' }}>GAGAL TERHUBUNG KE BLOCKCHAIN ⚠️</h2>
                <p style={{ color: '#fff', fontSize: '16px', marginBottom: '10px', maxWidth: '400px', lineHeight: '1.5' }}>
                    Ini BUKAN berarti NFT kamu tidak ada. Sistem gagal membaca data on-chain (RPC/network error), jadi statusnya belum bisa dipastikan.
                </p>
                <p style={{ color: '#ffcc00', fontSize: '12px', marginBottom: '25px', maxWidth: '400px', fontFamily: 'monospace' }}>
                    Detail error: {errorDetail}
                </p>
                <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>Coba Lagi</button>
            </div>
        );
    }

    if (authStatus === "denied") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lake-blue)', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--powder-pink)', fontFamily: "'Lilita One', cursive", fontSize: '28px', marginBottom: '15px' }}>ACCESS DENIED 🏝️</h2>
                <p style={{ color: '#fff', fontSize: '16px', marginBottom: '25px', maxWidth: '400px', lineHeight: '1.5' }}>
                    Sistem mendeteksi 0 saldo NFT Babes in the Hood. Pastikan kamu memakai dompet yang benar.
                </p>
                <ConnectButton client={client} />
            </div>
        );
    }

    const activeTokenId = userNFTIds[selectedTokenIndex] ? userNFTIds[selectedTokenIndex].id : (userNFTIds[0]?.id || 0);

    return (
        <>
            <div id="game-toast" style={{ transform: toastMsg ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)', opacity: toastMsg ? 1 : 0 }}>{toastMsg}</div>
            
            <div id="map-container">
                <img id="map-frame" src="/frame2.webp" alt="Map Frame" />
                <MusicHUD />
                <img id="map-logo" src="/logo babes.svg" alt="Babes Logo" />

                <div className="hud-profile">
                    <div className="hud-avatar">BABE<br/><span style={{ fontSize: '5px', marginTop: '2px' }}>#{activeTokenId}</span></div>
                    <div className="hud-info">
                        <div className="hud-name">{gameState.player.name}</div>
                        <div className="hud-xp-container"><span>LV. {gameState.player.level}</span><span>{gameState.player.xp}/1000 XP</span></div>
                        <div className="hud-balance">🪙 {gameState.player.babes} $babes</div>
                    </div>
                </div>

                <img id="map-image" src="/map-babes.webp" alt="Babes Island Map" />
                <img id="airplane" src="/plane.webp" alt="Flying Plane" />
                
                <div className="building-label" style={{ left: '46%', top: '59%' }} onClick={() => setActiveModal('shop')}>THE SHOP</div>
                <div className="building-label" style={{ left: '84%', top: '35%' }} onClick={() => setActiveModal('hut')}>THE HUT</div>
            </div>

            {activeModal && <div id="modal-overlay" style={{ display: 'block', opacity: 1 }} onClick={() => setActiveModal(null)}></div>}
            
            {activeModal === 'hut' && <HutModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} userNFTs={userNFTIds} selectedTokenIndex={selectedTokenIndex} setSelectedTokenIndex={setSelectedTokenIndex} onClose={() => setActiveModal(null)} />}
            {activeModal === 'shop' && <ShopModal gameState={gameState} updateGameState={updateGameState} showToast={showToast} onClose={() => setActiveModal(null)} />}
        </>
    );
}
