import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { User, Briefcase, LogOut, Shield, Search, Home, UserPlus, FileText, Bell, ShoppingCart, Menu, X, Settings, Heart, Crown } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const {
    user,
    assets,
    setShowAuthModal,
    setShowPartnerModal,
    logoutUser
  } = useContext(StoreContext);

  const uniqueTitles = Array.from(new Set((assets || []).map(a => a.title)));
  const searchSuggestions = uniqueTitles.filter(title => {
    if (!searchTerm.trim()) return false;
    const tokens = searchTerm.toLowerCase().split(/\s+/);
    const titleLower = title.toLowerCase();
    return tokens.every(token => titleLower.includes(token));
  }).slice(0, 5);

  const hotProducts = uniqueTitles
    .slice(0, 3)
    .map(title => (assets || []).find(a => a.title === title));

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const tokens = query.trim().split(/\s+/).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const isMatch = tokens.some(t => part.toLowerCase() === t.replace(/\\/g, '').toLowerCase());
      return isMatch ? (
        <strong key={i} style={{ color: 'var(--color-primary)', fontWeight: '800' }}>
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  const handleSearchSubmit = (query) => {
    if (!query.trim()) return;
    setSearchTerm('');
    setShowSuggestions(false);
    // Push the state directly to trigger routing
    window.history.pushState({ page: 'search-result', query: query }, '', `/search?q=${encodeURIComponent(query)}`);
    // Manually dispatch a popstate event to notify App.jsx if needed, 
    // or just call setCurrentPage. We can add setCurrentPage('search-result', query)
    setCurrentPage('search-result', query);
  };

  const getPartnerUrl = () => {
    const { protocol, host, hostname, port, pathname } = window.location;
    if (hostname.includes('hatvaqua.online')) {
      return `${protocol}//partner.hatvaqua.online${pathname}`;
    }
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return `${protocol}//partner.localhost:${port || '5173'}${pathname}?portal=partner`;
    }
    if (hostname.startsWith('partner.')) {
      return window.location.href;
    }
    return `${protocol}//partner.${host}${pathname}`;
  };



  return (
    <header className="app-header" style={{ height: 'auto', padding: 0, borderBottom: 'none' }}>
      <style>{`
        .bottom-nav a {
          color: rgba(255, 255, 255, 0.9) !important;
          text-decoration: none;
          font-weight: 500;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .bottom-nav a:hover, .bottom-nav a.active {
          background-color: rgba(255, 255, 255, 0.15);
          color: #fff !important;
        }

        .animated-nav-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='180' height='46' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba%28255,255,255,0.4%29'%3E%3Ccircle cx='60' cy='8' r='5.5' /%3E%3Ccircle cx='80' cy='8' r='5.5' /%3E%3Ccircle cx='100' cy='8' r='5.5' /%3E%3Ccircle cx='120' cy='8' r='5.5' /%3E%3C/g%3E%3Cg fill='rgba%28255,255,255,0.28%29'%3E%3Ccircle cx='45' cy='18' r='4.25' /%3E%3Ccircle cx='65' cy='18' r='4.25' /%3E%3Ccircle cx='85' cy='18' r='4.25' /%3E%3Ccircle cx='105' cy='18' r='4.25' /%3E%3C/g%3E%3Cg fill='rgba%28255,255,255,0.18%29'%3E%3Ccircle cx='30' cy='28' r='3' /%3E%3Ccircle cx='50' cy='28' r='3' /%3E%3Ccircle cx='70' cy='28' r='3' /%3E%3Ccircle cx='90' cy='28' r='3' /%3E%3C/g%3E%3Cg fill='rgba%28255,255,255,0.08%29'%3E%3Ccircle cx='15' cy='38' r='1.75' /%3E%3Ccircle cx='35' cy='38' r='1.75' /%3E%3Ccircle cx='55' cy='38' r='1.75' /%3E%3Ccircle cx='75' cy='38' r='1.75' /%3E%3C/g%3E%3C/svg%3E");
          background-size: 180px 46px;
          background-position: left 20px center;
          background-repeat: no-repeat;
          opacity: 1;
          pointer-events: none;
          z-index: 0;
        }

        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 24px;
          border-bottom: 1px solid var(--color-border);
        }

        .header-search-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 600px;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .header-top-row {
            flex-wrap: wrap;
            gap: 12px;
            padding: 12px 16px;
          }
          .header-search-container {
            order: 3;
            min-width: 100%;
            margin-top: 8px;
          }
          .bottom-nav {
            justify-content: flex-start !important;
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 8px !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Firefox */
          }
          .bottom-nav::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera*/
          }
          .bottom-nav a {
            white-space: nowrap;
          }
          .user-name-display, .header-search-keywords {
            display: none !important;
          }
          .desktop-nav-bar {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
        .mobile-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      `}</style>

      {/* Bottom Nav -> Moved to Top (Desktop Only) */}
      <div className="desktop-nav-bar" style={{ backgroundColor: 'var(--color-primary)', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <div className="animated-nav-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <nav className="bottom-nav" style={{ display: 'flex', gap: '12px', padding: '8px 20px', margin: 0, justifyContent: 'center', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
            <a
              href="#"
              className={currentPage === 'blog/gioi-thieu' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('blog/gioi-thieu'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={14} /> Giới thiệu
            </a>
            <a
              href="#"
              className={currentPage === 'giai-phap-doi-tac' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('giai-phap-doi-tac'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Briefcase size={14} /> Giải pháp dành cho đối tác
            </a>

            <a
              href="#"
              className={currentPage === 'blog/chinh-sach' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('blog/chinh-sach'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} /> Chính sách và điều khoản người dùng
            </a>
          </nav>
        </div>
      </div>

      {/* Top Row -> Moved to Bottom */}
      <div className="container header-top-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mobile-hamburger" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </div>
          {/* Logo */}
          <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '48px', overflow: 'hidden' }}>
            <img src="https://imgh.in/host/yxaxut" alt="GearUp Logo" style={{ height: '48px', objectFit: 'contain', transform: 'scale(2)' }} />
          </a>
        </div>

        {/* Search Bar */}
        <div className="header-search-container">
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm máy ảnh, ống kính..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit(searchTerm);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: '100%',
                padding: '10px 20px 10px 44px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'rgba(0,0,0,0.02)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {showSuggestions && (searchTerm.trim() || hotProducts.length > 0) && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                backgroundColor: '#fff', border: '1px solid var(--color-border)',
                borderRadius: '12px', marginTop: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 100, overflow: 'hidden'
              }}>
                {/* Hot Products (Trống ô tìm kiếm) */}
                {!searchTerm.trim() && hotProducts.length > 0 && (
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', padding: '0 16px', marginBottom: '8px', textTransform: 'uppercase' }}>
                      🔥 Sản phẩm nổi bật
                    </div>
                    {hotProducts.map((asset, index) => (
                      <div 
                        key={`hot-${index}`}
                        onClick={() => handleSearchSubmit(asset.title)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.querySelector('.hot-title').style.color = 'var(--color-primary)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.querySelector('.hot-title').style.color = 'var(--color-dark)';
                        }}
                      >
                        <Search size={16} color="var(--color-text-muted)" />
                        <img src={asset.imageUrl} alt={asset.title} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                        <span className="hot-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-dark)', transition: 'color 0.2s' }}>{asset.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Suggestions */}
                {searchTerm.trim() && (
                  searchSuggestions.length > 0 ? (
                    searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        onClick={() => handleSearchSubmit(suggestion)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                          cursor: 'pointer', borderBottom: '1px solid var(--color-border)',
                          transition: 'background-color 0.2s', backgroundColor: 'transparent'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Search size={16} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)' }}>
                          {highlightMatch(suggestion, searchTerm)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                      Không tìm thấy từ khóa nào phù hợp.
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          <div className="header-search-keywords" style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '16px' }}>
            <span>Từ khóa:</span>
            {['Canon R50', 'G7x', 'Sony A7IV', 'Flycam'].map((keyword) => (
              <a href="#" key={keyword} style={{ color: 'var(--color-text-main)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-text-main)'} onClick={(e) => e.preventDefault()}>{keyword}</a>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Icons: Notification and Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderRight: '1px solid var(--color-border)', paddingRight: '16px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--color-text-main)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-main)'}>
              <Bell size={22} />
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', borderRadius: '12px', padding: '1px 5px', border: '1.5px solid #ffffff' }}>3</span>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--color-text-main)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-main)'}>
              <ShoppingCart size={22} />
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', borderRadius: '12px', padding: '1px 5px', border: '1.5px solid #ffffff' }}>1</span>
            </div>
          </div>

          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--color-text-muted)', color: 'var(--color-text-muted)' }}>
                <User size={20} strokeWidth={1.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  onClick={() => setShowAuthModal(true)}
                  style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)', lineHeight: '1', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >
                  Đăng nhập
                </span>
                <span
                  onClick={() => setCurrentPage('register')}
                  style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)', lineHeight: '1', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >
                  Đăng ký
                </span>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--color-border)', cursor: 'pointer' }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-dark)' }} className="user-name-display">
                  {user.name.split(' ').pop()}
                </span>
              </div>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-dark)' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>
                  
                  <div style={{ padding: '8px 0' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); setCurrentPage('gear-member'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: '#ca8a04', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s', fontWeight: '600' }} onMouseOver={(e) => e.target.style.backgroundColor = '#fefce8'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <Crown size={16} color="#eab308" fill="#fef08a" /> Đăng ký GearMember
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); setCurrentPage('account-settings'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <Settings size={16} /> Cài đặt tài khoản
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); setCurrentPage('favorites'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <Heart size={16} /> Thiết bị yêu thích
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); setCurrentPage('customer-dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <User size={16} /> Lịch sử đơn thuê
                    </a>
                    {user.isPartner ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); window.location.href = getPartnerUrl(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                        <Briefcase size={16} /> Quản lý cửa hàng
                      </a>
                    ) : (
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); setCurrentPage('partner-register'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-text-main)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                        <UserPlus size={16} /> Đăng ký trở thành đối tác
                      </a>
                    )}
                  </div>
                  
                  <div style={{ padding: '8px 0', borderTop: '1px solid var(--color-border)' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); logoutUser(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--color-danger)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s', fontWeight: '500' }} onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-light)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                      <LogOut size={16} /> Đăng xuất
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex'
        }}>
          {/* Menu Panel */}
          <div style={{
            width: '80%',
            maxWidth: '300px',
            backgroundColor: '#ffffff',
            height: '100%',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <img src="https://imgh.in/host/yxaxut" alt="GearUp Logo" style={{ height: '32px', objectFit: 'contain', transform: 'scale(2)', marginLeft: '16px' }} />
              <X size={24} cursor="pointer" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-text-main)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('blog/gioi-thieu'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                <Home size={18} style={{ color: 'var(--color-primary)' }} /> Giới thiệu
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('blog/giai-phap-doi-tac'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                <Briefcase size={18} style={{ color: 'var(--color-primary)' }} /> Giải pháp đối tác
              </a>
              {user && (
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('customer-dashboard'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                  <User size={18} style={{ color: 'var(--color-primary)' }} /> Lịch Sử Thuê
                </a>
              )}
              {user && user.isPartner ? (
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = getPartnerUrl(); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                  <Briefcase size={18} style={{ color: 'var(--color-primary)' }} /> Đến trang cửa hàng
                </a>
              ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); if (!user) { alert('Vui lòng đăng nhập!'); setShowAuthModal(true); } else { setCurrentPage('partner-register'); } }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                  <UserPlus size={18} style={{ color: 'var(--color-primary)' }} /> Đăng ký đối tác
                </a>
              )}
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('blog/chinh-sach'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', textDecoration: 'none', color: 'var(--color-text-main)', fontWeight: '600' }}>
                <FileText size={18} style={{ color: 'var(--color-primary)' }} /> Chính sách & điều khoản
              </a>
            </div>
          </div>
          
          {/* Click outside to close */}
          <div style={{ flex: 1 }} onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
}
