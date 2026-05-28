import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { User, Briefcase, Plus } from 'lucide-react';

export default function Header({ currentPage, setCurrentPage }) {
  const { currentUserRole, toggleUserRole } = useContext(StoreContext);

  return (
    <header className="app-header">
      <div className="container header-container">
        <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '36px', objectFit: 'contain' }} />
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
            className={`nav-link ${currentPage === 'market' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('market'); }}
          >
            Chợ Tài Sản
          </a>
          {currentUserRole === 'renter' ? (
            <a
              href="#"
              className={`nav-link ${currentPage === 'renter-dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('renter-dashboard'); }}
            >
              Lịch Sử Thuê
            </a>
          ) : (
            <a
              href="#"
              className={`nav-link ${currentPage === 'lessor-dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentPage('lessor-dashboard'); }}
            >
              Quản Lý Cho Thuê
            </a>
          )}
        </nav>

        <div className="header-actions">
          <div 
            className={`role-badge ${currentUserRole}`}
            onClick={toggleUserRole}
            title="Click để chuyển vai trò trải nghiệm thử"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {currentUserRole === 'renter' ? (
              <>
                <User size={14} />
                <span>Người Đi Thuê</span>
              </>
            ) : (
              <>
                <Briefcase size={14} />
                <span>Chủ Tài Sản</span>
              </>
            )}
          </div>
          
          {currentUserRole === 'lessor' && (
            <button 
              className="btn btn-lessor btn-sm"
              onClick={() => setCurrentPage('lessor-dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} />
              <span>Đăng Tin Mới</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
