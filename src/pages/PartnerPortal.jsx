import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import PartnerDashboard from './PartnerDashboard';
import { Lock, Mail, AlertCircle, LogOut, ArrowLeft, Globe, ShieldCheck } from 'lucide-react';

export default function PartnerPortal() {
  const { 
    user, 
    loginUser, 
    logoutUser 
  } = useContext(StoreContext);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to redirect to main customer site
  const handleBackToCustomer = (e) => {
    e.preventDefault();
    const { protocol, host, pathname } = window.location;
    let newUrl = window.location.href;

    if (window.location.search.includes('portal=partner')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      newUrl = url.toString();
    } else if (host.startsWith('partner.')) {
      const newHost = host.replace('partner.', '');
      newUrl = `${protocol}//${newHost}${pathname}`;
    } else {
      newUrl = `${protocol}//${host}${pathname}`;
    }

    window.location.href = newUrl;
  };

  const handlePartnerLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const { data, error } = await loginUser(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Thông tin tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  // ----------------------------------------------------
  // VIEW RENDER LOGIC
  // ----------------------------------------------------

  // Header specific for Partner Channel
  const renderPartnerHeader = () => {
    return (
      <header style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '14px 0',
        color: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Logo & Portal Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            <span style={{
              backgroundColor: '#ff7800',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Kênh Đối Tác
            </span>
          </div>

          {/* Navigation Links / Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a 
              href="#" 
              onClick={handleBackToCustomer} 
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              <ArrowLeft size={16} />
              Quay lại Trang khách hàng (gearup.vn)
            </a>

            {user && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                borderLeft: '1px solid #334155',
                paddingLeft: '20px'
              }}>
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  alt={user.name} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ff7800' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>
                  {user.studioName || user.name}
                </span>
                
                <button 
                  onClick={logoutUser}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                  title="Đăng xuất khỏi Kênh đối tác"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };

  // Case 1: Guest - Render Partner Portal Sign In Page
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0b0f19', 
        fontFamily: 'var(--font-secondary)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderPartnerHeader()}

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 120, 0, 0.25)',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header branding */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 120, 0, 0.1)',
                border: '1px solid rgba(255, 120, 0, 0.3)',
                color: '#ff7800',
                marginBottom: '16px'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
                ĐĂNG NHẬP ĐỐI TÁC
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                Cổng quản lý dành riêng cho các đại lý, studio và nhà cung cấp thiết bị trên hệ thống GearUp.
              </p>
            </div>

            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                fontSize: '13px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePartnerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '8px' }}>
                  <Mail size={14} style={{ color: '#94a3b8' }} />
                  <span>Email đăng nhập đối tác</span>
                </label>
                <input 
                  type="email" 
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '8px' }}>
                  <Lock size={14} style={{ color: '#94a3b8' }} />
                  <span>Mật khẩu bảo mật</span>
                </label>
                <input 
                  type="password" 
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff7800',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  boxShadow: '0 4px 14px rgba(255, 120, 0, 0.4)',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
                disabled={loading}
              >
                {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '20px' }}>
              Chưa đăng ký đối tác?{' '}
              <a 
                href="#" 
                onClick={handleBackToCustomer}
                style={{ color: '#ff7800', fontWeight: '700', textDecoration: 'none' }}
              >
                Trở lại và đăng ký ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2a: Logged In and Partner Status is 'pending' - Show Pending Screen
  if (user.partnerStatus === 'pending') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0b0f19', 
        fontFamily: 'var(--font-secondary)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderPartnerHeader()}

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 120, 0, 0.3)',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 120, 0, 0.1)',
              color: '#ff7800',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.5px' }}>
              ĐƠN ĐĂNG KÝ ĐANG CHỜ DUYỆT
            </h2>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
              Chào <strong>{user.name}</strong>, hồ sơ đăng ký mở cửa hàng/studio cho thuê thiết bị của bạn đã được tiếp nhận và đang nằm trong danh sách xét duyệt của hệ thống.
            </p>

            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #1e293b',
              textAlign: 'left',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              <span style={{ color: '#ffffff', display: 'block', fontWeight: '700', marginBottom: '6px' }}>Trạng thái hồ sơ:</span>
              • Tên kênh đối tác: {user.studioName}<br />
              • Số CMND/CCCD: {user.citizenId}<br />
              • Hotline liên hệ: {user.phone}<br />
              • Trạng thái hiện tại: <strong>Đang chờ phê duyệt (Pending)</strong><br />
              • Thời gian dự kiến: Tối đa 24 giờ kể từ thời điểm gửi hồ sơ.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleBackToCustomer}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff7800',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 120, 0, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              >
                QUAY LẠI TRANG CHỦ KHÁCH HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2b: Logged In and Partner Status is 'rejected' - Show Rejected Screen
  if (user.partnerStatus === 'rejected') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0b0f19', 
        fontFamily: 'var(--font-secondary)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderPartnerHeader()}

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              marginBottom: '20px'
            }}>
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.5px' }}>
              HỒ SƠ ĐĂNG KÝ BỊ TỪ CHỐI
            </h2>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
              Chào <strong>{user.name}</strong>, hồ sơ đăng ký mở cửa hàng đối tác của bạn không đủ điều kiện phê duyệt hoặc tài liệu cung cấp chưa hợp lệ.
            </p>

            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #1e293b',
              textAlign: 'left',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              <span style={{ color: '#ffffff', display: 'block', fontWeight: '700', marginBottom: '6px' }}>Lý do từ chối chung:</span>
              • Ảnh CCCD bị mờ, không rõ thông tin định danh.<br />
              • Mã số thuế không trùng khớp hoặc giấy tờ kinh doanh không hợp lệ.<br />
              • Vui lòng liên hệ bộ phận hỗ trợ khách hàng hoặc đăng ký lại với tài liệu chính xác hơn.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleBackToCustomer}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff7800',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 120, 0, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              >
                QUAY LẠI TRANG CHỦ KHÁCH HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2c: Logged In but Not Partner - Render Warning/Authorization Error Page
  if (!user.isPartner) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0b0f19', 
        fontFamily: 'var(--font-secondary)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderPartnerHeader()}

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b0f19 100%)'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              marginBottom: '20px'
            }}>
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>
              TÀI KHOẢN CHƯA KÍCH HOẠT ĐỐI TÁC
            </h2>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '24px' }}>
              Chào <strong style={{ color: '#ff7800' }}>{user.name}</strong>, tài khoản của bạn hiện đang là tài khoản khách hàng bình thường và chưa kích hoạt vai trò đối tác cho thuê thiết bị.
            </p>

            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #1e293b',
              textAlign: 'left',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '6px' }}>Hướng dẫn đăng ký:</strong>
              1. Quay lại trang chủ khách hàng (gearup.vn).<br />
              2. Chọn nút <strong>"Trở Thành Đối Tác"</strong> trên thanh điều hướng.<br />
              3. Điền thông tin kích hoạt (Số điện thoại, CMND/CCCD, Tên Studio).<br />
              4. Sau khi hoàn tất đăng ký, quay trở lại trang này để quản lý.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleBackToCustomer}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff7800',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 120, 0, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              >
                QUAY LẠI TRANG CHỦ KHÁCH HÀNG
              </button>

              <button 
                onClick={logoutUser}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1.5px solid #334155',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.color = '#ffffff'; e.target.style.borderColor = '#475569'; }}
                onMouseLeave={(e) => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = '#334155'; }}
              >
                ĐĂNG XUẤT TÀI KHOẢN HIỆN TẠI
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Logged In and Partner - Render Full Partner Layout & Partner Dashboard
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'var(--font-secondary)',
      color: 'var(--color-dark)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {renderPartnerHeader()}
      
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        <PartnerDashboard />
      </main>

      <footer style={{
        backgroundColor: '#0f172a',
        color: '#64748b',
        padding: '24px 0',
        fontSize: '13px',
        borderTop: '1px solid #1e293b',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>© 2026 GearUp Partner Portal - Phân hệ dành riêng cho đối tác. Bản quyền thuộc về InnovateX.</p>
        </div>
      </footer>
    </div>
  );
}
