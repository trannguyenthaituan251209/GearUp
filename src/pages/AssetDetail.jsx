import React, { useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { StoreContext } from '../context/StoreContext';
import AssetCard, { formatPrice } from '../components/AssetCard';
import { ArrowLeft, MessageSquare, Heart, Star, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';

export default function AssetDetail({ assetId, setCurrentPage }) {
  const { assets, bookings, addMessage, messages, user, favorites = [], setCurrentCheckout, toggleFavorite, setShowAuthModal } = useContext(StoreContext);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const goBackToMarket = () => {
    setCurrentPage('home');
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Booking state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterName, setRenterName] = useState(''); // no default mock text
  const [renterContact, setRenterContact] = useState('');
  const [rentalDays, setRentalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setRenterName(user.name);
      if (user.phone) {
        setRenterContact(user.phone);
      }
    }
  }, [user]);

  // Find asset
  const asset = assets.find((a) => a.id === assetId);
  const isFavorited = favorites.includes(asset?.id);

  const [realOwnerName, setRealOwnerName] = useState(null);
  const [realOwnerAvatar, setRealOwnerAvatar] = useState(null);
  const [ownerGeneralPolicy, setOwnerGeneralPolicy] = useState('');
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (asset?.ownerId) {
      supabase
        .from('profiles')
        .select('name, studio_name, avatar, general_policy')
        .eq('id', asset.ownerId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setRealOwnerName(data.studio_name || data.name);
            if (data.avatar) setRealOwnerAvatar(data.avatar);
            if (data.general_policy) setOwnerGeneralPolicy(data.general_policy);
          }
        });
    }
  }, [asset?.ownerId]);

  // Fetch Reviews
  useEffect(() => {
    if (assetId) {
      supabase
        .from('reviews')
        .select(`
          id, user_id, service_rating, equipment_rating, average_rating, comment, created_at
        `)
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })
        .then(async ({ data, error }) => {
          if (!error && data) {
            let enrichedData = data;
            if (data.length > 0) {
              const userIds = [...new Set(data.map(r => r.user_id))];
              const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
              
              if (profilesData) {
                const profilesMap = {};
                profilesData.forEach(p => profilesMap[p.id] = p);
                enrichedData = data.map(r => ({ ...r, profiles: profilesMap[r.user_id] }));
              }
              
              const total = data.reduce((sum, r) => sum + Number(r.average_rating), 0);
              setAverageRating((total / data.length).toFixed(1));
            }
            setReviews(enrichedData);
          }
        });
    }
  }, [assetId]);

  // Calculate rental days & total price when dates change
  useEffect(() => {
    if (startDate && endDate && asset?.pricePerDay) {
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
  }, [startDate, endDate, asset?.pricePerDay]);

  const assetBookings = (bookings || []).filter(b => b.assetId === assetId && ['pending', 'approved', 'paid', 'renting'].includes(b.status));

  const bookedDates = useMemo(() => {
    let dates = [];
    assetBookings.forEach(b => {
      let start = new Date(b.startDate);
      let end = new Date(b.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      let d = new Date(start);
      while(d <= end) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return dates;
  }, [assetBookings]);

  const onChangeDatePicker = (dates) => {
    const [start, end] = dates;
    
    // Check if the selected range includes any booked dates
    if (start && end) {
      let d = new Date(start);
      let hasConflict = false;
      while(d <= end) {
        if (bookedDates.some(bd => bd.getTime() === d.getTime())) {
          hasConflict = true;
          break;
        }
        d.setDate(d.getDate() + 1);
      }
      if (hasConflict) {
        alert("Khoảng thời gian bạn chọn có chứa ngày đã được thuê. Vui lòng chọn lại!");
        return;
      }
    }

    setStartDate(start ? start.toISOString().split('T')[0] : '');
    setEndDate(end ? end.toISOString().split('T')[0] : '');
  };

  // If asset not found
  if (!asset) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={goBackToMarket}>
          Quay lại Chợ tài sản
        </button>
      </div>
    );
  }



  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để tiếp tục thuê thiết bị.");
      setShowAuthModal(true);
      return;
    }
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

    // Save to currentCheckout and redirect to checkout page
    setCurrentCheckout({
      assetId: asset.id,
      assetTitle: asset.title,
      assetImage: asset.imageUrl,
      pricePerDay: asset.pricePerDay,
      startDate,
      endDate,
      rentalDays,
      totalPrice,
      renterName,
      renterContact,
      ownerId: asset.ownerId
    });

    setCurrentPage('checkout');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const senderName = (user && user.id === asset.ownerId) ? asset.ownerName : renterName;
    addMessage(asset.id, asset.title, senderName, chatMessage, user?.id, asset.ownerId, user?.id);
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
        onClick={goBackToMarket} 
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

      {/* Main Grid Layout - Shopee Style */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Section: Image (Left) + Info & Booking (Right) */}
        <div className="glass-panel detail-top" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          
          {/* Left: Image */}
          <div>
            <div style={{ width: '100%', aspectRatio: '1/1', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
              <img src={asset.imageUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Right: Info & Booking */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <h1 className="asset-title" style={{ fontSize: '24px', fontWeight: '500', marginBottom: '12px', lineHeight: '1.4', wordWrap: 'break-word' }}>{asset.title}</h1>
            
            {/* Metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ borderBottom: '1px solid var(--color-primary)' }}>{asset.rating.toFixed(1)}</span> <span style={{ color: 'var(--color-primary)' }}>★</span>
              </span>
              <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--color-border)' }}></span>
              <span style={{ color: 'var(--color-text-main)' }}>Khu vực: {asset.location}</span>
            </div>

            {/* Price Box */}
            <div className="price-box" style={{ backgroundColor: 'var(--color-primary-light)', padding: '16px 20px', marginBottom: '24px', borderRadius: '4px' }}>
              <div className="price-text" style={{ fontSize: '30px', fontWeight: '500', color: 'var(--color-primary-active)' }}>
                {formatPrice(asset.pricePerDay)} đ <span style={{ fontSize: '14px', color: 'var(--color-text-main)', fontWeight: '400' }}>/ ngày</span>
              </div>
            </div>

            {/* Booking Form */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary-hover)', borderRadius: '4px', fontWeight: '600' }}>
                  Yêu cầu thuê tài sản thành công!<br/>
                  <span style={{ fontSize: '13px', fontWeight: '400' }}>Đang chuyển hướng sang Dashboard...</span>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Lịch trạng thái (Chọn ngày bắt đầu và kết thúc)</label>
                    <div className="custom-datepicker-container">
                      <DatePicker
                        selected={startDate ? new Date(startDate) : null}
                        onChange={onChangeDatePicker}
                        startDate={startDate ? new Date(startDate) : null}
                        endDate={endDate ? new Date(endDate) : null}
                        selectsRange
                        inline
                        locale={vi}
                        excludeDates={asset.status === 'paused' ? [] : bookedDates}
                        minDate={new Date()}
                        filterDate={asset.status === 'paused' ? () => false : undefined}
                      />
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      * Chú thích: Nếu thuê 1 ngày thì click vào ngày đó 2 lần.
                    </div>
                    
                    {(startDate || endDate) && (
                      <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '6px', border: '1px dashed var(--color-primary)', fontSize: '14px', color: 'var(--color-dark)' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)', marginBottom: '4px' }}>Ngày đang chọn:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-primary-active)' }}>{startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '...'}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>đến</span>
                          <span style={{ fontWeight: '600', color: 'var(--color-primary-active)' }}>{endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '...'}</span>
                        </div>
                      </div>
                    )}

                    {asset.status === 'paused' && (
                      <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-danger)' }}>
                        * Thiết bị hiện đang tạm dừng cho thuê.
                      </div>
                    )}
                  </div>

                  <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Họ tên người thuê</label>
                      <input type="text" className="form-control" placeholder="Nhập họ tên đầy đủ" value={renterName} onChange={(e) => setRenterName(e.target.value)} required style={{ padding: '10px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Số điện thoại</label>
                      <input type="tel" className="form-control" placeholder="Nhập số điện thoại" value={renterContact} onChange={(e) => setRenterContact(e.target.value)} required style={{ padding: '10px' }} />
                    </div>
                  </div>

                  {rentalDays > 0 && (
                    <div style={{ marginTop: '8px', padding: '12px 16px', backgroundColor: 'var(--color-primary-light)', border: '1px dashed var(--color-primary)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Số ngày thuê:</span>
                        <strong>{rentalDays} ngày</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500', fontSize: '16px', color: 'var(--color-dark)' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Tổng thanh toán:</span>
                        <span style={{ color: 'var(--color-primary-active)', fontSize: '18px' }}>{formatPrice(totalPrice)} đ</span>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary" disabled={asset.status !== 'available'} style={{ flex: 1, height: '48px', fontSize: '16px', borderRadius: '4px' }}>
                      {asset.status === 'available' ? 'Thuê Ngay' : 'Không Sẵn Sàng'}
                    </button>
                    {user && (
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ height: '48px', padding: '0 20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFavorited ? '#ef4444' : 'inherit', borderColor: isFavorited ? '#ef4444' : 'var(--color-border)' }} 
                        onClick={() => toggleFavorite(asset.id)}
                        title={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} />
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Policies & Accessories Section */}
        <div className="glass-panel policies-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          <div>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '12px', color: 'rgba(0,0,0,.87)' }}>Chính Sách & Ưu Đãi</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {asset.policies || 'Chưa cập nhật chính sách từ chủ tài sản. Áp dụng quy định chung của nền tảng.'}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', marginBottom: '12px', color: 'rgba(0,0,0,.87)' }}>Phụ Kiện Đi Kèm</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {asset.accessories || 'Chưa cập nhật phụ kiện đi kèm.'}
            </p>
          </div>
        </div>

        {/* Middle Section: Shop Info */}
        <div className="glass-panel shop-info-bar" style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img src={realOwnerAvatar || asset.ownerAvatar} alt={realOwnerName || asset.ownerName} style={{ width: '78px', height: '78px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e0e0e0' }} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>{realOwnerName || asset.ownerName}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Online 7 Giờ Trước</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '14px', borderRadius: '4px', flex: '1 1 auto', justifyContent: 'center' }} onClick={() => {
                  if (!user) {
                    alert("Vui lòng đăng nhập để nhắn tin với chủ thiết bị.");
                    setShowAuthModal(true);
                    return;
                  }
                  setShowChatModal(true);
                }}>
                  <MessageSquare size={14} /> Chat Ngay
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', borderColor: '#ccc', padding: '6px 16px', fontSize: '14px', borderRadius: '4px', flex: '1 1 auto', justifyContent: 'center' }}
                  onClick={() => {
                    if (asset.ownerId) {
                      setCurrentPage('partner-profile', asset.ownerId);
                    } else {
                      alert("Không tìm thấy ID của chủ cửa hàng!");
                    }
                  }}
                >
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1px solid #555', borderRadius: '2px', textAlign: 'center', lineHeight: '12px', fontSize: '10px' }}>S</span> Xem Shop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-panel reviews-section" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          <div style={{ backgroundColor: '#fafafa', padding: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', textTransform: 'uppercase', color: 'rgba(0,0,0,.87)' }}>
              Đánh Giá Sản Phẩm
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={20} 
                    fill={star <= Math.round(averageRating) ? "#f59e0b" : "none"} 
                    color={star <= Math.round(averageRating) ? "#f59e0b" : "#cbd5e1"} 
                  />
                ))}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                {averageRating > 0 ? `${averageRating}/5` : 'Chưa có'}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>({reviews.length} đánh giá)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px 0' }}>
                Sản phẩm này chưa có đánh giá nào.
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                  <img 
                    src={review.profiles?.avatar || 'https://imgh.in/host/i0s5n9'} 
                    alt={review.profiles?.name || 'Khách hàng'} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{review.profiles?.name || 'Khách hàng ẩn danh'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Dịch vụ: 
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={`s-${star}`} size={10} fill={star <= review.service_rating ? "#f59e0b" : "none"} color={star <= review.service_rating ? "#f59e0b" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Thiết bị: 
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={`e-${star}`} size={10} fill={star <= review.equipment_rating ? "#f59e0b" : "none"} color={star <= review.equipment_rating ? "#f59e0b" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-dark)', lineHeight: '1.5' }}>
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section: Description & Specs */}
        <div className="glass-panel bottom-section" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          <div style={{ backgroundColor: '#fafafa', padding: '14px', marginBottom: '24px', fontSize: '18px', textTransform: 'uppercase', color: 'rgba(0,0,0,.87)' }}>
            Mô Tả Sản Phẩm
          </div>

          <div style={{ padding: '0 14px' }} className="bottom-content">
            <div className="spec-grid" style={{ marginBottom: '24px', fontSize: '14px', color: 'rgba(0,0,0,.8)', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px' }}>
              {asset.cameraType && <><div style={{ color: 'rgba(0,0,0,.4)' }}>Loại máy</div><div>{asset.cameraType}</div></>}
              {asset.sensorType && <><div style={{ color: 'rgba(0,0,0,.4)' }}>Cảm biến</div><div>{asset.sensorType}</div></>}
              {asset.mount && <><div style={{ color: 'rgba(0,0,0,.4)' }}>Ngàm</div><div>{asset.mount}</div></>}
              {asset.specs && asset.specs.length > 0 && (
                <><div style={{ color: 'rgba(0,0,0,.4)' }}>Tính năng</div>
                <div>{asset.specs.join(' - ')}</div></>
              )}
            </div>

            <div style={{ fontSize: '14px', color: 'rgba(0,0,0,.8)', lineHeight: '1.8', whiteSpace: 'pre-line', textAlign: 'justify', wordBreak: 'break-word' }}>
              {asset.description}
            </div>

            {(asset.specificPolicy || ownerGeneralPolicy) && (
              <div style={{ marginTop: '32px', backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={18} fill="currentColor" />
                  Chính sách & Ưu đãi của Đối tác
                </h2>
                {asset.specificPolicy && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-dark)', marginBottom: '4px' }}>Dành riêng cho thiết bị này:</h3>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{asset.specificPolicy}</div>
                  </div>
                )}
                {ownerGeneralPolicy && (
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-dark)', marginBottom: '4px' }}>Chính sách chung:</h3>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{ownerGeneralPolicy}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Suggested Assets */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: 'none' }}>
          <h3 style={{ fontSize: '18px', textTransform: 'uppercase', marginBottom: '24px', color: 'rgba(0,0,0,.87)' }}>Gợi ý thiết bị</h3>
          
          <div className="suggested-assets-container">
            {assets.filter(a => a.id !== asset.id).slice(0, 5).map(a => (
              <AssetCard key={a.id} asset={a} onSelect={() => setCurrentPage('asset-detail', a.id)} />
            ))}
          </div>
        </div>

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
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', backgroundColor: isMe ? 'var(--color-primary)' : '#f1f5f9', color: isMe ? 'white' : 'var(--color-text-primary)', padding: '8px 12px', borderRadius: '8px', maxWidth: '80%' }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>{m.senderName} • {m.timestamp}</div>
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
        /* Custom Datepicker UI */
        .custom-datepicker-container .react-datepicker {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-family: inherit;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          width: 100%;
        }
        .custom-datepicker-container .react-datepicker__month-container {
          width: 100%;
        }
        .custom-datepicker-container .react-datepicker__header {
          background-color: transparent;
          border-bottom: none;
          padding-top: 0;
        }
        .custom-datepicker-container .react-datepicker__current-month {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 12px;
        }
        .custom-datepicker-container .react-datepicker__day-name {
          color: var(--color-text-muted);
          font-weight: 600;
          width: 44px;
          margin: 0;
        }
        .custom-datepicker-container .react-datepicker__day {
          width: 44px;
          height: 44px;
          line-height: 44px;
          margin: 0;
          border-radius: 0 !important;
          color: var(--color-dark);
          font-weight: 500;
          background-color: transparent;
          border: none;
        }
        /* Hover on available days */
        .custom-datepicker-container .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--excluded):not(.react-datepicker__day--in-range):not(.react-datepicker__day--selecting-range-start) {
          background-image: radial-gradient(circle at center, #f1f5f9 20px, transparent 20.5px);
        }
        
        /* Remove confusing default today highlight */
        .custom-datepicker-container .react-datepicker__day--keyboard-selected {
          background-color: transparent !important;
          color: inherit !important;
        }
        .custom-datepicker-container .react-datepicker__day--today:not(.react-datepicker__day--in-range):not(.react-datepicker__day--selecting-range-start) {
          background-image: radial-gradient(circle at center, transparent 19px, var(--color-primary) 19.5px, var(--color-primary) 21px, transparent 21.5px) !important;
        }

        /* Kín lịch - Đỏ hồng */
        .custom-datepicker-container .react-datepicker__day--excluded {
          background-image: radial-gradient(circle at center, #ffe4e6 20px, transparent 20.5px) !important;
          background-color: transparent !important;
          color: #e11d48 !important;
          font-weight: 700;
        }

        /* Không khả dụng - Xám */
        .custom-datepicker-container .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          background-color: transparent !important;
          text-decoration: line-through;
        }

        /* Đang chọn - Timeline effect */
        .custom-datepicker-container .react-datepicker__day--in-range,
        .custom-datepicker-container .react-datepicker__day--in-selecting-range {
          background-image: linear-gradient(to bottom, transparent 10px, #e0f2fe 10px, #e0f2fe 34px, transparent 34px) !important;
          background-color: transparent !important;
          color: var(--color-primary) !important;
          font-weight: 700;
        }

        /* Start nodes - Phình to, Xanh nước biển lõi trắng */
        .custom-datepicker-container .react-datepicker__day--range-start,
        .custom-datepicker-container .react-datepicker__day--selecting-range-start {
          background-image: 
            radial-gradient(circle at center, #ffffff 17px, var(--color-primary) 17.5px, var(--color-primary) 21.5px, transparent 22px),
            linear-gradient(to bottom, transparent 10px, #e0f2fe 10px, #e0f2fe 34px, transparent 34px) !important;
          background-position: center, 22px center !important;
          background-size: 100% 100%, 22px 100% !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;
          color: var(--color-primary) !important;
        }

        /* End nodes - Phình to, Xanh nước biển lõi trắng */
        .custom-datepicker-container .react-datepicker__day--range-end,
        .custom-datepicker-container .react-datepicker__day--selecting-range-end {
          background-image: 
            radial-gradient(circle at center, #ffffff 17px, var(--color-primary) 17.5px, var(--color-primary) 21.5px, transparent 22px),
            linear-gradient(to bottom, transparent 10px, #e0f2fe 10px, #e0f2fe 34px, transparent 34px) !important;
          background-position: center, 0px center !important;
          background-size: 100% 100%, 22px 100% !important;
          background-repeat: no-repeat !important;
          background-color: transparent !important;
          color: var(--color-primary) !important;
        }

        /* Same day start and end */
        .custom-datepicker-container .react-datepicker__day--range-start.react-datepicker__day--range-end,
        .custom-datepicker-container .react-datepicker__day--selecting-range-start.react-datepicker__day--selecting-range-end {
          background-image: radial-gradient(circle at center, #ffffff 17px, var(--color-primary) 17.5px, var(--color-primary) 21.5px, transparent 22px) !important;
          background-size: 100% 100% !important;
          background-position: center !important;
          background-color: transparent !important;
          color: var(--color-primary) !important;
        }

        @media (max-width: 900px) {
          .detail-top {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 24px !important;
          }
          .policies-section {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
            gap: 16px !important;
          }
          .responsive-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .shop-info-bar {
            padding: 16px !important;
          }
          .bottom-section {
            padding: 16px !important;
          }
          .bottom-content {
            padding: 0 4px !important;
          }
          .spec-grid {
            grid-template-columns: 110px 1fr !important;
          }
          .asset-title {
            font-size: 20px !important;
          }
          .price-box {
            padding: 12px 16px !important;
          }
          .price-text {
            font-size: 24px !important;
          }
        }
        
        /* Suggested assets layout: grid on desktop, horizontal scroll on mobile */
        .suggested-assets-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .suggested-assets-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 12px;
          }
          .suggested-assets-container > div {
            min-width: 200px;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  );
}
