import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { User, Briefcase, LogOut, Shield } from 'lucide-react';

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
    <header className="app-header">
      <div className="container header-container">
        <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '180px', objectFit: 'contain' }} />
        </a>

        <nav className="app-nav">
          <a
            href="#"
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}
          >
            Trang Chủ
          </a>
          <a
            href="#"
            className="nav-link"
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
          >
            Chợ Tài Sản
          </a>
          
          {user && (
            <a
              href="#"
              className={`nav-link ${currentPage === 'customer-dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('customer-dashboard'); }}
            >
              Lịch Sử Thuê
            </a>
          )}

          {(!user || !user.isPartner) && (
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                if (!user) {
                  alert('Vui lòng đăng nhập tài khoản khách hàng trước khi đăng ký trở thành đối tác!');
                  setShowAuthModal(true);
                } else {
                  setCurrentPage('partner-register');
                }
              }}
            >
              Trở Thành Đối Tác
            </a>
          )}
        </nav>

        <div className="header-actions">
          {/* If NOT logged in */}
          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowAuthModal(true)}
                style={{ fontWeight: '700', color: 'var(--color-text-main)' }}
              >
                Đăng Nhập
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setCurrentPage('register')}
                style={{ fontWeight: '700' }}
              >
                Đăng Ký
              </button>
            </div>
          ) : (
            /* If logged in */
            <>
              {/* Partner View Toggler / Register Partner Button */}


              {/* User profile avatar, name and logout */}
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
