import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { 
  RotateCcw, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User, 
  ChevronRight,
  Sparkles,
  Inbox,
  Star
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, bookings, updateBookingStatus, messages, addMessage, assets, submitReview } = useContext(StoreContext);

  const [userReviews, setUserReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [serviceRating, setServiceRating] = useState(5);
  const [equipmentRating, setEquipmentRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.id) {
      import('../supabaseClient').then(({ supabase }) => {
        supabase.from('reviews').select('booking_id').eq('user_id', user.id).then(({ data }) => {
          if (data) setUserReviews(data.map(r => r.booking_id));
        });
      });
    }
  }, [user]);

  const handleReviewSubmit = async () => {
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    const avg = (serviceRating + equipmentRating) / 2;
    const res = await submitReview({
      asset_id: reviewBooking.assetId,
      booking_id: reviewBooking.id,
      service_rating: serviceRating,
      equipment_rating: equipmentRating,
      average_rating: avg,
      comment: reviewComment
    });
    setIsSubmittingReview(false);
    if (!res.error) {
      setUserReviews(prev => [...prev, reviewBooking.id]);
      setReviewModalOpen(false);
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    } else {
      alert('Lỗi: ' + res.error.message);
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setServiceRating(5);
    setEquipmentRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals' | 'chat'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'returned' | 'cancelled'
  
  // Chat state
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Filter bookings belonging to the current user (with fallback to demo renter bookings if user is the demo partner in customer view)
  const myBookings = bookings.filter(b => 
    b.renterId === user?.id || 
    (user?.id === 'demo-user-id' && b.renterId === 'user-renter-demo')
  );

  // Group unique messages by asset for chat sidebar
  const chatThreads = [];
  const seenAssets = new Set();
  
  // Traverse messages in reverse to find all assets discussed
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!seenAssets.has(msg.assetId)) {
      seenAssets.add(msg.assetId);
      // Find asset info
      const asset = assets.find(a => a.id === msg.assetId);
      chatThreads.push({
        assetId: msg.assetId,
        assetTitle: msg.assetTitle,
        assetImage: asset?.imageUrl || '/camera.png',
        ownerName: asset?.ownerName || 'Đối tác GearUp',
        lastMessage: msg.text,
        timestamp: msg.timestamp
      });
    }
  }

  // Set default selected chat if not set
  useEffect(() => {
    if (chatThreads.length > 0 && !selectedAssetId) {
      setSelectedAssetId(chatThreads[0].assetId);
    }
  }, [chatThreads, selectedAssetId]);

  // Filter messages for current thread
  const threadMessages = messages.filter(m => m.assetId === selectedAssetId);
  const selectedThread = chatThreads.find(t => t.assetId === selectedAssetId);

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu thuê này?')) {
      updateBookingStatus(bookingId, 'cancelled');
      alert('Đã hủy yêu cầu thuê thành công!');
    }
  };

  const handleReturnAsset = (bookingId) => {
    if (window.confirm('Bạn xác nhận muốn hoàn trả thiết bị này cho đối tác?')) {
      updateBookingStatus(bookingId, 'returned');
      alert('Đã hoàn trả thiết bị thành công! Chờ đối tác xác nhận.');
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedAssetId) return;
    
    // Add message
    addMessage(
      selectedAssetId,
      selectedThread?.assetTitle || 'Thiết bị',
      user?.name || 'Khách hàng',
      replyText.trim()
    );
    setReplyText('');
  };

  // Stats calculation
  const totalRentals = myBookings.length;
  const rentingCount = myBookings.filter(b => b.status === 'approved' || b.status === 'paid').length;
  const returnedCount = myBookings.filter(b => b.status === 'returned').length;
  const cancelledCount = myBookings.filter(b => b.status === 'cancelled').length;

  // Filtered bookings based on sub-tab status
  const filteredBookings = myBookings.filter(b => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'approved' && b.status === 'paid') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '30px', 
        background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #ffffff 100%)',
        border: '1px solid rgba(0, 102, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: '#ffffff', 
              fontSize: '11px', 
              fontWeight: '700', 
              padding: '4px 10px', 
              borderRadius: '99px',
              textTransform: 'uppercase'
            }}>
              Khách Hàng
            </span>
            <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h1 style={{ fontSize: '28px', color: 'var(--color-dark)', marginBottom: '4px' }}>
            Xin chào, {user?.name || 'Khách hàng'}!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Quản lý hành trình thuê các thiết bị quay chụp chuyên nghiệp của bạn tại đây.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '10px 16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minWidth: '80px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)' }}>{totalRentals}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Tổng đơn</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minWidth: '80px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)' }}>{rentingCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Đang thuê</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minWidth: '80px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-warning)' }}>{returnedCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Đã trả</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--color-border)',
        marginBottom: '30px',
        gap: '24px'
      }}>
        <button 
          onClick={() => setActiveTab('rentals')}
          style={{
            background: 'none', border: 'none', padding: '12px 8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'rentals' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'rentals' ? '3px solid var(--color-primary)' : '3px solid transparent',
            transition: 'var(--transition-fast)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Calendar size={18} />
          <span>Đơn Thuê Của Tôi</span>
        </button>

        <button 
          onClick={() => setActiveTab('chat')}
          style={{
            background: 'none', border: 'none', padding: '12px 8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'chat' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'chat' ? '3px solid var(--color-primary)' : '3px solid transparent',
            transition: 'var(--transition-fast)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <MessageSquare size={18} />
          <span>Hộp Thư Trò Chuyện</span>
        </button>
      </div>

      {/* Tab content */}
      <main>
        
        {/* RENTALS TAB */}
        {activeTab === 'rentals' && (
          <div>
            {/* Status Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px', 
              flexWrap: 'wrap' 
            }}>
              {[
                { id: 'all', label: 'Tất cả đơn' },
                { id: 'pending', label: 'Chờ duyệt' },
                { id: 'approved', label: 'Đã thanh toán / Đang thuê' },
                { id: 'returned', label: 'Đã hoàn thành' },
                { id: 'cancelled', label: 'Đã hủy' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    border: '1px solid',
                    borderColor: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: statusFilter === tab.id ? 'var(--color-primary-light)' : '#ffffff',
                    color: statusFilter === tab.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      flexWrap: 'wrap',
                      transition: 'var(--transition-normal)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img 
                        src={booking.assetImage} 
                        alt={booking.assetTitle} 
                        style={{ 
                          width: '90px', 
                          height: '90px', 
                          borderRadius: 'var(--radius-md)', 
                          objectFit: 'cover', 
                          backgroundColor: '#f1f5f9',
                          border: '1px solid var(--color-border)'
                        }} 
                      />
                      <div>
                        <h3 style={{ fontSize: '17px', color: 'var(--color-dark)', marginBottom: '8px' }}>
                          {booking.assetTitle}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} />
                            Thời gian thuê: <strong>{booking.startDate}</strong> đến <strong>{booking.endDate}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} />
                            Liên hệ: <strong>{booking.renterName}</strong> ({booking.renterContact})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end', 
                      gap: '10px', 
                      minWidth: '160px',
                      marginLeft: 'auto'
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {formatPrice(booking.totalPrice)} đ
                      </div>
                      
                      <span className={`badge badge-${booking.status === 'paid' ? 'approved' : booking.status}`} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {booking.status === 'pending' && 'Chờ duyệt'}
                        {(booking.status === 'approved' || booking.status === 'paid') && (new Date() < new Date(booking.startDate) ? 'Đã thanh toán' : 'Đang thuê')}
                        {booking.status === 'returned' && 'Đã hoàn thành'}
                        {booking.status === 'cancelled' && 'Đã hủy'}
                      </span>
                      
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {(booking.status === 'pending' || ((booking.status === 'approved' || booking.status === 'paid') && new Date() < new Date(booking.startDate))) && (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ 
                              color: 'var(--color-danger)', 
                              borderColor: 'var(--color-danger)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <Trash2 size={13} />
                            <span>Báo hủy</span>
                          </button>
                        )}
                        
                        {(booking.status === 'approved' || booking.status === 'paid') && new Date() >= new Date(booking.startDate) && (
                          <>
                            <button 
                              className="btn btn-outline btn-sm"
                              style={{ 
                                color: 'var(--color-primary)', 
                                borderColor: 'var(--color-primary)',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px' 
                              }}
                              onClick={() => alert('Tính năng Thuê thêm ngày đang được phát triển!')}
                            >
                              <Calendar size={13} />
                              <span>Thuê thêm</span>
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ 
                                backgroundColor: 'var(--color-primary-light)', 
                                color: 'var(--color-primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px' 
                              }}
                              onClick={() => handleReturnAsset(booking.id)}
                            >
                              <RotateCcw size={13} />
                              <span>Hoàn trả</span>
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'returned' && (
                          userReviews.includes(booking.id) ? (
                            <button disabled className="btn btn-sm" style={{ backgroundColor: '#e2e8f0', color: '#64748b', cursor: 'not-allowed', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Đã Đánh Giá
                            </button>
                          ) : (
                            <button onClick={() => openReviewModal(booking)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Star size={14} /> Đánh Giá
                            </button>
                          )
                        )}

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setSelectedAssetId(booking.assetId);
                            setActiveTab('chat');
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Hỏi đối tác</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}>
                <Inbox size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px', strokeWidth: '1.5' }} />
                <h3 style={{ fontSize: '18px', color: 'var(--color-dark)', marginBottom: '8px' }}>Trống trải quá!</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                  Bạn không có đơn hàng nào thuộc trạng thái này. Tìm kiếm thiết bị quay chụp yêu thích và bắt đầu hành trình sáng tạo của bạn ngay!
                </p>
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="glass-panel" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            height: '600px', 
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)'
          }} className="chat-layout">
            
            {/* Left sidebar: Thread list */}
            <aside style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
                  Hộp Thư Hỗ Trợ
                </h3>
              </div>
              
              <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {chatThreads.length > 0 ? (
                  chatThreads.map((thread) => (
                    <div 
                      key={thread.assetId}
                      onClick={() => setSelectedAssetId(thread.assetId)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: selectedAssetId === thread.assetId ? 'var(--color-primary-light)' : 'transparent',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}
                    >
                      <img 
                        src={thread.assetImage} 
                        alt={thread.assetTitle} 
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)' }} 
                      />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '13px', margin: 0, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-dark)' }}>
                            {thread.ownerName}
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{thread.timestamp}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {thread.assetTitle}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-main)', margin: '4px 0 0 0', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{thread.lastMessage}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    Chưa có cuộc trò chuyện nào.
                  </div>
                )}
              </div>
            </aside>

            {/* Right container: Message list & Text input */}
            <section style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
              {selectedAssetId && selectedThread ? (
                <>
                  {/* Top Bar info */}
                  <div style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid var(--color-border)', 
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={selectedThread.assetImage} alt={selectedThread.assetTitle} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{selectedThread.ownerName}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Liên quan tới: <strong>{selectedThread.assetTitle}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {threadMessages.map((msg) => {
                      const isMe = msg.senderName === (user?.name || 'Khách hàng');
                      return (
                        <div 
                          key={msg.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', paddingLeft: '4px' }}>
                            {msg.senderName} • {msg.timestamp}
                          </div>
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            backgroundColor: isMe ? 'var(--color-primary)' : '#ffffff',
                            color: isMe ? '#ffffff' : 'var(--color-text-main)',
                            fontSize: '14px',
                            border: isMe ? 'none' : '1px solid var(--color-border)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Text Input reply form */}
                  <form onSubmit={handleSendReply} style={{ 
                    padding: '16px 20px', 
                    backgroundColor: '#ffffff', 
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Nhập tin nhắn để thảo luận với đối tác..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ flexGrow: 1, borderRadius: '99px' }}
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ 
                        borderRadius: '50%', 
                        width: '40px', 
                        height: '40px', 
                        padding: 0, 
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', padding: '20px' }}>
                  <MessageSquare size={48} style={{ strokeWidth: '1', marginBottom: '16px' }} />
                  <p>Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin với đối tác.</p>
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      <style>{`
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
          .chat-layout aside {
            max-height: 200px;
          }
        }
      `}</style>
      {/* Review Modal */}
      {reviewModalOpen && reviewBooking && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', margin: 0 }}>Đánh giá sản phẩm</h3>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><XCircle size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <img src={reviewBooking.assetImage} alt={reviewBooking.assetTitle} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ fontWeight: '600' }}>{reviewBooking.assetTitle}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Chất lượng dịch vụ</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={`srv-${star}`} 
                    size={28} 
                    fill={star <= serviceRating ? "#f59e0b" : "none"} 
                    color={star <= serviceRating ? "#f59e0b" : "#cbd5e1"} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setServiceRating(star)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Chất lượng thiết bị</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={`eq-${star}`} 
                    size={28} 
                    fill={star <= equipmentRating ? "#f59e0b" : "none"} 
                    color={star <= equipmentRating ? "#f59e0b" : "#cbd5e1"} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setEquipmentRating(star)}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Nhận xét của bạn</label>
              <textarea 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm và dịch vụ của chủ cho thuê..."
                style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setReviewModalOpen(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" onClick={handleReviewSubmit} disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Đang Gửi...' : 'Gửi Đánh Giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
