import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ArrowLeft, Heart, MessageCircle, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../components/AssetCard';

export default function Favorites({ setCurrentPage }) {
  const { user, assets } = useContext(StoreContext);

  if (!user) {
    setCurrentPage('home');
    return null;
  }

  const favoriteAssets = assets.filter(a => user.favorites?.includes(a.id));

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      <button 
        onClick={() => setCurrentPage('home')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '15px' }}
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--color-dark)', margin: 0 }}>Thiết Bị Yêu Thích</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Bạn đã lưu {favoriteAssets.length} thiết bị
          </p>
        </div>
      </div>

      {favoriteAssets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
          <Heart size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--color-dark)', marginBottom: '8px' }}>Chưa có thiết bị nào</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Hãy lướt xem các thiết bị và bấm vào biểu tượng trái tim để lưu lại những món đồ bạn quan tâm nhé!
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentPage('home')} style={{ padding: '10px 24px' }}>
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {favoriteAssets.map(asset => (
            <div 
              key={asset.id} 
              className="favorite-list-card" 
              onClick={() => setCurrentPage('asset-detail', asset.id)}
            >
              {/* Image */}
              <div className="favorite-list-card-img">
                <img src={asset.imageUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }} />
              </div>

              {/* Info Area */}
              <div className="favorite-list-card-info">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '20px', color: 'var(--color-dark)', margin: '0 0 8px 0', fontWeight: '600' }}>{asset.title}</h3>
                    <div style={{ color: '#eab308', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px' }}>
                      ★ {asset.rating.toFixed(1)}
                    </div>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {asset.location}
                  </p>
                </div>
                
                <div className="favorite-list-card-actions">
                  <div style={{ fontSize: '22px', fontWeight: '600', color: 'var(--color-primary-active)' }}>
                    {formatPrice(asset.pricePerDay)} <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '400' }}>đ/ngày</span>
                  </div>

                  {/* Call to action buttons */}
                  <div className="favorite-list-card-buttons" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                      onClick={(e) => {
                         e.stopPropagation();
                         alert('Chức năng Chat với chủ sở hữu đang phát triển!');
                      }}
                    >
                      <MessageCircle size={16} /> Liên hệ cửa hàng
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                      onClick={(e) => {
                         e.stopPropagation();
                         setCurrentPage('asset-detail', asset.id);
                      }}
                    >
                      <ShoppingCart size={16} /> Thuê ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
