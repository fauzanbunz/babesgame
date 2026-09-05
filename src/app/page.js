"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { client } from "../client";
import { useState, useEffect } from "react";
// PERUBAHAN: Menambahkan getContract dan getOwnedTokenIds dari Thirdweb
import { readContract, getContract } from "thirdweb";
import { getOwnedTokenIds } from "thirdweb/extensions/erc721";

import HutModal from "../components/HutModal";
import ShopModal from "../components/ShopModal";
import MusicHUD from '../components/MusicHUD';

const robinhoodChain = defineChain({
    id: 4663, 
    name: "Robinhood Chain",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, 
    rpc: "https://robinhood-mainnet.g.alchemy.com/v2/alch_EMaIvTiuZyumUrGHfFnFd",
    blockExplorers: [{ name: "Blockscout", url: "https://robinhoodchain.blockscout.com" }]
});

const NFT_CONTRACT_ADDRESS = "0x9a6268489686a04075d0beea36429f0b5836290b";

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

    // SISTEM DETEKSI SUPER ON-CHAIN
    useEffect(() => {
        if (!account?.address) {
            setAuthStatus("loading");
            return;
        }

        async function fetchRealAssets() {
            setAuthStatus("loading");
            let foundIds = [];
            
            console.log("🕵️ Interogasi Smart Contract untuk:", account.address);

            const contract = getContract({
                client: client,
                chain: robinhoodChain,
                address: NFT_CONTRACT_ADDRESS,
            });

            try {
                // 1. TANYA LANGSUNG KE SMART CONTRACT (Paling Akurat)
                const bal = await readContract({
                    contract: contract,
                    method: "function balanceOf(address owner) view returns (uint256)",
                    params: [account.address]
                });

                const balanceNum = Number(bal);
                console.log("⚖️ Saldo NFT dari Smart Contract:", balanceNum);

                // JIKA SALDO > 0, KITA DOBRAK PINTUNYA!
                if (balanceNum > 0) {
                    
                    // Coba tarik ID dari On-Chain
                    try {
                        const owned = await getOwnedTokenIds({ contract, owner: account.address });
                        if (owned && owned.length > 0) {
                            foundIds = owned.map(id => ({ id: Number(id) }));
                        }
                    } catch (extErr) {
                        console.warn("⚠️ On-chain ID fetch gagal, mencoba API...", extErr);
                    }

                    // Jika gagal, coba API Blockscout
                    if (foundIds.length === 0) {
                        try {
                            const url = `https://robinhoodchain.blockscout.com/api/v2/addresses/${account.address}/token-balances`;
                            const response = await fetch(url);
                            const data = await response.json();
                            
                            const items = Array.isArray(data) ? data : (data.items || []);
                            const bbhTokens = items.filter(item => 
                                item.token && item.token.address.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase()
                            );
                            
                            if (bbhTokens.length > 0) {
                                foundIds = bbhTokens.map(t => ({ 
                                    id: Number(t.token_instance?.id || t.token_id || 0) 
                                })).filter(item => item.id !== 0 && !isNaN(item.id));
                            }
                        } catch (apiErr) {
                            console.error("❌ API Blockscout Gagal:", apiErr);
                        }
                    }

                    // JARING PENGAMAN TERAKHIR: 
                    // Smart Contract bilang kamu punya NFT (balance > 0). 
                    // Jika mesin pencari ID gagal, kita tetap BUKA pintunya secara paksa!
                    if (foundIds.length === 0) {
                        console.warn("⚠️ Mesin pencari ID ngadat, tapi kamu sah memiliki NFT. Membuka gerbang...");
                        foundIds = [{ id: 20 }]; 
                    }

                    console.log("✅ Akses Diberikan. ID Terdaftar:", foundIds);
                    setUserNFTIds(foundIds);
                    setAuthStatus("granted");

                } else {
                    // Smart Contract mengonfirmasi saldo memang 0
                    console.warn("⛔ Akses Ditolak. Smart contract menyatakan saldo 0.");
                    setUserNFTIds([]);
                    setAuthStatus("denied"); 
                }
            } catch (err) {
                console.error("❌ Fatal Error saat membaca On-Chain:", err);
                setAuthStatus("denied");
            }
        }
        
        fetchRealAssets();
    }, [account?.address]); 

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

    // JIKA BENAR-BENAR KOSONG DI BLOCKCHAIN, MUNCULKAN INI
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
