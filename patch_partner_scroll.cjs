const fs = require('fs');
let code = fs.readFileSync('src/pages/PartnerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

code = code.replace(/const messagesEndRef = React.useRef\(null\);/, 
  `const messagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
  };`);

code = code.replace(/messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);/, 
  `const threadMessages = messages.filter(m => \`\${m.assetId}_\${m.customerId}\` === chatSelectedThreadId);
      const lastMsg = threadMessages[threadMessages.length - 1];
      const isMe = lastMsg && lastMsg.senderId === user?.id;
      if (isNearBottom || isMe) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }`);

code = code.replace(/<div style=\{\{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 \}\}>/, 
  `<div ref={chatContainerRef} onScroll={handleScroll} style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>`);

code = code.replace(/setChatSelectedThreadId\((.+)\);/g, 
  `setIsNearBottom(true); setChatSelectedThreadId($1);`);

fs.writeFileSync('src/pages/PartnerDashboard.jsx', code, 'utf8');
console.log('Patched PartnerDashboard scroll');
