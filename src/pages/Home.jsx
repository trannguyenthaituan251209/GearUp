import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from '../context/StoreContext';
import AssetCard, { formatPrice } from '../components/AssetCard';
import { 
  Camera, 
  Aperture, 
  Video, 
  Sliders, 
  Lightbulb, 
  Mic, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Zap, 
  Users, 
  User, 
  Briefcase,
  Search
} from 'lucide-react';

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

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image skeleton-pulse" />
    <div className="skeleton-content">
      <div className="skeleton-meta">
        <div className="skeleton-line skeleton-line-sm skeleton-pulse" />
        <div className="skeleton-line skeleton-line-sm skeleton-pulse" style={{ width: '20%' }} />
      </div>
      <div className="skeleton-title-1 skeleton-pulse" />
      <div className="skeleton-title-2 skeleton-pulse" />
      <div className="skeleton-line skeleton-line-md skeleton-pulse" style={{ marginBottom: '12px' }} />
      <div className="skeleton-footer">
        <div className="skeleton-price skeleton-pulse" />
        <div className="skeleton-button skeleton-pulse" />
      </div>
    </div>
  </div>
);

export default function Home({ setCurrentPage, setSelectedAssetId, filters, setFilters }) {
  const { assets, user, setShowAuthModal, setShowPartnerModal } = useContext(StoreContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');

  // Local pagination/lazy state
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const sentinelRef = useRef(null);

  // Sync search fields with shared filters
  useEffect(() => {
    setSearchQuery(filters.search || '');
    setCategoryQuery(filters.category || '');
  }, [filters.search, filters.category]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(8);
    setIsLazyLoading(false);
  }, [filters.search, filters.category, filters.location, filters.priceRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      search: searchQuery,
      category: categoryQuery
    });
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const selectCategory = (cat) => {
    setFilters({
      ...filters,
      search: '',
      category: cat
    });
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Filter logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !filters.search || 
      asset.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      asset.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || asset.category === filters.category;
    
    const matchesLocation = !filters.location || asset.location === filters.location;
    
    const matchesPrice = !filters.priceRange || asset.pricePerDay <= filters.priceRange;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  const visibleAssets = filteredAssets.slice(0, visibleCount);

  // Scroll handler for Lazy Loading
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLazyLoading && visibleCount < filteredAssets.length) {
        setIsLazyLoading(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 8, filteredAssets.length));
          setIsLazyLoading(false);
        }, 600); // 600ms premium feeling delay
      }
    }, {
      rootMargin: '100px'
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [isLazyLoading, visibleCount, filteredAssets.length]);

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

  return (
    <div className="home-page">
      {/* Top Banner & Category Sidebar (Phong Vu Demo Style) */}
      <section className="container" style={{ paddingTop: '30px', marginBottom: '40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 240px',
          gap: '24px',
          alignItems: 'stretch'
        }} className="home-hero-layout">
          
          {/* Left Column - Category Sidebar List */}
          <aside className="glass-panel" style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '8px 20px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '14px',
              fontWeight: '800',
              color: 'var(--color-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🎥 Thiết bị cho thuê
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
              {[
                { key: 'canon_cam', label: 'Máy ảnh Canon', icon: Camera },
                { key: 'sony_cam', label: 'Máy ảnh Sony', icon: Camera },
                { key: 'fuji_cam', label: 'Máy ảnh Fujifilm', icon: Camera },
                { key: 'nikon_cam', label: 'Máy ảnh Nikon', icon: Camera },
                { key: 'canon_lens', label: 'Ống kính Canon', icon: Aperture },
                { key: 'sony_lens', label: 'Ống kính Sony', icon: Aperture },
                { key: 'fuji_lens', label: 'Ống kính Fujifilm', icon: Aperture },
                { key: 'flycam', label: 'Flycam & Drone', icon: Video },
                { key: 'gimbal', label: 'Gimbal & Chống rung', icon: Sliders },
                { key: 'studio_light', label: 'Ánh sáng & Studio', icon: Lightbulb },
                { key: 'audio', label: 'Thiết bị âm thanh', icon: Mic }
              ].map((item) => (
                <li key={item.key}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); selectCategory(item.key); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 20px',
                      color: 'var(--color-text-main)',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'var(--transition-fast)'
                    }}
                    className="category-side-item"
                  >
                    <item.icon size={15} style={{ opacity: 0.8 }} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Middle Column - Hero Banner */}
          <div className="hero-section" style={{
            backgroundImage: 'url(/hero_section.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            minHeight: '480px',
            padding: '40px'
          }}>
            {/* Solid Dark Overlay for Text Legibility (No Gradient) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 1
            }}></div>

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'left', width: '100%' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px',
                marginBottom: '16px',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={11} />
                Dịch vụ cho thuê camera hàng đầu
              </span>
              
              <h1 style={{
                color: '#ffffff',
                fontSize: '38px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                marginBottom: '14px',
                fontFamily: 'var(--font-primary)',
                lineHeight: '1.25'
              }}>
                Thuê Thiết Bị Quay Chụp.<br />Chuyên Nghiệp & Tiện Lợi.
              </h1>
              
              <p style={{
                fontSize: '15px',
                color: '#c7d2fe',
                marginBottom: '28px',
                fontWeight: '400',
                lineHeight: '1.5',
                maxWidth: '600px'
              }}>
                Tiết kiệm tối đa chi phí sản xuất bằng cách thuê máy ảnh, ống kính, flycam, thiết bị studio... hoặc gia tăng thu nhập từ bộ thiết bị quay chụp nhàn rỗi của bạn.
              </p>

              {/* Hero Search Bar */}
              <form 
                onSubmit={handleSearchSubmit} 
                className="glass-panel" 
                style={{
                  maxWidth: '750px',
                  padding: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <input 
                  type="text" 
                  placeholder="Tìm máy ảnh, ống kính, gimbal..."
                  className="form-control"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: '2 1 200px',
                    border: 'none',
                    height: '44px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-sm)',
                    paddingLeft: '12px'
                  }}
                />
                <select
                  className="form-control"
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  style={{
                    flex: '1 1 140px',
                    border: 'none',
                    height: '44px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="canon_cam">Máy ảnh Canon</option>
                  <option value="sony_cam">Máy ảnh Sony</option>
                  <option value="fuji_cam">Máy ảnh Fujifilm</option>
                  <option value="nikon_cam">Máy ảnh Nikon</option>
                  <option value="canon_lens">Ống kính Canon</option>
                  <option value="sony_lens">Ống kính Sony</option>
                  <option value="fuji_lens">Ống kính Fujifilm</option>
                  <option value="flycam">Flycam & Drone</option>
                  <option value="gimbal">Gimbal & Chống rung</option>
                  <option value="studio_light">Ánh sáng & Studio</option>
                  <option value="audio">Thiết bị âm thanh</option>
                </select>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{
                    flex: '1 1 100px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '700'
                  }}
                >
                  Tìm Kiếm
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - 2 Vertical Banners (running along the borders of the hero-section) */}
          <div className="hero-vertical-banners" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'flex-start'
          }}>
            {/* Vertical Banner 1 */}
            <div className="vertical-banner dark-theme-banner" style={{
              width: '100%',
              aspectRatio: '1024/1536',
              backgroundImage: 'url(/welcome_new_member_vertical.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }} onClick={() => selectCategory('sony_cam')}>
              <div className="banner-hover-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.1)',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <span>Thuê ngay</span>
                  <span className="arrow-transition">→</span>
                </div>
              </div>
            </div>

            {/* Vertical Banner 2 */}
            <div className="vertical-banner light-theme-banner" style={{
              width: '100%',
              aspectRatio: '1024/1536',
              backgroundImage: 'url(/new_member_discount_vertical.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }} onClick={(e) => {
              e.preventDefault();
              if (!user) {
                alert('Vui lòng đăng nhập tài khoản trước khi đăng ký trở thành đối tác!');
                setShowAuthModal(true);
              } else if (!user.isPartner) {
                setShowPartnerModal(true);
              } else {
                const { protocol, host, hostname, port, pathname } = window.location;
                let partnerUrl = '';
                if (hostname.includes('hatvaqua.online')) {
                  partnerUrl = `${protocol}//partner.hatvaqua.online${pathname}`;
                } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
                  partnerUrl = `${protocol}//partner.localhost:${port || '5173'}${pathname}?portal=partner`;
                } else if (hostname.startsWith('partner.')) {
                  partnerUrl = window.location.href;
                } else {
                  partnerUrl = `${protocol}//partner.${host}${pathname}`;
                }
                window.location.href = partnerUrl;
              }
            }}>
              <div className="banner-hover-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 120, 0, 0.05)',
                transition: 'var(--transition-normal)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 120, 0, 0.9)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <span>Đăng ký ngay</span>
                  <span className="arrow-transition">→</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2 Horizontal Banners below the poster and above the 4 commitment cards */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }} className="home-horizontal-banners">
          
          {/* Horizontal Banner 1 */}
          <div className="horizontal-banner" style={{
            backgroundImage: 'url(/become_our_partner_horizontal.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            aspectRatio: '1536/1024'
          }} onClick={() => selectCategory('studio_light')}>
            <div className="banner-hover-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(79, 70, 229, 0.05)',
              transition: 'var(--transition-normal)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: 'var(--color-primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <span>Khám phá combo</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Horizontal Banner 2 */}
          <div className="horizontal-banner" style={{
            backgroundImage: 'url(/summer_discount_horizontal.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            aspectRatio: '1536/1024'
          }} onClick={() => {
            alert('Dịch vụ giao nhận 2H cam kết phục vụ nội thành nhanh chóng và đúng hẹn!');
          }}>
            <div className="banner-hover-overlay" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(217, 119, 6, 0.05)',
              transition: 'var(--transition-normal)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: 'var(--color-secondary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <span>Xem chi tiết</span>
                <span>→</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Badges (Trust badges like Phong Vu hot promos) */}
      <section className="container" style={{ marginBottom: '50px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Coins size={32} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-dark)' }}>Giá Thuê Cực Tốt</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Tiết kiệm đến 80% so với mua thiết bị</p>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ShieldCheck size={32} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-dark)' }}>Bảo Hiểm Thiết Bị</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Yên tâm sử dụng tác nghiệp, quay phim</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Zap size={32} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-dark)' }}>Duyệt Thuê Nhanh</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Thủ tục xác minh online tiện lợi</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Users size={32} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-dark)' }}>Kết Nối Creator</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Cộng đồng sáng tạo ảnh/phim uy tín</p>
            </div>
          </div>
        </div>
      </section>

      {/* CSS selector classes for side menu and grid layout overrides */}
      <style>{`
        .category-side-item:hover {
          background-color: var(--color-primary-light) !important;
          color: var(--color-primary) !important;
          padding-left: 24px !important;
        }
        
        .vertical-banner {
          transition: var(--transition-normal);
        }
        .vertical-banner:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg) !important;
        }
        .vertical-banner:hover .banner-hover-overlay {
          background-color: rgba(15, 23, 42, 0.35) !important;
        }
        .vertical-banner:hover .arrow-transition {
          transform: translateX(4px);
        }
        .arrow-transition {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .horizontal-banner {
          transition: var(--transition-normal);
        }
        .horizontal-banner:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg) !important;
        }
        .horizontal-banner:hover .banner-hover-overlay {
          background-color: rgba(15, 23, 42, 0.2) !important;
        }

        @media (max-width: 1100px) {
          .home-hero-layout {
            grid-template-columns: 240px 1fr !important;
          }
          .hero-vertical-banners {
            display: none !important;
          }
        }
        
        @media (max-width: 900px) {
          .home-hero-layout {
            grid-template-columns: 1fr !important;
          }
          .home-hero-layout aside {
            display: none !important;
          }
          .hero-vertical-banners {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            height: auto !important;
            width: 100% !important;
          }
        }
        
        @media (max-width: 768px) {
          .home-horizontal-banners {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .hero-vertical-banners {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Marketplace Section */}
      <section className="container" id="market-section" style={{ paddingTop: '40px', marginBottom: '60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Chợ Thiết Bị</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Khám phá đầy đủ thiết bị quay chụp chất lượng cao, tối ưu chi phí tối đa cho bạn.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '30px',
          alignItems: 'start'
        }} className="market-layout">
          
          {/* Sidebar Filters */}
          <aside className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', position: 'sticky', top: '100px', zIndex: 10 }}>
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
              <label>Tìm kiếm</label>
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

          {/* Assets Main Panel */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Tìm thấy <strong style={{ color: 'var(--color-dark)' }}>{filteredAssets.length}</strong> gợi ý phù hợp
              </div>
            </div>

            {visibleAssets.length > 0 ? (
              <>
                <div className="asset-grid">
                  {visibleAssets.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onSelect={() => {
                        setSelectedAssetId(asset.id);
                        setCurrentPage('asset-detail');
                      }} 
                    />
                  ))}
                  
                  {isLazyLoading && Array.from({ length: 4 }).map((_, idx) => (
                    <SkeletonCard key={`skeleton-${idx}`} />
                  ))}
                </div>

                {visibleCount < filteredAssets.length && !isLazyLoading && (
                  <div ref={sentinelRef} style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Đang cuộn để tải thêm thiết bị...</span>
                  </div>
                )}
              </>
            ) : (
              !isLazyLoading && (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Search size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy thiết bị nào</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>
                    Vui lòng điều chỉnh hoặc đặt lại bộ lọc để tìm thấy các ưu đãi cho thuê hấp dẫn khác.
                  </p>
                  <button className="btn btn-primary" onClick={resetFilters}>Đặt Lại Bộ Lọc</button>
                </div>
              )
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
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '60px 0', borderRadius: 'var(--radius-xl)', marginBottom: '60px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Cách Thức Hoạt Động</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 45px' }}>
            GearUp cung cấp giải pháp trung gian chuyên nghiệp, an toàn, bảo vệ tối đa quyền lợi cho cả chủ tài sản và người thuê.
          </p>

          <div className="grid-2" style={{ gap: '30px' }}>
            {/* Renter flow */}
            <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
              <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <User size={18} />
                Dành Cho Người Đi Thuê
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Tìm kiếm & Đặt lịch</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tìm thiết bị mong muốn, chọn số ngày cần thuê và gửi yêu cầu.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Chờ duyệt & Nhận tài sản</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Chủ tài sản xác nhận nhanh chóng. Bạn đến nhận hoặc giao nhận tận nơi.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Sử dụng & Hoàn trả</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sử dụng có trách nhiệm và hoàn trả đúng hẹn. Đánh giá chất lượng dịch vụ.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessor flow */}
            <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff' }}>
              <h3 style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Briefcase size={18} />
                Dành Cho Chủ Tài Sản
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-secondary-light)',
                    color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Đăng tải tài sản miễn phí</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Đăng ảnh, ghi chi tiết thông tin, thiết lập giá thuê/ngày linh hoạt.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-secondary-light)',
                    color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Quản lý & Duyệt yêu cầu</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Xem thông tin người thuê, phê duyệt hoặc từ chối yêu cầu thuê ngay tại Dashboard.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-secondary-light)',
                    color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0
                  }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Nhận thanh toán an toàn</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Kiếm thêm thu nhập thụ động an toàn từ tài sản ít sử dụng của mình.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
