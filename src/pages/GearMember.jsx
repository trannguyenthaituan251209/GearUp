import React from 'react';
import { ArrowLeft, Check, Crown, Star, Shield } from 'lucide-react';

export default function GearMember({ setCurrentPage }) {
  const tiers = [
    {
      name: 'Khách Thuê Thường (Free)',
      price: 'Miễn phí',
      priceDetail: '',
      icon: <UserIcon />,
      color: 'var(--color-text-muted)',
      bg: '#f8fafc',
      buttonText: 'Gói hiện tại',
      buttonClass: 'btn-outline',
      features: [
        'Giá gốc trên ứng dụng',
        'Giữ tiền cọc/Giấy tờ gốc theo yêu cầu',
        'Hủy booking: Theo chính sách của Cửa hàng'
      ]
    },
    {
      name: 'Hội Viên Bạc (Silver Pass)',
      price: '149.000 VNĐ',
      priceDetail: '/ tháng',
      icon: <Shield style={{ color: '#94a3b8' }} size={28} />,
      color: '#64748b',
      bg: '#f1f5f9',
      buttonText: 'Nâng cấp Silver',
      buttonClass: 'btn-primary',
      features: [
        'Tất cả các quyền lợi của gói Free',
        'Giảm 5% tất cả đơn hàng',
        'Giảm 50% giá trị tiền mặt cần đặt cọc',
        'Miễn phí hủy booking trước 12h (Tối đa 2 lần/tháng)'
      ]
    },
    {
      name: 'Hội Viên Vàng (Gold Pass)',
      price: '499.000 VNĐ',
      priceDetail: '/ tháng',
      icon: <Crown style={{ color: '#eab308' }} size={32} />,
      color: '#ca8a04',
      bg: '#fefce8',
      buttonText: 'Nâng cấp Gold',
      buttonClass: 'btn-primary',
      highlight: true,
      features: [
        'Tất cả các quyền lợi của gói Hội viên Bạc',
        'Giảm 12% tất cả đơn hàng',
        'Miễn đặt cọc tiền mặt (Cần xác minh KYC)',
        'Miễn phí hủy booking trước 18h (Tối đa 5 lần/tháng)'
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      <button 
        onClick={() => setCurrentPage('home')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600', marginBottom: '32px', fontSize: '15px' }}
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </button>

      <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '48px', marginBottom: '16px' }} />
        <h1 style={{ fontSize: '36px', color: 'var(--color-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          GearMember
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Trở thành hội viên của GearUp để tận hưởng các đặc quyền thuê thiết bị quay chụp đỉnh cao với mức giá ưu đãi và thủ tục nhanh gọn nhất.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        {tiers.map((tier, idx) => (
          <div 
            key={idx} 
            className="glass-panel"
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '24px', 
              padding: '32px 24px', 
              border: tier.highlight ? '2px solid #fde047' : '1px solid var(--color-border)',
              position: 'relative',
              boxShadow: tier.highlight ? '0 20px 40px rgba(250, 204, 21, 0.15)' : 'none',
              transform: tier.highlight ? 'scale(1.02)' : 'none',
              zIndex: tier.highlight ? 10 : 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {tier.highlight && (
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#eab308', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 10px rgba(234,179,8,0.3)' }}>
                Phổ biến nhất
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: tier.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tier.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-dark)', margin: 0 }}>
                {tier.name}
              </h3>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: tier.color }}>{tier.price}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>{tier.priceDetail}</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {tier.features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                  <Check size={18} color={tier.highlight ? '#eab308' : '#10b981'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`btn ${tier.buttonClass}`} 
              style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600', borderRadius: '12px', backgroundColor: tier.highlight ? '#eab308' : '', borderColor: tier.highlight ? '#eab308' : '' }}
              onClick={() => alert(`Chức năng thanh toán cho gói ${tier.name} đang được tích hợp.`)}
            >
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--color-dark)' }}>Bảng So Sánh Quyền Lợi Chi Tiết</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '20px 32px', textAlign: 'left', backgroundColor: '#fff', borderBottom: '2px solid var(--color-border)', width: '25%', color: 'var(--color-text-muted)', fontWeight: '600', fontSize: '14px' }}>Tiêu chí</th>
                <th style={{ padding: '20px', textAlign: 'left', backgroundColor: '#fff', borderBottom: '2px solid var(--color-border)', width: '25%', color: 'var(--color-dark)', fontWeight: '700' }}>Khách Thuê Thường</th>
                <th style={{ padding: '20px', textAlign: 'left', backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', width: '25%', color: '#334155', fontWeight: '700' }}>Hội Viên Bạc</th>
                <th style={{ padding: '20px', textAlign: 'left', backgroundColor: '#fefce8', borderBottom: '2px solid #fde047', width: '25%', color: '#854d0e', fontWeight: '700' }}>Hội Viên Vàng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-dark)' }}>Phí thành viên</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>Miễn phí</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc', fontWeight: '600' }}>149.000 VNĐ <span style={{fontWeight: '400', fontSize: '13px', color: 'var(--color-text-muted)'}}>/ tháng</span></td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fefeff', fontWeight: '600' }}>499.000 VNĐ <span style={{fontWeight: '400', fontSize: '13px', color: 'var(--color-text-muted)'}}>/ tháng</span></td>
              </tr>
              <tr>
                <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-dark)' }}>Giảm giá thuê</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>Giá gốc trên ứng dụng</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>Giảm <strong>5%</strong> tất cả đơn hàng</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fefeff' }}>Giảm <strong>12%</strong> tất cả đơn hàng</td>
              </tr>
              <tr>
                <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-dark)' }}>Quyền lợi Đặt cọc</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>Giữ tiền cọc/Giấy tờ gốc theo yêu cầu chủ máy.</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>Giảm <strong>50%</strong> giá trị tiền mặt cần đặt cọc.</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fefeff' }}><strong>Miễn đặt cọc tiền mặt</strong><br/><span style={{fontSize: '13px', color: 'var(--color-text-muted)'}}>(Chỉ cần xác minh tài khoản định danh KYC nâng cao).</span></td>
              </tr>
              <tr>
                <td style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-dark)' }}>Hủy chuyến</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>Theo chính sách chung của chủ máy.</td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>Miễn phí hủy chuyến trước 24h<br/><span style={{fontSize: '13px', color: 'var(--color-text-muted)'}}>(Tối đa 2 lần/tháng).</span></td>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fefeff' }}>Miễn phí hủy chuyến trước 12h<br/><span style={{fontSize: '13px', color: 'var(--color-text-muted)'}}>(Tối đa 5 lần/tháng).</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
