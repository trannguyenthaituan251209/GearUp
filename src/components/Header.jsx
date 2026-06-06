import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { User, Briefcase, LogOut, Shield, Search, Home, UserPlus, FileText } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const {
    user,
    setShowAuthModal,
    setShowPartnerModal,
    logoutUser
  } = useContext(StoreContext);

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
      `}</style>

      {/* Bottom Nav -> Moved to Top */}
      <div style={{ backgroundColor: 'var(--color-primary)', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <div className="animated-nav-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <nav className="bottom-nav" style={{ display: 'flex', gap: '12px', padding: '4px 20px', margin: 0, justifyContent: 'center', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
            <a
              href="#"
              className={currentPage === 'home' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={14} /> Cơ sở chính
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
                setTimeout(() => {
                  const element = document.getElementById('market-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Briefcase size={14} /> Giải pháp dành cho đối tác
            </a>

            {user && (
              <a
                href="#"
                className={currentPage === 'customer-dashboard' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setCurrentPage('customer-dashboard'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={14} /> Lịch Sử Thuê
              </a>
            )}

            {(!user || !user.isPartner) && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    alert('Vui lòng đăng nhập tài khoản khách hàng trước khi đăng ký trở thành đối tác!');
                    setShowAuthModal(true);
                  } else {
                    setCurrentPage('partner-register');
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={14} /> Đăng ký trở thành đối tác
              </a>
            )}

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} /> Chính sách và điều khoản người dùng
            </a>
          </nav>
        </div>
      </div>

      {/* Top Row -> Moved to Bottom */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: '24px', borderBottom: '1px solid var(--color-border)' }}>
        {/* Logo */}
        <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '150px', height: '54px', overflow: 'hidden' }}>
          <img src="https://imgh.in/host/yxaxut" alt="GearUp Logo" style={{ height: '54px', objectFit: 'contain', transform: 'scale(3)' }} />
        </a>

        {/* Search Bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '600px', marginTop: '16px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm máy ảnh, ống kính..."
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
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '16px' }}>
            <span>Từ khóa:</span>
            {['Canon R50', 'G7x', 'Sony A7IV', 'Flycam'].map((keyword) => (
              <a href="#" key={keyword} style={{ color: 'var(--color-text-main)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--color-text-main)'} onClick={(e) => e.preventDefault()}>{keyword}</a>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions">
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--color-border)' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-dark)' }} className="user-name-display">
                {user.name.split(' ').pop()}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={logoutUser}
                style={{ padding: '6px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Đăng xuất"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
