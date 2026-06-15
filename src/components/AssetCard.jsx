import React, { useContext } from 'react';
import { Heart } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';

// Format price in VND (e.g. 450000 -> 450.000)
export function formatPrice(price) {
  if (price === undefined || price === null) return '0';
  const roundedPrice = Math.round(Number(price) / 1000) * 1000;
  return roundedPrice.toLocaleString('vi-VN');
}

export default function AssetCard({ asset, onSelect }) {
  const { title, category, pricePerDay, imageUrl, location, rating, status } = asset;
  const { user, favorites = [], toggleFavorite } = useContext(StoreContext);
  
  const isFavorited = favorites.includes(asset.id);

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
    <div className="asset-card" onClick={onSelect} style={{ position: 'relative' }}>
      <div className="card-img-container">
        <img src={imageUrl} alt={title} className="card-img" />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(asset.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s',
            zIndex: 10,
            color: isFavorited ? '#ef4444' : '#64748b'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
        </button>
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
        </div>
      </div>
    </div>
  );
}
