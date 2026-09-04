import { useState } from 'react';

export default function GuardModal({ showToast, onClose }) {
    const [subTab, setSubTab] = useState('support');
    const [ticketInput, setTicketInput] = useState('');

    const handleSubmit = () => {
        if(ticketInput.trim() === '') return;
        showToast('Ticket submitted to Admins.');
        setTicketInput('');
    };

    return (
        <div className="babes-modal" style={{ display: 'flex', opacity: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1)' }}>
            <div className="modal-header">
                <h3 className="modal-title">GUARD TOWER // SAFETY CENTER</h3>
                <div className="close-modal" onClick={onClose}>X</div>
            </div>
            <div className="modal-body" style={{ flexDirection: 'column' }}>
                <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 10px auto' }}>
                    <button className={`tab-btn ${subTab === 'support' ? 'active' : ''}`} onClick={() => setSubTab('support')}>SUPPORT TICKET</button>
                    <button className={`tab-btn ${subTab === 'rules' ? 'active' : ''}`} onClick={() => setSubTab('rules')}>ISLAND RULES</button>
                    <button className={`tab-btn ${subTab === 'faq' ? 'active' : ''}`} onClick={() => setSubTab('faq')}>F.A.Q.</button>
                </div>
                
                <div className="modal-section" style={{ flex: 1, overflowY: 'auto' }}>
                    {subTab === 'support' && (
                        <div>
                            <h4 className="section-title">REPORT BUG / PLAYER / SCAM</h4>
                            <textarea 
                                className="textarea-box" 
                                placeholder="Write your report here..."
                                value={ticketInput}
                                onChange={(e) => setTicketInput(e.target.value)}
                            ></textarea>
                            <button className="btn btn-pink" onClick={handleSubmit}>SUBMIT TICKET</button>
                        </div>
                    )}
                    
                    {subTab === 'rules' && (
                        <div style={{ lineHeight: 1.8, color: 'var(--lake-blue)' }}>
                            <h4 className="section-title">ISLAND RULES</h4>
                            <ol>
                                <li><strong>No Harassment:</strong> Keep the Cafe chat friendly.</li>
                                <li><strong>No Scams:</strong> Always use the official Trade Room escrow.</li>
                                <li><strong>No Bots:</strong> Automated contest voting is strictly prohibited.</li>
                            </ol>
                        </div>
                    )}

                    {subTab === 'faq' && (
                        <div style={{ lineHeight: 1.8, color: 'var(--lake-blue)' }}>
                            <h4 className="section-title">FREQUENTLY ASKED QUESTIONS</h4>
                            <p><strong>Q: How do I level up?</strong><br/>A: Complete Quests, vote in contests, and buy items to earn XP.</p>
                            <p><strong>Q: How do I get more $babes?</strong><br/>A: Claim your daily reward at The Hut or win the weekly Babes Club contest!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}