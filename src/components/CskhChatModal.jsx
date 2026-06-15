import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { X, Send, User, Headset, Bot } from 'lucide-react';
import { generateAiResponse } from '../utils/geminiService';
import ReactMarkdown from 'react-markdown';

export default function CskhChatModal({ isOpen, onClose }) {
  const { user, messages, addMessage, isAppLoading } = useContext(StoreContext);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const cskhAssetId = user ? `cskh-${user.id}` : null;
  const chatHistory = cskhAssetId ? messages.filter(m => m.assetId === cskhAssetId) : [];

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  useEffect(() => {
    if (isOpen && user && chatHistory.length === 0 && !isTyping && !isAppLoading) {
      // Auto greet only when app is fully loaded to prevent race conditions with DB fetch
      setIsTyping(true);
      setTimeout(() => {
        addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', 'GearUp AI', `Chào ${user.name}, tôi là trợ lý thông minh của GearUp. Hôm nay bạn cần tôi hỗ trợ vấn đề gì?`, 'admin', user.id, user.id);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, user, chatHistory.length, isAppLoading]);

  if (!isOpen) return null;

  let isHumanMode = false;
  let lastRequestIndex = -1;
  let lastResolvedIndex = -1;
  chatHistory.forEach((m, idx) => {
    const text = m.text || '';
    if (text.includes('[CẦN CSKH]') || text.includes('[ASSIGNED]') || m.senderName === 'Admin CSKH') {
      lastRequestIndex = idx;
    }
    if (text.includes('[RESOLVED]')) {
      lastResolvedIndex = idx;
    }
  });
  
  isHumanMode = lastRequestIndex > lastResolvedIndex;

  const handleSendText = async (textToSend) => {
    if (!textToSend.trim() || !user) return;
    
    // 1. Send user message
    addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', user.name, textToSend, user.id, 'admin', user.id);
    setText('');

    // If requesting human or already in human mode, don't trigger AI
    if (isHumanMode || textToSend.includes('[CẦN CSKH]')) {
      if (textToSend.includes('[CẦN CSKH]')) {
         setIsTyping(true);
         setTimeout(() => {
           addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', 'GearUp AI', 'Hệ thống đang kết nối bạn với nhân viên CSKH. Vui lòng đợi trong ít phút nhé!', 'admin', user.id, user.id);
           setIsTyping(false);
         }, 1000);
      }
      return;
    }

    // 2. Trigger AI
    setIsTyping(true);
    const aiReply = await generateAiResponse(textToSend);
    addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', 'GearUp AI', aiReply, 'admin', user.id, user.id);
    setIsTyping(false);

    // Auto hand-off if AI decides it's too complex
    if (aiReply.toLowerCase().includes('chuyển cho nhân viên cskh') || aiReply.toLowerCase().includes('hỗ trợ trực tiếp')) {
       addMessage(cskhAssetId, 'Hỗ trợ Khách hàng', user.name, '[CẦN CSKH]', user.id, 'admin', user.id);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendText(text);
  };

  const handleQuickReply = (optionText) => {
    handleSendText(optionText);
  };

  const handleRequestHuman = () => {
    handleSendText('[CẦN CSKH]');
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
          <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
            {chatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '20px' }}>
                Bắt đầu cuộc trò chuyện với chúng tôi
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isMe = msg.senderName === user.name;
                const isAi = msg.senderName === 'GearUp AI';
                const msgText = msg.text || '';
                if (msgText.startsWith('[RESOLVED]')) {
                  const resolvedText = msgText.replace('[RESOLVED]', '').trim();
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', width: '100%' }}>
                      <div style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontSize: '12px', fontWeight: '500', textAlign: 'center', maxWidth: '260px' }}>
                        <span style={{ color: '#0f172a', fontWeight: '600' }}>{resolvedText}</span>
                        <div style={{ marginTop: '4px', color: '#10b981' }}>✨ AI đã quay trở lại và sẵn sàng hỗ trợ bạn!</div>
                      </div>
                    </div>
                  );
                }

                // Hide internal tags from UI
                const displayText = msgText.replace(/\[CẦN CSKH\]|\[ASSIGNED\]/g, '').trim();
                if (!displayText) return null;

                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      {isAi && (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                          <Bot size={16} />
                        </div>
                      )}
                      <div style={{
                        maxWidth: isAi ? '220px' : '260px',
                        padding: '10px 14px',
                        borderRadius: '16px',
                        backgroundColor: isMe ? 'var(--color-primary)' : (isAi ? '#e0e7ff' : '#ffffff'),
                        color: isMe ? '#ffffff' : 'var(--color-text-main)',
                        border: (isMe || isAi) ? 'none' : '1px solid var(--color-border)',
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: isMe ? '16px' : '4px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        <ReactMarkdown components={{
                          p: ({node, ...props}) => <span {...props} />,
                          a: ({node, ...props}) => <a style={{color: 'inherit', textDecoration: 'underline'}} {...props} />,
                          strong: ({node, ...props}) => <strong style={{fontWeight: 600}} {...props} />,
                          ul: ({node, ...props}) => <ul style={{margin: '4px 0', paddingLeft: '20px'}} {...props} />,
                          ol: ({node, ...props}) => <ol style={{margin: '4px 0', paddingLeft: '20px'}} {...props} />,
                          li: ({node, ...props}) => <li style={{marginBottom: '2px'}} {...props} />
                        }}>
                          {displayText}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', marginRight: isMe ? '4px' : '36px', marginLeft: !isMe ? '36px' : '4px' }}>
                      {msg.senderName === 'Admin CSKH' ? 'Nhân viên CSKH' : msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}
            
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Bot size={16} />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: '#e0e7ff', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px', height: '36px', boxSizing: 'border-box' }}>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {chatHistory.length > 0 && !isHumanMode && (
            <div style={{ padding: '8px 12px', display: 'flex', gap: '8px', overflowX: 'auto', backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)' }} className="no-scrollbar">
              <button onClick={() => handleQuickReply('1. Hỗ trợ về đơn hàng')} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', whiteSpace: 'nowrap', cursor: 'pointer' }}>Đơn hàng</button>
              <button onClick={() => handleQuickReply('2. Trở thành đối tác')} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', whiteSpace: 'nowrap', cursor: 'pointer' }}>Đối tác</button>
              <button onClick={() => handleQuickReply('3. Báo cáo sự cố')} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', whiteSpace: 'nowrap', cursor: 'pointer' }}>Sự cố</button>
              <button onClick={handleRequestHuman} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '16px', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: '500' }}>Gặp nhân viên</button>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                className="no-scrollbar"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (text.trim()) handleSendText(text);
                  }
                }}
                placeholder="Nhập tin nhắn..."
                rows="1"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '20px',
                  outline: 'none',
                  fontSize: '14px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
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
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0,
                  marginBottom: '2px'
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
