import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { 
  Folder, 
  Bell, 
  Plus, 
  DollarSign, 
  Camera, 
  Users, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  CheckCircle,
  FileText,
  MapPin,
  Calendar
} from 'lucide-react';

export default function PartnerDashboard() {
  const { user, assets, bookings, updateBookingStatus, updateAssetStatus, addAsset } = useContext(StoreContext);
  
  // Tab navigation: 'overview' | 'listings' | 'requests' | 'add-new'
  const [activeTab, setActiveTab] = useState('overview');

  // New Asset Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('sony_cam');
  const [location, setLocation] = useState('TP. Hồ Chí Minh');
  const [pricePerDay, setPricePerDay] = useState('');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [imageSelect, setImageSelect] = useState('/camera.png');

  // Filter assets owned by this partner (fallback to 'Nguyễn Minh Quân' for demo context)
  const myAssets = assets.filter(a => 
    a.ownerId === user?.id || 
    (user?.id === 'demo-user-id' && a.ownerName === 'Nguyễn Minh Quân')
  );
  
  const myAssetIds = myAssets.map(a => a.id);

  // Filter bookings related to this partner's assets
  const myBookings = bookings.filter(b => myAssetIds.includes(b.assetId));

  // Partner specific statistics
  const totalRevenue = myBookings
    .filter(b => ['approved', 'returned'].includes(b.status))
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const activeAssetsCount = myAssets.filter(a => a.status === 'available').length;
  const pausedAssetsCount = myAssets.filter(a => a.status === 'paused').length;
  const pendingRequestsCount = myBookings.filter(b => b.status === 'pending').length;

  // Mock list of regular customers (Thống kê khách hàng)
  const uniqueCustomers = [];
  const seenRenterNames = new Set();
  myBookings.forEach(b => {
    if (!seenRenterNames.has(b.renterName)) {
      seenRenterNames.add(b.renterName);
      uniqueCustomers.push({
        name: b.renterName,
        contact: b.renterContact,
        totalSpent: b.totalPrice,
        rentalsCount: 1
      });
    } else {
      const existing = uniqueCustomers.find(c => c.name === b.renterName);
      if (existing) {
        existing.totalSpent += b.totalPrice;
        existing.rentalsCount += 1;
      }
    }
  });

  // Mock monthly revenue data for SVG Chart rendering (Phân tích dữ liệu)
  const monthlyRevenue = [
    { label: 'Tháng 12', val: 3200000 },
    { label: 'Tháng 1', val: 4500000 },
    { label: 'Tháng 2', val: 5100000 },
    { label: 'Tháng 3', val: 4200000 },
    { label: 'Tháng 4', val: 6800000 },
    { label: 'Tháng 5', val: totalRevenue || 7500000 }
  ];

  const maxVal = Math.max(...monthlyRevenue.map(d => d.val));

  const handleApproveBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'approved');
    alert('Đã phê duyệt yêu cầu thuê của khách hàng!');
  };

  const handleRejectBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'cancelled');
    alert('Đã từ chối yêu cầu thuê.');
  };

  const handleToggleAssetStatus = (assetId, currentStatus) => {
    const nextStatus = currentStatus === 'paused' ? 'available' : 'paused';
    updateAssetStatus(assetId, nextStatus);
    alert(`Đã cập nhật trạng thái thiết bị thành: ${nextStatus === 'available' ? 'Cho thuê' : 'Tạm ngừng cho thuê'}`);
  };

  const handleSubmitAsset = (e) => {
    e.preventDefault();
    if (!title.trim() || !pricePerDay || !description.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin thiết bị!');
      return;
    }

    const specsArray = specsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    addAsset({
      title,
      category,
      location,
      pricePerDay: parseInt(pricePerDay),
      imageUrl: imageSelect,
      description,
      specs: specsArray.length > 0 ? specsArray : ['Hoạt động hoàn hảo', 'Chất lượng cao'],
      ownerId: user?.id || 'demo-user-id',
      ownerName: user?.name || 'Nguyễn Minh Quân'
    });

    alert('Đăng thiết bị cho thuê mới thành công!');
    
    // Reset Form
    setTitle('');
    setPricePerDay('');
    setDescription('');
    setSpecsText('');
    setImageSelect('/camera.png');

    // Redirect
    setActiveTab('listings');
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Kênh Đối Tác Nền Tảng</h1>
            <span style={{ 
              backgroundColor: 'var(--color-primary-light)', 
              color: 'var(--color-primary)', 
              fontSize: '12px', 
              fontWeight: '700', 
              padding: '4px 12px', 
              borderRadius: 'var(--radius-full)', 
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(0, 102, 255, 0.3)'
            }} title="Giao diện quản lý subdomain trong tương lai">
              🌐 partner.example.com
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Xin chào đối tác <strong style={{ color: 'var(--color-secondary)' }}>{user?.studioName || user?.name || 'Nguyễn Minh Quân'}</strong>.
            Quản lý doanh thu, duyệt yêu cầu và phân tích dữ liệu cho thuê của bạn.
          </p>
        </div>
        
        <button 
          className="btn btn-lessor"
          onClick={() => setActiveTab('add-new')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-secondary)' }}
        >
          <Plus size={16} />
          <span>Đăng thiết bị mới</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Doanh thu */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', borderLeft: '5px solid var(--color-success)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tổng doanh thu</span>
            <DollarSign size={20} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-dark)' }}>
            {formatPrice(totalRevenue)} đ
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <TrendingUp size={12} />
            <span>Tăng trưởng 18% tháng này</span>
          </div>
        </div>

        {/* Thiết bị đang cho thuê */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', borderLeft: '5px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Thiết bị đang cho thuê</span>
            <Camera size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-dark)' }}>
            {activeAssetsCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {pausedAssetsCount} thiết bị đang ngừng cho thuê
          </div>
        </div>

        {/* Khách hàng */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', borderLeft: '5px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Số lượng khách hàng</span>
            <Users size={20} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-dark)' }}>
            {uniqueCustomers.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Đối tượng sáng tạo nghệ thuật, quay chụp
          </div>
        </div>

        {/* Yêu cầu đang chờ */}
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', borderLeft: '5px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Đơn chờ duyệt</span>
            <Bell size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-warning)' }}>
            {pendingRequestsCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Cần phê duyệt sớm cho khách
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '30px',
        gap: '24px',
        overflowX: 'auto'
      }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
          }}
        >
          <TrendingUp size={16} />
          <span>Tổng Quan & Phân Tích</span>
        </button>

        <button 
          onClick={() => setActiveTab('listings')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'listings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'listings' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
          }}
        >
          <Folder size={16} />
          <span>Quản Lý Thiết Bị ({myAssets.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'requests' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'requests' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
          }}
        >
          <Bell size={16} />
          <span>Yêu Cầu Thuê ({myBookings.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('add-new')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'add-new' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'add-new' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
          }}
        >
          <Plus size={16} />
          <span>Đăng Thiết Bị Mới</span>
        </button>
      </div>

      {/* Tabs Content */}
      <main>
        
        {/* OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px' }} className="grid-2">
            
            {/* Chart Panel */}
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                Phân Tích Doanh Thu Theo Tháng (đ)
              </h3>
              
              {/* SVG Monthly Bar Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '2px solid var(--color-border)' }}>
                  {monthlyRevenue.map((item, idx) => {
                    const heightPercent = maxVal > 0 ? (item.val / maxVal) * 80 : 0;
                    return (
                      <div key={idx} style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        height: '100%', 
                        justifyContent: 'flex-end',
                        padding: '0 8px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                          {formatPrice(item.val)}
                        </span>
                        
                        <div style={{ 
                          width: '100%', 
                          maxWidth: '45px', 
                          height: `${heightPercent}%`, 
                          background: 'linear-gradient(to top, var(--color-primary) 0%, #3b82f6 100%)',
                          borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                          transition: 'height 0.8s ease-out',
                          boxShadow: 'var(--shadow-sm)'
                        }} />
                        
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customers Panel */}
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--color-secondary)' }} />
                Thống Kê Khách Hàng
              </h3>

              {uniqueCustomers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {uniqueCustomers.map((customer, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-dark)' }}>{customer.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>SĐT: {customer.contact}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>
                          {formatPrice(customer.totalSpent)} đ
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {customer.rentalsCount} đơn thuê
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                  Chưa có thông tin khách hàng nào giao dịch.
                </p>
              )}
            </div>

          </div>
        )}

        {/* LISTINGS MANAGEMENT */}
        {activeTab === 'listings' && (
          <div>
            {myAssets.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '20px'
              }}>
                {myAssets.map((asset) => (
                  <div key={asset.id} className="glass-panel" style={{ display: 'flex', backgroundColor: '#ffffff', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img src={asset.imageUrl} alt={asset.title} style={{ width: '130px', height: '100%', objectFit: 'cover' }} />
                    
                    <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ 
                          fontSize: '15px', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden', 
                          lineHeight: '1.3',
                          marginBottom: '6px'
                        }}>
                          {asset.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          <span>{asset.location}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {formatPrice(asset.pricePerDay)} đ
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>/ ngày</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          {/* Active / Paused Badge */}
                          <span className={`badge badge-${asset.status === 'paused' ? 'returned' : 'available'}`} style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                            {asset.status === 'paused' ? 'Ngừng thuê' : 'Đang cho thuê'}
                          </span>
                          
                          {/* Toggle Status Button */}
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '11px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              borderColor: asset.status === 'paused' ? 'var(--color-success)' : 'var(--color-border)'
                            }}
                            onClick={() => handleToggleAssetStatus(asset.id, asset.status)}
                          >
                            {asset.status === 'paused' ? (
                              <>
                                <Eye size={12} />
                                <span>Kích hoạt</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                <span>Tạm dừng</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }}>Bạn chưa có thiết bị cho thuê nào được đăng ký.</p>
                <button className="btn btn-lessor" onClick={() => setActiveTab('add-new')}>Đăng ký thiết bị đầu tiên</button>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS APPROVAL */}
        {activeTab === 'requests' && (
          <div className="glass-panel" style={{ backgroundColor: '#ffffff', overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            {myBookings.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Thiết bị</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Khách hàng</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Thời gian thuê</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Doanh thu dự kiến</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Trạng thái</th>
                    <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'var(--transition-fast)' }}>
                      <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={b.assetImage} alt={b.assetTitle} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-dark)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.assetTitle}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-dark)' }}>{b.renterName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>SĐT: {b.renterContact}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                          {b.startDate} → {b.endDate}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: '800', color: 'var(--color-primary)', fontSize: '14px' }}>
                        {formatPrice(b.totalPrice)} đ
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge badge-${b.status}`}>
                          {b.status === 'pending' && 'Chờ duyệt'}
                          {b.status === 'approved' && 'Đã duyệt'}
                          {b.status === 'returned' && 'Đã trả'}
                          {b.status === 'cancelled' && 'Đã hủy'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {b.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleApproveBooking(b.id)}
                              style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}
                            >
                              <Check size={12} />
                              <span>Duyệt</span>
                            </button>
                            
                            <button 
                              className="btn btn-outline btn-sm" 
                              style={{ 
                                color: 'var(--color-danger)', 
                                borderColor: 'var(--color-danger)',
                                padding: '4px 10px', 
                                fontSize: '11px',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '2px' 
                              }}
                              onClick={() => handleRejectBooking(b.id)}
                            >
                              <X size={12} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Chưa nhận được yêu cầu thuê tài sản nào từ khách hàng.
              </div>
            )}
          </div>
        )}

        {/* ADD NEW ASSET */}
        {activeTab === 'add-new' && (
          <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-dark)' }}>
              <Plus size={20} style={{ color: 'var(--color-primary)' }} />
              Đăng ký thiết bị cho thuê mới
            </h3>
            
            <form onSubmit={handleSubmitAsset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Tên thiết bị quay chụp</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ví dụ: Máy ảnh Sony Alpha 7R V, Ống kính Canon RF 24-70mm..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Phân loại danh mục</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="sony_cam">Máy ảnh Sony</option>
                    <option value="canon_cam">Máy ảnh Canon</option>
                    <option value="fuji_cam">Máy ảnh Fujifilm</option>
                    <option value="sony_lens">Ống kính Sony</option>
                    <option value="canon_lens">Ống kính Canon</option>
                    <option value="flycam">Flycam & Drone</option>
                    <option value="gimbal">Gimbal chống rung</option>
                    <option value="studio_light">Đèn Studio</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Khu vực cho thuê</label>
                  <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Giá cho thuê / Ngày (đ)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Ví dụ: 350000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hình ảnh mô phỏng (Chọn mẫu có sẵn)</label>
                  <select className="form-control" value={imageSelect} onChange={(e) => setImageSelect(e.target.value)}>
                    <option value="/camera.png">Mẫu Máy ảnh (Camera)</option>
                    <option value="/flycam.png">Mẫu Flycam (Drone)</option>
                    <option value="/gimbal.png">Mẫu Gimbal (Stabilizer)</option>
                    <option value="/light.png">Mẫu Đèn Studio (LED Light)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Thông số kỹ thuật nổi bật (Phân cách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ví dụ: Cảm biến 61MP, Quay phim 8K, 3-axis stabilization..."
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết & Quy định cho thuê</label>
                <textarea 
                  className="form-control" 
                  placeholder="Mô tả chi tiết tình trạng thiết bị, phụ kiện kèm theo (pin, sạc, thẻ nhớ), quy định nhận trả và đặt cọc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('overview')}>Hủy</button>
                <button type="submit" className="btn btn-lessor" style={{ backgroundColor: 'var(--color-secondary)' }}>Đăng thiết bị ngay</button>
              </div>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
