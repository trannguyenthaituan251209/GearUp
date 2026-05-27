import React from 'react';

// Format price in VND (e.g. 450000 -> 450.000)
export function formatPrice(price) {
  return price.toLocaleString('vi-VN');
}

export default function AssetCard({ asset, onSelect }) {
  const { title, category, pricePerDay, imageUrl, location, rating, status } = asset;

  const getCategoryName = (cat) => {
    switch (cat) {
      case 'canon_cam': return 'Máy ảnh Canon';
      case 'sony_cam': return 'Máy ảnh Sony';
      case 'fuji_cam': return 'Máy ảnh Fujifilm';
      case 'nikon_cam': return 'Máy ảnh Nikon';
      case 'canon_lens': return 'Ống kính Canon';
      case 'sony_lens': return 'Ống kính Sony';
      case 'fuji_lens': return 'Ống kính Fujifilm';
      case 'flycam': return 'Flycam & Drone';
      case 'gimbal': return 'Gimbal & Chống rung';
      case 'studio_light': return 'Ánh sáng & Studio';
      case 'audio': return 'Thiết bị âm thanh';
      default: return 'Thiết bị khác';
    }
  };

  return (
    <div className="asset-card" onClick={onSelect}>
      <div className="card-img-container">
        <img src={imageUrl} alt={title} className="card-img" />
        <span className={`badge card-badge badge-${status}`}>
          {status === 'available' ? '● Sẵn sàng' : '● Đã thuê'}
        </span>
      </div>
      
      <div className="card-content">
        <div className="card-meta">
          <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>
            {getCategoryName(category)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308', fontWeight: '600' }}>
            ★ {rating.toFixed(1)}
          </span>
        </div>
        
        <h3 className="card-title">{title}</h3>
        
        <div className="card-location">
          <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {location}
        </div>
        
        <div className="card-footer">
          <div className="card-price">
            {formatPrice(pricePerDay)} <span>đ/ngày</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
