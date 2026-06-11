import React, { useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import AssetCard, { formatPrice } from '../components/AssetCard';
import { ChevronRight, SearchX } from 'lucide-react';

const CATEGORIES = [
  { value: 'canon_cam', label: 'Máy ảnh Canon' },
  { value: 'sony_cam', label: 'Máy ảnh Sony' },
  { value: 'fuji_cam', label: 'Máy ảnh Fujifilm' },
  { value: 'nikon_cam', label: 'Máy ảnh Nikon' },
  { value: 'olympus_cam', label: 'Máy ảnh Olympus' },
  { value: 'canon_lens', label: 'Ống kính Canon' },
  { value: 'sony_lens', label: 'Ống kính Sony' },
  { value: 'fuji_lens', label: 'Ống kính Fujifilm' },
  { value: 'sigma_lens', label: 'Ống kính Sigma' },
  { value: 'tamron_lens', label: 'Ống kính Tamron' },
  { value: 'flycam', label: 'Flycam & Drone' },
  { value: 'gimbal', label: 'Gimbal & Chống rung' },
  { value: 'studio_light', label: 'Ánh sáng & Studio' },
  { value: 'audio', label: 'Thiết bị âm thanh' }
];

export default function SearchResult({ searchQuery, setCurrentPage, filters, setFilters }) {
  const { assets } = useContext(StoreContext);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      priceRange: 1000000
    });
  };

  // Smart Search logic + Global Filters
  const filteredAssets = (assets || []).filter(asset => {
    // 1. Keyword search (from the URL / search query)
    let matchesQuery = true;
    if (searchQuery && searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().split(/\s+/);
      const title = asset.title.toLowerCase();
      const category = asset.category.toLowerCase();
      matchesQuery = tokens.every(token => title.includes(token) || category.includes(token));
    }

    // 2. Global Filters
    const matchesSearchFilter = !filters.search || 
      asset.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      asset.description.toLowerCase().includes(filters.search.toLowerCase());
      
    const matchesCategoryFilter = !filters.category || asset.category === filters.category;
    const matchesLocationFilter = !filters.location || asset.location === filters.location;
    const matchesPriceFilter = !filters.priceRange || asset.pricePerDay <= filters.priceRange;

    return matchesQuery && matchesSearchFilter && matchesCategoryFilter && matchesLocationFilter && matchesPriceFilter;
  });

  return (
    <div style={{ padding: '32px 0', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container">
        
        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setCurrentPage('home')} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-text-muted)'}>Trang chủ</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-dark)', fontWeight: '500' }}>Kết quả tìm kiếm</span>
          </div>
          
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-dark)', margin: 0 }}>
            Kết quả tìm kiếm cho: <span style={{ color: 'var(--color-primary)' }}>"{searchQuery}"</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: '500' }}>
            Tìm thấy <strong>{filteredAssets.length}</strong> thiết bị phù hợp.
          </p>
        </div>

        <div className="market-layout">
          
          {/* Sidebar Filters */}
          <aside className="glass-panel market-sidebar" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'none', position: 'sticky', top: '100px', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Bộ Lọc Tìm Kiếm</h3>
              <button 
                onClick={resetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}
              >
                Đặt lại
              </button>
            </div>

            {/* Search */}
            <div className="form-group">
              <label>Tìm kiếm thêm</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tên thiết bị, mô tả..." 
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Danh mục</label>
              <select 
                className="form-control" 
                value={filters.category || ''} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Khu vực</label>
              <select 
                className="form-control" 
                value={filters.location || ''} 
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
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
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  {formatPrice(filters.priceRange || 1000000)} đ
                </span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="1000000" 
                step="10000"
                value={filters.priceRange || 1000000} 
                onChange={(e) => handleFilterChange('priceRange', parseInt(e.target.value) || 1000000)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)', marginTop: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>50K đ</span>
                <span>1.000K đ</span>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main>
            {filteredAssets.length > 0 ? (
              <div className="asset-grid">
                {filteredAssets.map(asset => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    onSelect={() => {
                      setCurrentPage('asset-detail', asset.id);
                    }} 
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                padding: '60px 20px', backgroundColor: '#fff', borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--color-border)', textAlign: 'center' 
              }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <SearchX size={40} color="var(--color-text-muted)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-dark)', marginBottom: '8px' }}>Không tìm thấy thiết bị nào</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '400px', lineHeight: '1.5', marginBottom: '24px' }}>
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với từ khóa <strong>"{searchQuery}"</strong> và bộ lọc của bạn.
                </p>
                <button 
                  onClick={resetFilters}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600' }}
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}
          </main>
        </div>

      </div>
    </div>
  );
}
