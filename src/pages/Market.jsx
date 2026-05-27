import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import AssetCard from '../components/AssetCard';
import { formatPrice } from '../components/AssetCard';
import { Search } from 'lucide-react';

export default function Market({ setCurrentPage, setSelectedAssetId, filters, setFilters }) {
  const { assets } = useContext(StoreContext);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handleLocationChange = (e) => {
    setFilters({ ...filters, location: e.target.value });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, priceRange: parseInt(e.target.value) || 1000000 });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      priceRange: 1000000
    });
  };

  // Apply filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          asset.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = filters.category === '' || asset.category === filters.category;
    
    const matchesLocation = filters.location === '' || asset.location === filters.location;
    
    const matchesPrice = asset.pricePerDay <= filters.priceRange;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Chợ Tài Sản</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Duyệt tìm hàng ngàn thiết bị quay chụp chất lượng cao được cho thuê bởi cộng đồng creator uy tín.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        alignItems: 'start'
      }} className="market-layout">
        
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>Bộ Lọc Tìm Kiếm</h3>
            <button 
              onClick={resetFilters} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
            >
              Đặt lại
            </button>
          </div>

          {/* Search */}
          <div className="form-group">
            <label>Tìm kiếm</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tên thiết bị, mô tả..." 
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Danh mục</label>
            <select className="form-control" value={filters.category} onChange={handleCategoryChange}>
              <option value="">Tất cả danh mục</option>
              <option value="body_lens">Máy ảnh & Ống kính</option>
              <option value="flycam">Flycam & Thiết bị bay</option>
              <option value="gimbal_tripod">Gimbal & Chống rung</option>
              <option value="lighting_studio">Ánh sáng & Studio</option>
            </select>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Khu vực</label>
            <select className="form-control" value={filters.location} onChange={handleLocationChange}>
              <option value="">Tất cả khu vực</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Giá tối đa / ngày</label>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)' }}>
                {formatPrice(filters.priceRange)} đ
              </span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="1000000" 
              step="10000"
              value={filters.priceRange} 
              onChange={handlePriceChange}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)', marginTop: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              <span>50K đ</span>
              <span>1.000K đ</span>
            </div>
          </div>
        </aside>

        {/* Assets Main Panel */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
              Tìm thấy <strong style={{ color: 'var(--color-dark)' }}>{filteredAssets.length}</strong> tài sản phù hợp
            </div>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="asset-grid">
              {filteredAssets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onSelect={() => {
                    setSelectedAssetId(asset.id);
                    setCurrentPage('asset-detail');
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Search size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy thiết bị nào</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
                Vui lòng điều chỉnh hoặc đặt lại bộ lọc để tìm thấy các ưu đãi cho thuê hấp dẫn khác.
              </p>
              <button className="btn btn-primary" onClick={resetFilters}>Đặt Lại Bộ Lọc</button>
            </div>
          )}
        </main>
      </div>
      
      {/* Dynamic responsive CSS overrides for the split layout grid */}
      <style>{`
        @media (max-width: 900px) {
          .market-layout {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
