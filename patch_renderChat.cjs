const fs = require('fs');

const renderChatCode = `  const renderChat = () => {
    // Group messages for partner
    const chatThreads = [];
    const seenThreads = new Set();
    
    // Partner only sees messages sent TO them or BY them
    const myMessages = messages.filter(m => m.receiverId === user?.id || m.senderId === user?.id);
    
    for (let i = myMessages.length - 1; i >= 0; i--) {
      const msg = myMessages[i];
      const threadId = msg.assetId + '_' + msg.customerId;
      // Only include messages related to my assets
      if (myAssetIds.includes(msg.assetId) && !seenThreads.has(threadId)) {
        seenThreads.add(threadId);
        const asset = myAssets.find(a => a.id === msg.assetId);
        // Find the most recent name of the customer
        const customerMsg = myMessages.find(m => m.assetId === msg.assetId && m.customerId === msg.customerId && m.senderId === msg.customerId);
        chatThreads.push({
          threadId: threadId,
          assetId: msg.assetId,
          customerId: msg.customerId,
          assetTitle: msg.assetTitle,
          assetImage: asset?.imageUrl || '/camera.png',
          lastMessage: msg.text,
          timestamp: msg.timestamp,
          renterName: customerMsg?.senderName || 'Khách hàng'
        });
      }
    }

    let selectedThread = chatThreads.find(t => t.threadId === chatSelectedThreadId);
    if (!selectedThread && chatSelectedThreadId) {
      const [assetId, customerId] = chatSelectedThreadId.split('_');
      const asset = myAssets.find(a => a.id === assetId);
      if (asset) {
        selectedThread = {
          threadId: chatSelectedThreadId,
          assetId: asset.id,
          customerId: customerId,
          assetTitle: asset.title,
          assetImage: asset.imageUrl || '/camera.png',
          lastMessage: '',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          renterName: 'Khách hàng'
        };
        chatThreads.unshift(selectedThread);
      }
    }
    const threadMessages = messages.filter(m => (m.assetId + '_' + m.customerId) === chatSelectedThreadId);

    const handleSendReply = (e) => {
      e.preventDefault();
      if (!chatReplyText.trim() || !chatSelectedThreadId) return;
      
      let finalMessage = chatReplyText.trim();
      // Tự động đính kèm mã đơn nếu có
      const [assetId, customerId] = chatSelectedThreadId.split('_');
      const relatedBooking = bookings.find(b => b.assetId === assetId && b.renterId === customerId);
      if (relatedBooking && !finalMessage.includes('[Đơn #')) {
        const orderCode = relatedBooking.id.split('-')[1] || relatedBooking.id;
        finalMessage = '[Đơn #' + orderCode + '] ' + finalMessage;
      }
      
      addMessage(
        assetId,
        selectedThread?.assetTitle || 'Thiết bị',
        user?.name || 'Partner',
        finalMessage,
        user?.id,
        customerId,
        customerId
      );
      setChatReplyText('');
    };

    return (
      <div className="animate-fade-in chat-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: 'calc(100vh - 140px)' }}>
        <aside style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--color-border)', display: showMobileSidebar ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Tin nhắn ({chatThreads.length})</h3>
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
            {chatThreads.length > 0 ? (
              chatThreads.map((thread) => {
                const unseenCount = messages.filter(m => m.assetId === thread.assetId && m.customerId === thread.customerId && m.receiverId === user?.id && m.status === 'sent').length;
                return (
                  <div 
                    key={thread.threadId}
                    onClick={() => {
                      setChatSelectedThreadId(thread.threadId);
                      setShowMobileSidebar(false);
                    }}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      backgroundColor: chatSelectedThreadId === thread.threadId ? 'var(--color-primary-light)' : 'transparent',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <img src={thread.assetImage} alt="asset" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-dark)' }} className="truncate">{thread.renterName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', flexShrink: 0 }}>{thread.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-primary)' }} className="truncate">
                        {thread.assetTitle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', color: unseenCount > 0 ? 'var(--color-dark)' : 'var(--color-text-muted)', fontStyle: unseenCount > 0 ? 'normal' : 'italic', fontWeight: unseenCount > 0 ? '600' : 'normal' }} className="truncate">
                          "{thread.lastMessage}"
                        </div>
                        {unseenCount > 0 && (
                          <span style={{ backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                            {unseenCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có tin nhắn nào.</div>
            )}
          </div>
        </aside>

        <section className="chat-main" style={{ display: !showMobileSidebar || window.innerWidth > 768 ? 'flex' : 'none', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          {chatSelectedThreadId && selectedThread ? (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-ghost btn-sm mobile-back-btn" onClick={() => setShowMobileSidebar(true)} style={{ padding: '4px', marginRight: '4px', display: 'none' }}>
                  <ArrowLeft size={20} />
                </button>
                <img src={selectedThread.assetImage} alt="asset" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-dark)' }}>{selectedThread.renterName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedThread.assetTitle}</div>
                </div>
              </div>

              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                {threadMessages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{msg.senderName} • {msg.timestamp}</div>
                      <div style={{ 
                        backgroundColor: isMe ? 'var(--color-primary)' : '#f1f5f9', 
                        color: isMe ? '#ffffff' : 'var(--color-text-primary)', 
                        padding: '10px 14px', 
                        borderRadius: '16px', 
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: !isMe ? '4px' : '16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word',
                        fontSize: '13px'
                      }}>
                        {msg.text}
                      </div>
                      {isMe && (
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {msg.status === 'seen' ? <><CheckCheck size={12} style={{ color: 'var(--color-primary)' }}/> Đã xem</> : <><Check size={12} /> Đã gửi</>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} style={{ padding: '16px 20px', backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', flexShrink: 0 }}>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Nhập phản hồi..."
                  value={chatReplyText}
                  onChange={(e) => setChatReplyText(e.target.value)}
                  style={{ flexGrow: 1, borderRadius: '99px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              <MessageSquare size={48} style={{ strokeWidth: '1', marginBottom: '16px' }} />
              <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
            </div>
          )}
        </section>
      </div>
    );
  };`;

const code = fs.readFileSync('src/pages/PartnerDashboard.jsx', 'utf8');
const lines = code.split('\n');

let start = lines.findIndex(l => l.includes('const renderChat = () => {'));
let end = start; 
let depth = 0; 
for(let i=start; i<lines.length; i++) { 
  depth += (lines[i].match(/\{/g)||[]).length; 
  depth -= (lines[i].match(/\}/g)||[]).length; 
  if (depth===0 && i>start) { end=i; break; } 
}

lines.splice(start, end - start + 1, renderChatCode);
fs.writeFileSync('src/pages/PartnerDashboard.jsx', lines.join('\n'), 'utf8');
console.log('Patched PartnerDashboard.jsx completely');
