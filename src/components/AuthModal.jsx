import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AuthModal({ setCurrentPage }) {
  const { showAuthModal, setShowAuthModal, loginUser } = useContext(StoreContext);
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { generateAndStoreOtp, verifyMockOtp } = useContext(StoreContext);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setIsForgotPassword(false);
    setForgotPasswordStep(1);
    setOtp('');
    setNewPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const { error } = await loginUser(email, password);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Có lỗi xảy ra khi đăng nhập.');
    } else {
      handleClose();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotPasswordStep === 1) {
      if (!email.trim()) {
        setErrorMsg('Vui lòng nhập email của bạn!');
        return;
      }
      setLoading(true);

      // --- MOCK FLOW VỚI EMAILJS + SUPABASE DB ---
      const { otp: dbOtp, error: dbError } = await generateAndStoreOtp(email);
      
      if (dbError || !dbOtp) {
        setErrorMsg('Lỗi tạo mã OTP, vui lòng thử lại.');
        setLoading(false);
        return;
      }
      
      const payload = {
        service_id: 'service_xua4aoe',
        template_id: 'template_hty6z8c',
        user_id: 'zb80OAZc2vqolV0Dv',
        template_params: {
          to_email: email,
          passcode: dbOtp,
          time: '5 phút'
        }
      };

      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setSuccessMsg('Mã OTP 6 số đã được gửi đến email của bạn.');
          setForgotPasswordStep(2);
        } else {
          const errorText = await response.text();
          console.error("EmailJS Error:", errorText);
          setErrorMsg(`Lỗi từ EmailJS: ${errorText || response.statusText}`);
        }
      } catch (err) {
        setErrorMsg('Lỗi kết nối khi gửi EmailJS.');
      }
      setLoading(false);

    } else if (forgotPasswordStep === 2) {
      if (!otp.trim() || !newPassword.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ mã OTP và mật khẩu mới!');
        return;
      }

      setLoading(true);
      const { isValid, error } = await verifyMockOtp(email, otp);
      setLoading(false);

      if (!isValid) {
        setErrorMsg(error?.message || 'Mã OTP không chính xác.');
        return;
      }

      // Mô phỏng thành công (không thực sự đổi trên DB do giới hạn bảo mật)
      alert('Khôi phục mật khẩu thành công!');
      handleClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '0', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--color-dark)' }}>
            {isForgotPassword ? 'Khôi Phục Mật Khẩu' : 'Đăng Nhập Tài Khoản'}
          </h2>
          <button 
            onClick={handleClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fef2f2',
              color: 'var(--color-danger)', fontSize: '13px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
              border: '1px solid #fee2e2'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4',
              color: 'var(--color-success)', fontSize: '13px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
              border: '1px solid #dcfce7'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {forgotPasswordStep === 1 && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Email đăng nhập</span>
                  </label>
                  <input 
                    type="email" 
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    Chúng tôi sẽ gửi một mã OTP gồm 6 số đến email này để xác thực.
                  </p>
                </div>
              )}

              {forgotPasswordStep === 2 && (
                <>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>Mã OTP (6 số)</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>Mật khẩu mới</span>
                    </label>
                    <input 
                      type="password" 
                      className="form-control"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontWeight: '700', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (forgotPasswordStep === 1 ? 'Gửi Mã OTP' : 'Xác Nhận & Đăng Nhập')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span>Email đăng nhập</span>
                </label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Mật khẩu</span>
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontWeight: '700', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            {isForgotPassword ? (
              <>
                <span style={{ color: 'var(--color-text-muted)' }}>Đã nhớ lại mật khẩu? </span>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setIsForgotPassword(false);
                    setForgotPasswordStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ color: 'var(--color-primary)', fontWeight: '700' }}
                >
                  Quay lại Đăng nhập
                </a>
              </>
            ) : (
              <>
                <span style={{ color: 'var(--color-text-muted)' }}>Chưa có tài khoản? </span>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handleClose(); 
                    setCurrentPage('register'); 
                  }}
                  style={{ color: 'var(--color-primary)', fontWeight: '700' }}
                >
                  Đăng ký khách hàng ngay
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
