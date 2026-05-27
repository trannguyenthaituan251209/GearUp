import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function AssetDetail({ assetId, setCurrentPage }) {
  const { assets, addBooking, addMessage, currentUserRole, messages } = useContext(StoreContext);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  // Booking state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterName, setRenterName] = useState('Lê Minh Tuấn'); // default test user
  const [renterContact, setRenterContact] = useState('0987654321');
  const [rentalDays, setRentalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Find asset
  const asset = assets.find((a) => a.id === assetId);

  // If asset not found
  if (!asset) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setCurrentPage('market')}>
          Quay lại Chợ tài sản
        </button>
      </div>
    );
  }

  // Calculate rental days & total price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end >= start) {
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusive
        setRentalDays(days);
        setTotalPrice(days * asset.pricePerDay);
      } else {
        setRentalDays(0);
        setTotalPrice(0);
      }
    } else {
      setRentalDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, asset.pricePerDay]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
      return;
    }
    if (!renterName.trim() || !renterContact.trim()) {
      alert('Vui lòng nhập đầy đủ tên và số điện thoại liên hệ!');
      return;
    }

    // Call addBooking in StoreContext
    addBooking({
      assetId: asset.id,
      assetTitle: asset.title,
      assetImage: asset.imageUrl,
      pricePerDay: asset.pricePerDay,
      startDate,
      endDate,
      totalPrice,
      renterName,
      renterContact
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setCurrentPage('renter-dashboard');
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    addMessage(asset.id, asset.title, currentUserRole === 'renter' ? renterName : asset.ownerName, chatMessage);
    setChatMessage('');
    alert('Đã gửi tin nhắn đến chủ tài sản thành công!');
    setShowChatModal(false);
  };

  // Filter messages for this asset
  const chatHistory = messages.filter((m) => m.assetId === asset.id);

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => setCurrentPage('market')} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: 'none', 
          border: 'none', 
          color: 'var(--color-text-muted)', 
          cursor: 'pointer', 
          fontWeight: '600',
          marginBottom: '24px',
          fontSize: '15px'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
      >
        <ArrowLeft size={16} />
        <span>Quay lại Chợ Thiết Bị</span>
      </button>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }} className="detail-layout">
        
        {/* Left Column - Asset Info */}
        <section>
          {/* Main Image */}
          <div style={{
            height: '420px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#e2e8f0',
            marginBottom: '30px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <img src={asset.imageUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Title & Metadata */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '12px', lineHeight: '1.3' }}>{asset.title}</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <span className={`badge badge-${asset.status}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                {asset.status === 'available' ? '● Đang Sẵn Sàng Cho Thuê' : '● Đã Được Thuê'}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📍 {asset.location}
              </span>
              <span style={{ color: '#eab308', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ★ {asset.rating.toFixed(1)} (Đánh giá)
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '24px 0' }} />

          {/* Specifications */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Thông số kỹ thuật</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {asset.specs.map((spec, index) => (
                <div 
                  key={index} 
                  className="glass-panel" 
                  style={{ 
                    padding: '12px 16px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  ✓ {spec}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Mô tả chi tiết</h3>
            <p style={{ 
              fontSize: '15px', 
              color: 'var(--color-text-main)', 
              lineHeight: '1.7', 
              whiteSpace: 'pre-line',
              textAlign: 'justify'
            }}>
              {asset.description}
            </p>
          </div>
        </section>

        {/* Right Column - Booking & Lessor details */}
        <aside>
          {/* Owner details */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Chủ Tài Sản
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img 
                src={asset.ownerAvatar} 
                alt={asset.ownerName} 
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} 
              />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{asset.ownerName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <span>★ 4.9/5.0</span>
                  <span>● Phản hồi nhanh</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowChatModal(true)}
            >
              <MessageSquare size={16} />
              <span>Nhắn Tin Cho Chủ Thiết Bị</span>
            </button>
          </div>

          {/* Booking form */}
          <div className="glass-panel" style={{ padding: '28px', backgroundColor: '#ffffff', border: '1px solid rgba(79, 70, 229, 0.15)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Giá thuê thiết bị</span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
                {formatPrice(asset.pricePerDay)} đ <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ ngày</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 10px', 
                backgroundColor: 'var(--color-secondary-light)', 
                color: 'var(--color-secondary-hover)', 
                borderRadius: 'var(--radius-md)',
                fontWeight: '600'
              }}>
                🎉 Yêu cầu thuê tài sản thành công!<br/>
                <span style={{ fontSize: '13px', fontWeight: '400' }}>Đang chuyển hướng sang Dashboard...</span>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày trả</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label>Họ tên người thuê</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Nhập họ tên đầy đủ"
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại liên hệ</label>
                  <input 
                    type="tel" 
                    className="form-control"
                    placeholder="Nhập số điện thoại liên lạc"
                    value={renterContact}
                    onChange={(e) => setRenterContact(e.target.value)}
                    required
                  />
                </div>

                {rentalDays > 0 && (
                  <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'var(--color-light)', border: 'none', margin: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span>Số ngày thuê:</span>
                      <strong>{rentalDays} ngày</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                      <span>Đơn giá/ngày:</span>
                      <span>{formatPrice(asset.pricePerDay)} đ</span>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', color: 'var(--color-dark)' }}>
                      <span>Tổng cộng:</span>
                      <span style={{ color: 'var(--color-primary)' }}>{formatPrice(totalPrice)} đ</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`btn btn-primary btn-lg`} 
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={asset.status !== 'available'}
                >
                  {asset.status === 'available' ? 'Yêu Cầu Thuê Ngay' : 'Không Sẵn Sàng'}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* Chat modal dialog */}
      {showChatModal && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <button className="modal-close" onClick={() => setShowChatModal(false)}>×</button>
            
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} style={{ color: 'var(--color-primary)' }} />
              <span>Liên hệ: {asset.ownerName}</span>
            </h3>
            
            <div style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-muted)', 
              backgroundColor: 'var(--color-light)', 
              padding: '12px', 
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              Bạn đang nhắn tin tìm hiểu về sản phẩm: <strong>{asset.title}</strong>
            </div>

            {/* Chat history list */}
            {chatHistory.length > 0 && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                backgroundColor: '#fafafa'
              }}>
                {chatHistory.map((m) => {
                  const isOwner = m.senderName === asset.ownerName;
                  return (
                    <div 
                      key={m.id} 
                      style={{
                        alignSelf: isOwner ? 'flex-start' : 'flex-end',
                        backgroundColor: isOwner ? '#e2e8f0' : 'var(--color-primary-light)',
                        color: isOwner ? 'var(--color-dark)' : 'var(--color-primary-active)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        maxWidth: '80%',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: '700', marginBottom: '2px', opacity: 0.7 }}>
                        {m.senderName} • {m.timestamp}
                      </div>
                      <div>{m.text}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <textarea 
                  className="form-control"
                  placeholder="Nhập nội dung tin nhắn gửi đến chủ tài sản..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  required
                  style={{ minHeight: '120px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowChatModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Gửi Tin Nhắn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Overrides for Detail Layout */}
      <style>{`
        @media (max-width: 900px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
