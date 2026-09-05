import { useState, useEffect, useRef } from 'react';
import { itemDB, rarityColors } from '../data/items';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CafeModal({ gameState, updateGameState, showToast, onClose }) {
    const [mainTab, setMainTab] = useState('trade'); 
    const [tradeTab, setTradeTab] = useState('market'); 
    
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]); 

    const [myOffer, setMyOffer] = useState(null);
    const [targetWant, setTargetWant] = useState(null);
    const [isSelectingFor, setIsSelectingFor] = useState(null); 

    // REFERENSI UNTUK AUTO-SCROLL
    const chatEndRef = useRef(null);

    const [marketTrades, setMarketTrades] = useState(() => {
        const savedTrades = localStorage.getItem('babesMarketTrades');
        if (savedTrades) return JSON.parse(savedTrades);
        return [
            { id: 101, user: 'Babes #099', offer: 'Neon Bikini', want: 'Multichain Golden', isMine: false },
            { id: 102, user: 'Babes #555', offer: 'Naked Black', want: 'Pirate Booty', isMine: false }
        ];
    });

    useEffect(() => {
        localStorage.setItem('babesMarketTrades', JSON.stringify(marketTrades));
    }, [marketTrades]);

    const IPFS_BASE = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";
    const folderMap = { bikini: '04_Bikini', shades: '07_Shades', bracelet: '09_Bracelet', necklace: '05_Necklace', piercing: '03_Piercing' };

    // QUEST VERIFICATION
    useEffect(() => {
        if (!gameState.quests.visitedCafe) {
            updateGameState('player', { xp: gameState.player.xp + 10 });
            updateGameState('quests', { visitedCafe: true });
            showToast('Quest Verified: Visit The Cafe! (+10 XP)');
        }
    }, []);

    // AUTO-SCROLL EFFECT
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // SUPABASE: FETCH INITIAL CHAT & SUBSCRIBE TO LIVE UPDATES
    useEffect(() => {
        const fetchInitialMessages = async () => {
            const { data, error } = await supabase
                .from('global_chat')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);
            
            if (data && !error) {
                const formatted = data.map(msg => ({ user: msg.user_name, text: msg.message }));
                setChatHistory(formatted);
            }
        };

        fetchInitialMessages();

        const channel = supabase
            .channel('public:global_chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat' }, (payload) => {
                setChatHistory(prev => [...prev, { user: payload.new.user_name, text: payload.new.message }]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel); 
        };
    }, []);

    // SUPABASE: SEND MESSAGE TO DATABASE
    const handleSendChat = async () => {
        if (chatInput.trim() === '') return;
        
        const msgToSend = chatInput;
        setChatInput(''); 
        
        const userNameFormat = `[${gameState.player.name}]`;

        const { error } = await supabase
            .from('global_chat')
            .insert([{ user_name: userNameFormat, message: msgToSend }]);

        if (error) {
            showToast("Network Error: Failed to send message.");
            console.error("Supabase Error:", error);
        } else {
            if (!gameState.quests.chatted) {
                updateGameState('player', { xp: gameState.player.xp + 20 });
                updateGameState('quests', { chatted: true });
                showToast('Quest Verified: Talk to Babes! (+20 XP)');
            }
        }
    };

    // TRADE MARKET LOGIC
    const getAvailableInventory = () => {
        const available = [];
        ['bikini', 'shades', 'bracelet', 'necklace', 'piercing'].forEach(cat => {
            if (gameState.inventory[cat]) {
                gameState.inventory[cat].forEach(item => {
                    if (gameState.equipped[cat] !== item) {
                        available.push({ name: item, category: cat });
                    }
                });
            }
        });
        return available;
    };

    const getMissingItems = () => {
        const missing = [];
        Object.keys(itemDB).forEach(itemName => {
            const cat = itemDB[itemName].category;
            if (!gameState.inventory[cat]?.includes(itemName)) {
                missing.push({ name: itemName, category: cat });
            }
        });
        return missing;
    };

    const handleListTrade = () => {
        if (!myOffer || !targetWant) {
            showToast("Please select both your offer and what you want!");
            return;
        }
        
        const newTrade = {
            id: Date.now(),
            user: gameState.player.name,
            offer: myOffer.name,
            want: targetWant.name,
            isMine: true
        };

        setMarketTrades([newTrade, ...marketTrades]);
        setMyOffer(null);
        setTargetWant(null);
        setTradeTab('market');
        showToast("Trade successfully listed on the Public Market!");
    };

    const handleAcceptTrade = (tradeId, requiredItemName, offeredItemName) => {
        const requiredItem = itemDB[requiredItemName];
        const offeredItem = itemDB[offeredItemName];

        const ownsItem = gameState.inventory[requiredItem.category]?.includes(requiredItemName);
        const isEquipped = gameState.equipped[requiredItem.category] === requiredItemName;

        if (!ownsItem) {
            showToast(`You don't own ${requiredItemName} to complete this trade!`);
            return;
        }

        if (isEquipped) {
            showToast(`Please unequip ${requiredItemName} in The Hut first!`);
            return;
        }

        showToast("INITIATING WEB3 SWAP SIGNATURE...");
        setTimeout(() => {
            const newGiverCategory = gameState.inventory[requiredItem.category].filter(i => i !== requiredItemName);
            const currentReceiverInventory = gameState.inventory[offeredItem.category] || [];
            const newReceiverCategory = [...currentReceiverInventory, offeredItemName];

            updateGameState('inventory', { 
                [requiredItem.category]: newGiverCategory,
                [offeredItem.category]: newReceiverCategory 
            });

            setMarketTrades(marketTrades.filter(t => t.id !== tradeId));
            showToast(`Trade successful! Acquired ${offeredItemName}.`);
        }, 1500);
    };

    const renderItemCard = (itemName, label, onClickAction) => {
        if (!itemName) {
            return (
                <div className="item-square" onClick={onClickAction} style={{ width: '150px', height: '150px', margin: '0 auto', background: 'rgba(255,255,255,0.5)', borderColor: '#cbd5e1', color: '#94a3b8', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '24px', marginBottom: '10px' }}>+</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{label}</span>
                </div>
            );
        }

        const item = itemDB[itemName];
        const color = rarityColors[item.rarity || 'Common'];
        const folder = folderMap[item.category] || '04_Bikini';

        return (
            <div className="item-square" onClick={onClickAction} style={{ width: '150px', height: '180px', margin: '0 auto', borderColor: color, display: 'flex', flexDirection: 'column', padding: '10px', cursor: 'pointer', background: 'var(--white)' }}>
                <div className="rarity-badge" style={{ background: color, zIndex: 2 }}>{item.rarity || 'Common'}</div>
                <div style={{ flex: 1, width: '100%', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '10px', overflow: 'hidden', position: 'relative' }}>
                    <img src="/manekin.png" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Mannequin" />
                    <img src={`${IPFS_BASE}/${folder}/${encodeURIComponent(item.fileName)}.png`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 10 }} alt={itemName} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, textAlign: 'center', color: '#111' }}>{itemName}</span>
            </div>
        );
    };

    return (
        <>
            <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
                <div className="modal-header">
                    <h3 className="modal-title">BABES CAFE // SOCIAL HUB</h3>
                    <div className="close-modal" onClick={onClose}>X</div>
                </div>
                
                <div className="modal-body" style={{ flexDirection: 'column' }}>
                    <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 15px auto' }}>
                        <button className={`tab-btn ${mainTab === 'chat' ? 'active' : ''}`} onClick={() => setMainTab('chat')}>GLOBAL CHAT</button>
                        <button className={`tab-btn ${mainTab === 'trade' ? 'active' : ''}`} onClick={() => setMainTab('trade')}>TRADE ROOM</button>
                    </div>

                    {mainTab === 'chat' && (
                        <div className="modal-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div className="chat-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '10px' }}>
                                {chatHistory.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>Loading chat history...</div>
                                ) : (
                                    chatHistory.map((chat, idx) => (
                                        <div key={idx} className="chat-msg">
                                            <span className="chat-user">{chat.user}:</span> {chat.text}
                                        </div>
                                    ))
                                )}
                                {/* Elemen pancingan agar scroll selalu mengarah ke sini */}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input 
                                    type="text" 
                                    className="input-text" 
                                    style={{ marginBottom: 0 }} 
                                    placeholder="Say hello to the island..." 
                                    value={chatInput} 
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                />
                                <button className="btn" onClick={handleSendChat} style={{ width: '120px', marginBottom: 0 }}>SEND</button>
                            </div>
                        </div>
                    )}

                    {mainTab === 'trade' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="tab-container" style={{ maxWidth: '400px', margin: '0 auto 15px auto' }}>
                                <button className={`tab-btn ${tradeTab === 'market' ? 'active' : ''}`} style={{ fontSize: '10px', padding: '8px' }} onClick={() => setTradeTab('market')}>PUBLIC MARKET</button>
                                <button className={`tab-btn ${tradeTab === 'create' ? 'active' : ''}`} style={{ fontSize: '10px', padding: '8px' }} onClick={() => setTradeTab('create')}>CREATE TRADE</button>
                            </div>

                            {tradeTab === 'market' && (
                                <div className="modal-section" style={{ flex: 1, overflowY: 'auto' }}>
                                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--lake-blue)', margin: '0 0 15px 0' }}>Browse active trade listings from other players.</p>
                                    
                                    {marketTrades.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No active trades right now.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {marketTrades.map(trade => (
                                                <div key={trade.id} style={{ background: trade.isMine ? 'rgba(241, 187, 88, 0.1)' : 'var(--white)', border: trade.isMine ? '2px solid var(--pale-marigold)' : '2px solid #e2e8f0', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>OFFERING</span>
                                                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--lake-blue)' }}>{trade.offer}</span>
                                                        </div>
                                                        <span style={{ fontSize: '20px', color: 'var(--powder-pink)', fontWeight: 'bold' }}>⇄</span>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>LOOKING FOR</span>
                                                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--lake-blue)' }}>{trade.want}</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '20px' }}>
                                                        <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '5px' }}>Listed by {trade.user}</span>
                                                        {trade.isMine ? (
                                                            <button className="btn" style={{ padding: '8px 15px', fontSize: '10px', background: '#e2e8f0', color: '#94a3b8', margin: 0, cursor: 'default' }}>YOUR LISTING</button>
                                                        ) : (
                                                            <button className="btn btn-gold" style={{ padding: '8px 15px', fontSize: '12px', margin: 0 }} onClick={() => handleAcceptTrade(trade.id, trade.want, trade.offer)}>
                                                                ACCEPT OFFER
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {tradeTab === 'create' && (
                                <div className="modal-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--lake-blue)', margin: '0 0 20px 0' }}>List an item you own in exchange for an item you want.</p>
                                    
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <h4 style={{ color: 'var(--lake-blue)', margin: '0 0 10px 0', fontSize: '14px' }}>YOUR OFFER</h4>
                                            {renderItemCard(myOffer?.name, 'Select Your Item', () => setIsSelectingFor('offer'))}
                                        </div>
                                        
                                        <div style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--powder-pink)' }}>⇄</div>
                                        
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <h4 style={{ color: 'var(--lake-blue)', margin: '0 0 10px 0', fontSize: '14px' }}>THEIR OFFER</h4>
                                            {renderItemCard(targetWant?.name, 'Select Target Item', () => setIsSelectingFor('want'))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                        <button className="btn btn-pink" style={{ padding: '12px 30px', fontSize: '14px' }} onClick={handleListTrade}>
                                            PUBLISH TO MARKET
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isSelectingFor && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'var(--vanilla-cream)', padding: '20px', borderRadius: '14px', border: '4px solid var(--lake-blue)', width: '90%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ color: 'var(--lake-blue)', fontFamily: "'Lilita One', cursive", margin: 0, fontSize: '20px' }}>
                                {isSelectingFor === 'offer' ? 'SELECT ITEM TO OFFER (UN-EQUIPPED)' : 'SELECT TARGET ITEM (NOT OWNED)'}
                            </h3>
                            <button className="btn" style={{ background: '#e2e8f0', color: '#111', margin: 0, padding: '5px 10px' }} onClick={() => setIsSelectingFor(null)}>CLOSE</button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
                            <div className="item-grid">
                                {(() => {
                                    const listToRender = isSelectingFor === 'offer' ? getAvailableInventory() : getMissingItems();
                                    
                                    if (listToRender.length === 0) {
                                        return <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No items available in this category.</div>;
                                    }

                                    return listToRender.map((itemObj, idx) => {
                                        const item = itemDB[itemObj.name];
                                        const color = rarityColors[item.rarity || 'Common'];
                                        const folder = folderMap[item.category] || '04_Bikini';
                                        
                                        return (
                                            <div key={idx} className="item-square" onClick={() => {
                                                if (isSelectingFor === 'offer') setMyOffer(itemObj);
                                                else setTargetWant(itemObj);
                                                setIsSelectingFor(null);
                                            }} style={{ borderColor: color, cursor: 'pointer', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                                                <div className="rarity-badge" style={{ background: color, zIndex: 2 }}>{item.rarity || 'Common'}</div>
                                                <div style={{ flex: 1, width: '100%', aspectRatio: '1/1', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                                                    <img src="/manekin.png" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="Mannequin" />
                                                    <img src={`${IPFS_BASE}/${folder}/${encodeURIComponent(item.fileName)}.png`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 10 }} alt={itemObj.name} />
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: 800, textAlign: 'center' }}>{itemObj.name}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
