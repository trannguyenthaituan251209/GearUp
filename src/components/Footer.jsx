import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

export default function Footer({ setCurrentPage }) {
  const { user, setShowAuthModal, setShowPartnerModal } = useContext(StoreContext);

  const handlePartnerLink = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập tài khoản trước khi đăng ký trở thành đối tác!');
      setShowAuthModal(true);
    } else if (!user.isPartner) {
      setShowPartnerModal(true);
    } else {
      const { protocol, host, hostname, port, pathname } = window.location;
      let partnerUrl = '';
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        partnerUrl = `${protocol}//partner.localhost:${port || '5173'}${pathname}?portal=partner`;
      } else if (hostname.startsWith('partner.')) {
        partnerUrl = window.location.href;
      } else {
        partnerUrl = `${protocol}//partner.${host}${pathname}`;
      }
      window.location.href = partnerUrl;
    }
  };

  const navigateToMarket = (e) => {
    e.preventDefault();
    setCurrentPage('home');
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </h3>
            <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', maxWidth: '380px' }}>
              Nền tảng trung gian uy tín hàng đầu Việt Nam giúp kết nối khách hàng thuê thiết bị quay chụp chuyên nghiệp và các đối tác nền tảng có tài sản nhàn rỗi một cách nhanh chóng, an toàn và tối ưu chi phí.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Khám Phá</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Trang chủ</a></li>
              <li><a href="#" onClick={navigateToMarket}>Chợ thiết bị</a></li>
              <li><a href="#" onClick={navigateToMarket}>Máy ảnh chuyên nghiệp</a></li>
              <li><a href="#" onClick={navigateToMarket}>Flycam & Gimbal</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Hợp Tác Đối Tác</h4>
            <ul>
              <li><a href="#" onClick={handlePartnerLink}>Trở thành đối tác</a></li>
              <li><a href="#" onClick={handlePartnerLink}>Kênh đối tác GearUp</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Chính sách bảo hiểm thiết bị đối tác lên tới 50 triệu đồng.'); }}>Bảo hiểm thiết bị</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Quy chế hoạt động đảm bảo tính minh bạch giữa Khách hàng và Đối tác.'); }}>Quy chế hoạt động</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Hỗ Trợ & Liên Hệ</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Trung tâm hỗ trợ khách hàng hoạt động 24/7.'); }}>Trung tâm trợ giúp</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Chính sách bảo mật thông tin cá nhân khách hàng.'); }}>Chính sách bảo mật</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Điều khoản sử dụng dịch vụ.'); }}>Điều khoản sử dụng</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Hotline: 1900 1234</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 GearUp - Nền tảng chia sẻ thiết bị quay chụp thông minh. Bản quyền thuộc về InnovateX GearUp.</p>
        </div>
      </div>
    </footer>
  );
}
