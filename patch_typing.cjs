const fs = require('fs');

// --- 1. Patch StoreContext.jsx ---
let storeCode = fs.readFileSync('src/context/StoreContext.jsx', 'utf8').replace(/\r\n/g, '\n');

storeCode = storeCode.replace(
  /const \[messages, setMessages\] = useState\(\[\]\);/,
  `const [messages, setMessages] = useState([]);\n  const [typingStatus, setTypingStatus] = useState({});\n  const typingChannelRef = useRef(null);`
);

storeCode = storeCode.replace(
  /const channel = supabase\.channel\('public:messages'\)/,
  `const tChannel = supabase.channel('typing_events', { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { threadId, senderName, isTyping } = payload;
        setTypingStatus(prev => {
          const next = { ...prev };
          if (isTyping) next[threadId] = senderName;
          else delete next[threadId];
          return next;
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          typingChannelRef.current = tChannel;
        }
      });
      
    const channel = supabase.channel('public:messages')`
);

storeCode = storeCode.replace(
  /const value = \{/,
  `const sendTypingEvent = (threadId, isTyping) => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { threadId, senderName: user?.name, isTyping }
      });
    }
  };

  const value = { typingStatus, sendTypingEvent,`
);

fs.writeFileSync('src/context/StoreContext.jsx', storeCode, 'utf8');

// --- 2. Patch CustomerDashboard.jsx ---
let customerCode = fs.readFileSync('src/pages/CustomerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

// Add typingStatus and sendTypingEvent to useContext
customerCode = customerCode.replace(
  /messages, addMessage, markMessagesAsSeen/,
  `messages, addMessage, markMessagesAsSeen, typingStatus, sendTypingEvent`
);

// Add typingRef and handleTyping
customerCode = customerCode.replace(
  /const messagesEndRef = React\.useRef\(null\);/,
  `const typingTimeoutRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  const handleTyping = (e) => {
    setChatReplyText(e.target.value);
    const threadId = \`\${selectedAssetId}_\${user?.id}\`;
    sendTypingEvent(threadId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(threadId, false);
    }, 2000);
  };`
);

// Update input onChange
customerCode = customerCode.replace(
  /onChange=\{\(e\) => setChatReplyText\(e\.target\.value\)\}/g,
  `onChange={handleTyping}`
);

// Add typing indicator above the form
customerCode = customerCode.replace(
  /<div ref=\{messagesEndRef\} \/>\n\s*<\/div>\n\s*\{\/\* Text Input reply form \*\/\}/g,
  `<div ref={messagesEndRef} />
                    </div>
                    
                    {typingStatus[\`\${selectedAssetId}_\${user?.id}\`] && (
                      <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                        {typingStatus[\`\${selectedAssetId}_\${user?.id}\`]} đang soạn tin...
                      </div>
                    )}
                    
                    {/* Text Input reply form */}`
);

fs.writeFileSync('src/pages/CustomerDashboard.jsx', customerCode, 'utf8');


// --- 3. Patch PartnerDashboard.jsx ---
let partnerCode = fs.readFileSync('src/pages/PartnerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

// Add typingStatus and sendTypingEvent to useContext
partnerCode = partnerCode.replace(
  /messages, addMessage, markMessagesAsSeen/,
  `messages, addMessage, markMessagesAsSeen, typingStatus, sendTypingEvent`
);

// Add typingRef and handleTyping
partnerCode = partnerCode.replace(
  /const messagesEndRef = React\.useRef\(null\);/,
  `const typingTimeoutRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  const handleTyping = (e) => {
    setChatReplyText(e.target.value);
    if (chatSelectedThreadId) {
      sendTypingEvent(chatSelectedThreadId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingEvent(chatSelectedThreadId, false);
      }, 2000);
    }
  };`
);

// Update input onChange
partnerCode = partnerCode.replace(
  /onChange=\{\(e\) => setChatReplyText\(e\.target\.value\)\}/g,
  `onChange={handleTyping}`
);

// Add typing indicator above the form
partnerCode = partnerCode.replace(
  /<div ref=\{messagesEndRef\} \/>\n\s*<\/div>\n\s*<form onSubmit=\{handleSendReply\}/g,
  `<div ref={messagesEndRef} />
              </div>
              
              {typingStatus[chatSelectedThreadId] && (
                <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                  {typingStatus[chatSelectedThreadId]} đang soạn tin...
                </div>
              )}

              <form onSubmit={handleSendReply}`
);

fs.writeFileSync('src/pages/PartnerDashboard.jsx', partnerCode, 'utf8');

console.log('Patched typing status everywhere');
