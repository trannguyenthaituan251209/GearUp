import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { Folder, Bell, Plus } from 'lucide-react';

export default function LessorDashboard() {
  const { assets, bookings, updateBookingStatus, addAsset } = useContext(StoreContext);
  
  // Dashboard navigation tab: 'listings' | 'requests' | 'add-new'
  const [activeTab, setActiveTab] = useState('listings');

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('body_lens');
  const [location, setLocation] = useState('TP. Hồ Chí Minh');
  const [pricePerDay, setPricePerDay] = useState('');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [imageSelect, setImageSelect] = useState('/camera.png'); // default option

  // Filter assets owned by the Lessor demo (ownerName: 'Nguyễn Minh Quân')
  const myAssets = assets.filter((a) => a.ownerName === 'Nguyễn Minh Quân');
  const myAssetIds = myAssets.map((a) => a.id);

  // Filter bookings for my assets
  const myBookings = bookings.filter((b) => myAssetIds.includes(b.assetId));

  // Calculating stats
  const totalListings = myAssets.length;
  const pendingRequests = myBookings.filter((b) => b.status === 'pending').length;
  
  // Total earnings from approved/active/returned bookings
  const totalEarnings = myBookings
    .filter((b) => ['approved', 'active', 'returned'].includes(b.status))
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleSubmitAsset = (e) => {
    e.preventDefault();
    if (!title.trim() || !pricePerDay || !description.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin tài sản!');
      return;
    }

    const specsArray = specsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    addAsset({
      title,
      category,
      location,
      pricePerDay: parseInt(pricePerDay),
      imageUrl: imageSelect,
      description,
      specs: specsArray.length > 0 ? specsArray : ['Thiết bị chất lượng tốt', 'Hoạt động hoàn hảo']
    });

    alert('Đăng tài sản cho thuê mới thành công!');
    
    // Clear form
    setTitle('');
    setPricePerDay('');
    setDescription('');
    setSpecsText('');
    
    // Redirect to listings tab
    setActiveTab('listings');
  };

  const handleApproveBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'approved');
    alert('Đã phê duyệt yêu cầu thuê! Trạng thái đã được cập nhật.');
  };

  const handleRejectBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'returned'); // standard reject representation
    alert('Đã từ chối yêu cầu thuê.');
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Quản Lý Cho Thuê (Lessor Dashboard)</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Xem thu nhập, quản lý tin đăng và phê duyệt các yêu cầu thuê tài sản từ khách hàng.</p>
      </div>

      {/* Metrics Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
            Tổng Doanh Thu
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
            {formatPrice(totalEarnings)} đ
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderLeft: '4px solid var(--color-secondary)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
            Tài Sản Đang Đăng
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-secondary-hover)' }}>
            {totalListings}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
            Yêu Cầu Đang Chờ Duyệt
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-warning)' }}>
            {pendingRequests}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '30px',
        gap: '24px'
      }}>
        <button 
          onClick={() => setActiveTab('listings')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'listings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'listings' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Folder size={16} />
          <span>Tin Đăng Của Tôi ({totalListings})</span>
        </button>

        <button 
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'requests' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'requests' ? '2px solid var(--color-primary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Bell size={16} />
          <span>Yêu Cầu Thuê ({myBookings.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('add-new')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            color: activeTab === 'add-new' ? 'var(--color-secondary-hover)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'add-new' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} />
          <span>Đăng Tài Sản Mới</span>
        </button>
      </div>

      {/* Tabs Content */}
      <main>
        
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {myAssets.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {myAssets.map((asset) => (
                  <div key={asset.id} className="glass-panel" style={{ display: 'flex', backgroundColor: '#ffffff', overflow: 'hidden', height: '140px' }}>
                    <img src={asset.imageUrl} alt={asset.title} style={{ width: '120px', height: '100%', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.3' }}>
                          {asset.title}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📍 {asset.location}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-primary)' }}>
                          {formatPrice(asset.pricePerDay)} đ/ngày
                        </span>
                        <span className={`badge badge-${asset.status}`} style={{ fontSize: '11px' }}>
                          {asset.status === 'available' ? 'Có sẵn' : 'Đang thuê'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }}>Bạn chưa đăng tin cho thuê tài sản nào.</p>
                <button className="btn btn-lessor" onClick={() => setActiveTab('add-new')}>Đăng tin đầu tiên</button>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="glass-panel" style={{ backgroundColor: '#ffffff', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
            {myBookings.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-light)' }}>
                    <th style={{ padding: '16px' }}>Tài sản</th>
                    <th style={{ padding: '16px' }}>Người thuê</th>
                    <th style={{ padding: '16px' }}>Thời gian thuê</th>
                    <th style={{ padding: '16px' }}>Tổng tiền</th>
                    <th style={{ padding: '16px' }}>Trạng thái</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={b.assetImage} alt={b.assetTitle} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                        <span style={{ fontWeight: '600', fontSize: '14px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.assetTitle}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{b.renterName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>SĐT: {b.renterContact}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                        <strong>{b.startDate}</strong> đến <strong>{b.endDate}</strong>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--color-primary)' }}>
                        {formatPrice(b.totalPrice)} đ
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge badge-${b.status}`}>
                          {b.status === 'pending' && 'Chờ duyệt'}
                          {b.status === 'approved' && 'Đã duyệt'}
                          {b.status === 'returned' && 'Đã trả/Từ chối'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {b.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveBooking(b.id)}>
                              Duyệt
                            </button>
                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => handleRejectBooking(b.id)}>
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Không có</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Chưa nhận được yêu cầu thuê tài sản nào từ khách hàng.
              </div>
            )}
          </div>
        )}

        {/* Add New Listing Tab */}
        {activeTab === 'add-new' && (
          <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Đăng tài sản cho thuê mới</h3>
            <form onSubmit={handleSubmitAsset}>
              
              <div className="form-group">
                <label>Tên tài sản</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ví dụ: Máy ảnh Sony A7 IV, Lens Canon RF 50mm f/1.2..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="body_lens">Máy ảnh & Ống kính</option>
                    <option value="flycam">Flycam & Thiết bị bay</option>
                    <option value="gimbal_tripod">Gimbal & Chống rung</option>
                    <option value="lighting_studio">Ánh sáng & Studio</option>
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
                    placeholder="Ví dụ: 300000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hình ảnh mô phỏng (Chọn mẫu)</label>
                  <select className="form-control" value={imageSelect} onChange={(e) => setImageSelect(e.target.value)}>
                    <option value="/camera.png">Mẫu Máy ảnh (Camera)</option>
                    <option value="/flycam.png">Mẫu Flycam (Drone)</option>
                    <option value="/gimbal.png">Mẫu Gimbal (Stabilizer)</option>
                    <option value="/light.png">Mẫu Đèn Studio (LED Light)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Thông số kỹ thuật (Cách nhau bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ví dụ: Cảm biến 33MP, Tải trọng 4.5kg, Công suất 200W..."
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  className="form-control" 
                  placeholder="Nhập mô tả chi tiết sản phẩm, lưu ý sử dụng, phụ kiện đi kèm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('listings')}>Hủy</button>
                <button type="submit" className="btn btn-lessor">Đăng Tin Ngay</button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
