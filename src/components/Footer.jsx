import React from 'react';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <h3>GearUp</h3>
            <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', maxWidth: '380px' }}>
              Nền tảng trung gian uy tín hàng đầu Việt Nam giúp kết nối người có tài sản nhàn rỗi cho thuê và người có nhu cầu thuê thiết bị, phương tiện chất lượng cao một cách nhanh chóng, an toàn và chuyên nghiệp.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Khám Phá</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Trang chủ</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('market'); }}>Chợ tài sản</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('market'); }}>Đồ công nghệ</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('market'); }}>Phương tiện đi lại</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Hỗ Trợ & Liên Hệ</h4>
            <ul>
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
              <li><a href="#">Hotline: 1900 1234</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 GearUp - Nền tảng chia sẻ tài sản thông minh. Bản quyền thuộc về InnovateX GearUp.</p>
        </div>
      </div>
    </footer>
  );
}
