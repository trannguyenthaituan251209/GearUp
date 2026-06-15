const fs = require('fs');

let storeCode = fs.readFileSync('src/context/StoreContext.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Add states
storeCode = storeCode.replace(
  /const \[messages, setMessages\] = useState\(\[\]\);/,
  `const [messages, setMessages] = useState([]);\n  const [typingStatus, setTypingStatus] = React.useState({});\n  const typingChannelRef = React.useRef(null);`
);

// 2. Channel subscription
storeCode = storeCode.replace(
  /const channel = supabase\.channel\('public:messages'\)\n\s*\.on\('postgres_changes', \{ event: 'INSERT', schema: 'public', table: 'messages' \}, \(payload\) => \{\n\s*const newMsg = payload\.new;\n\s*setMessages\(prev => \{\n\s*if \(prev\.some\(m => m\.id === newMsg\.id\)\) return prev;\n\s*return \[\.\.\.prev, mapMessageFromDB\(newMsg\)\];\n\s*\}\);\n\s*\}\)\n\s*\.subscribe\(\);/,
  `const channel = supabase.channel('public:messages', { config: { broadcast: { self: true, ack: true } } })\n      .on('broadcast', { event: 'typing' }, (payload) => {\n        const { threadId, senderName, senderRole, isTyping } = payload.payload || payload;\n        setTypingStatus(prev => {\n          const next = { ...prev };\n          if (!next[threadId]) next[threadId] = {};\n          if (isTyping) {\n            next[threadId] = { ...next[threadId], [senderRole]: senderName || 'Ai đó' };\n          } else {\n            const updatedThread = { ...next[threadId] };\n            delete updatedThread[senderRole];\n            if (Object.keys(updatedThread).length === 0) {\n              delete next[threadId];\n            } else {\n              next[threadId] = updatedThread;\n            }\n          }\n          return next;\n        });\n      })\n      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {\n        const newMsg = payload.new;\n        setMessages(prev => {\n          if (prev.some(m => m.id === newMsg.id)) return prev;\n          return [...prev, mapMessageFromDB(newMsg)];\n        });\n      })\n      .subscribe((status, err) => {\n        if (status === 'SUBSCRIBED') {\n          typingChannelRef.current = channel;\n        }\n      });`
);

// 3. sendTypingEvent
storeCode = storeCode.replace(
  /const addMessage = async/,
  `const sendTypingEvent = (threadId, isTyping, senderRole = 'customer') => {\n    if (typingChannelRef.current) {\n      typingChannelRef.current.send({\n        type: 'broadcast',\n        event: 'typing',\n        payload: { threadId, senderName: senderRole === 'partner' ? (user?.studio_name || user?.name) : user?.name, senderRole, isTyping }\n      });\n    }\n  };\n\n  const addMessage = async`
);

// 4. Export them
storeCode = storeCode.replace(
  /messages,\n\s*user,/,
  `messages,\n        typingStatus,\n        sendTypingEvent,\n        user,`
);

// 5. addMessage DB fix
storeCode = storeCode.replace(
  /const newMessage = \{\n\s*id: \`msg-\$\{Date\.now\(\)\}\`,/,
  `if (!receiverId) {\n      console.error('[addMessage] ERROR: receiverId is undefined! Message will not reach the partner.');\n    }\n    const newMessage = {\n        id: \`msg-\${Date.now()}\`,`
);

storeCode = storeCode.replace(
  /const newNotif = \{\n\s*user_id: receiverId,\n\s*title: 'Tin nhắn mới',\n\s*message: \`Bạn có tin nhắn mới từ \$\{newMessage\.senderName\} về \$\{assetTitle\}\`,\n\s*type: 'message',\n\s*is_read: false\n\s*\};/,
  `const newNotif = {\n            user_id: receiverId,\n            title: 'Tin nhắn mới',\n            message: \`Bạn có tin nhắn mới từ \${newMessage.senderName} về \${assetTitle}\`,\n            type: 'message',\n            is_read: false\n          };`
);

// Wait, the previous block I reverted was actually:
storeCode = storeCode.replace(
  /const newNotif = \{\n\s*id: \`notif-\$\{Date\.now\(\)\}\`,\n\s*user_id: receiverId,\n\s*title: 'Tin nhắn mới',\n\s*message: \`Bạn có tin nhắn mới từ \$\{newMessage\.senderName\} về \$\{assetTitle\}\`,\n\s*type: 'message',\n\s*is_read: false,\n\s*created_at: new Date\(\)\.toISOString\(\)\n\s*\};/,
  `const newNotif = {\n            user_id: receiverId,\n            title: 'Tin nhắn mới',\n            message: \`Bạn có tin nhắn mới từ \${newMessage.senderName} về \${assetTitle}\`,\n            type: 'message',\n            is_read: false\n          };`
);


// 6. avatar_url fix
storeCode = storeCode.replace(
  /select\('id, name, studio_name, avatar_url'\)/g,
  `select('id, name, studio_name, avatar')`
);
storeCode = storeCode.replace(
  /if \(profile\.avatar_url\) mappedAsset\.ownerAvatar = profile\.avatar_url;/g,
  `if (profile.avatar) mappedAsset.ownerAvatar = profile.avatar;`
);

fs.writeFileSync('src/context/StoreContext.jsx', storeCode, 'utf8');
console.log('Restored StoreContext!');
