import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { RotateCcw, MessageSquare } from 'lucide-react';

export default function RenterDashboard() {
  const { bookings, updateBookingStatus, messages } = useContext(StoreContext);

  const handleReturnAsset = (bookingId) => {
    updateBookingStatus(bookingId, 'returned');
    alert('Đã hoàn trả tài sản thành công! Trạng thái đã được cập nhật thành Đã Trả.');
  };

  // Group unique messages by asset for chat overview
  const uniqueChats = [];
  const seenAssets = new Set();
  
  // Traverse messages in reverse to show latest messages first
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!seenAssets.has(msg.assetId)) {
      seenAssets.add(msg.assetId);
      uniqueChats.push(msg);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Lịch Sử Thuê Tài Sản (Renter Dashboard)</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Quản lý các tài sản bạn đang gửi yêu cầu thuê, đang sử dụng hoặc lịch sử giao dịch trước đây.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }} className="renter-layout">
        
        {/* Bookings List */}
        <main>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Danh sách đơn hàng thuê tài sản</h3>
          
          {bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img 
                      src={booking.assetImage} 
                      alt={booking.assetTitle} 
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', backgroundColor: '#e2e8f0' }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '16px', marginBottom: '6px' }}>{booking.assetTitle}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Thời gian: <strong>{booking.startDate}</strong> đến <strong>{booking.endDate}</strong>
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Người thuê: {booking.renterName} ({booking.renterContact})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {formatPrice(booking.totalPrice)} đ
                    </div>
                    <span className={`badge badge-${booking.status}`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                      {booking.status === 'pending' && 'Chờ duyệt'}
                      {booking.status === 'approved' && 'Đang thuê / Đã duyệt'}
                      {booking.status === 'returned' && 'Đã hoàn trả'}
                    </span>
                    
                    {booking.status === 'approved' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '4px', backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary-hover)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleReturnAsset(booking.id)}
                      >
                        <RotateCcw size={13} />
                        <span>Hoàn Trả Thiết Bị</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Bạn chưa thuê hoặc gửi yêu cầu thuê tài sản nào.</p>
            </div>
          )}
        </main>

        {/* Chats History Sidebar */}
        <aside className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
            Trò Chuyện Trực Tuyến
          </h3>
          
          {uniqueChats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {uniqueChats.map((chat) => (
                <div 
                  key={chat.id} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'var(--color-light)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--color-dark)' }}>
                    {chat.assetTitle}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Từ: {chat.senderName}</span>
                    <span>{chat.timestamp}</span>
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--color-text-main)', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                    "{chat.text}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Chưa có cuộc hội thoại nào.</p>
          )}
        </aside>
      </div>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 900px) {
          .renter-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
