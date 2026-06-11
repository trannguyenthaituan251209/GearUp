import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { X, Send, User, Headset } from 'lucide-react';

export default function CskhChatModal({ isOpen, onClose }) {
  const { user, messages, addMessage } = useContext(StoreContext);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const cskhAssetId = user ? `cskh-${user.id}` : null;
  const chatHistory = cskhAssetId ? messages.filter(m => m.assetId === cskhAssetId) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', user.name, text);
    setText('');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '350px',
      height: '450px',
      backgroundColor: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Headset size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: '600', fontSize: '15px' }}>Chăm sóc Khách hàng</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      {!user ? (
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
          <User size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Vui lòng đăng nhập</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Bạn cần đăng nhập để nhắn tin với bộ phận Chăm sóc khách hàng.</p>
        </div>
      ) : (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
            {chatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '20px' }}>
                Bắt đầu cuộc trò chuyện với chúng tôi
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isMe = msg.senderName === user.name;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      backgroundColor: isMe ? 'var(--color-primary)' : '#ffffff',
                      color: isMe ? '#ffffff' : 'var(--color-text-main)',
                      border: isMe ? 'none' : '1px solid var(--color-border)',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: isMe ? '16px' : '4px',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '20px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: text.trim() ? 'var(--color-primary)' : '#e2e8f0',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: text.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
