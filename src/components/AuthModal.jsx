import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AuthModal({ setCurrentPage }) {
  const { showAuthModal, setShowAuthModal, loginUser } = useContext(StoreContext);
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
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

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '0', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--color-dark)' }}>Đăng Nhập Tài Khoản</h2>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Mật khẩu</span>
              </label>
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

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
