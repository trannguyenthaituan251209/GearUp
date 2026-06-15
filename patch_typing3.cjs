const fs = require('fs');

// --- 1. Patch StoreContext.jsx ---
let storeCode = fs.readFileSync('src/context/StoreContext.jsx', 'utf8').replace(/\r\n/g, '\n');

storeCode = storeCode.replace(
  /const \{ threadId, senderName, senderRole, isTyping \} = payload\.payload \|\| payload;\n\s*setTypingStatus\(prev => \{\n\s*const next = \{ \.\.\.prev \};\n\s*if \(isTyping\) next\[threadId\] = \{ senderName: senderName \|\| 'Ai đó', senderRole \};\n\s*else delete next\[threadId\];\n\s*return next;\n\s*\}\);/,
  `const { threadId, senderName, senderRole, isTyping } = payload.payload || payload;
        setTypingStatus(prev => {
          const next = { ...prev };
          if (!next[threadId]) next[threadId] = {};
          if (isTyping) {
            next[threadId] = { ...next[threadId], [senderRole]: senderName || 'Ai đó' };
          } else {
            const updatedThread = { ...next[threadId] };
            delete updatedThread[senderRole];
            if (Object.keys(updatedThread).length === 0) {
              delete next[threadId];
            } else {
              next[threadId] = updatedThread;
            }
          }
          return next;
        });`
);

fs.writeFileSync('src/context/StoreContext.jsx', storeCode, 'utf8');

// --- 2. Patch CustomerDashboard.jsx ---
let customerCode = fs.readFileSync('src/pages/CustomerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

customerCode = customerCode.replace(
  /\{typingStatus\[\`\$\{selectedAssetId\}_\$\{user\?\.id\}\`\] && typingStatus\[\`\$\{selectedAssetId\}_\$\{user\?\.id\}\`\]\.senderRole !== 'customer' && \(\n\s*<div style=\{\{ padding: '0 20px', fontSize: '11px', color: 'var\(--color-text-muted\)', fontStyle: 'italic', marginBottom: '8px' \}\}>\n\s*\{typingStatus\[\`\$\{selectedAssetId\}_\$\{user\?\.id\}\`\]\.senderName\} đang soạn tin...\n\s*<\/div>\n\s*\)\}/,
  `{typingStatus[\`\${selectedAssetId}_\${user?.id}\`]?.partner && (
                      <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                        {typingStatus[\`\${selectedAssetId}_\${user?.id}\`].partner} đang soạn tin...
                      </div>
                    )}`
);

fs.writeFileSync('src/pages/CustomerDashboard.jsx', customerCode, 'utf8');

// --- 3. Patch PartnerDashboard.jsx ---
let partnerCode = fs.readFileSync('src/pages/PartnerDashboard.jsx', 'utf8').replace(/\r\n/g, '\n');

partnerCode = partnerCode.replace(
  /\{typingStatus\[chatSelectedThreadId\] && typingStatus\[chatSelectedThreadId\]\.senderRole !== 'partner' && \(\n\s*<div style=\{\{ padding: '0 20px', fontSize: '11px', color: 'var\(--color-text-muted\)', fontStyle: 'italic', marginBottom: '8px' \}\}>\n\s*\{typingStatus\[chatSelectedThreadId\]\.senderName\} đang soạn tin...\n\s*<\/div>\n\s*\)\}/,
  `{typingStatus[chatSelectedThreadId]?.customer && (
                <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                  {typingStatus[chatSelectedThreadId].customer} đang soạn tin...
                </div>
              )}`
);

fs.writeFileSync('src/pages/PartnerDashboard.jsx', partnerCode, 'utf8');

console.log('Patched typing status object structure!');
