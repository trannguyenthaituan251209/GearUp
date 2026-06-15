const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

code = code.replace(/const messagesEndRef = React.useRef\(null\);/, 
  `const messagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);
  };`);

code = code.replace(/messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);/, 
  `const currentThreadMessages = messages.filter(m => m.assetId === selectedAssetId);
      const lastMsg = currentThreadMessages[currentThreadMessages.length - 1];
      const isMe = lastMsg && lastMsg.senderId === user?.id;
      if (isNearBottom || isMe) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }`);

code = code.replace(/<div style=\{\{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 \}\}>/, 
  `<div ref={chatContainerRef} onScroll={handleScroll} style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>`);

code = code.replace(/onClick=\{\(\) => \{\n\s*setSelectedAssetId\(thread\.assetId\);/g, 
  `onClick={() => {
                            setIsNearBottom(true);
                            setSelectedAssetId(thread.assetId);`);

fs.writeFileSync('src/pages/CustomerDashboard.jsx', code, 'utf8');
console.log('Patched CustomerDashboard');
