import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ArrowLeft, User, Lock, Save, Camera, CheckCircle } from 'lucide-react';

export default function AccountSettings({ setCurrentPage }) {
  const { user, updateUserProfile } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [studioName, setStudioName] = useState('');
  const [address, setAddress] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      setCurrentPage('home');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    setAvatar(user.avatar || '');
    setCitizenId(user.citizenId || '');
    setStudioName(user.studioName || '');
    setAddress(user.address || '');
  }, [user, setCurrentPage]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsSavingProfile(true);

    const { error } = await updateUserProfile({
      name,
      phone,
      avatar,
      citizenId,
      studioName,
      address
    });

    setIsSavingProfile(false);
    if (error) {
      setProfileError('Có lỗi xảy ra: ' + error.message);
    } else {
      setProfileSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setProfileSuccess(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSavingPassword(true);
    // Giả lập đổi mật khẩu (Mock API call)
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => setCurrentPage('home')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '15px' }}
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </button>

      <h1 style={{ fontSize: '28px', color: 'var(--color-dark)', marginBottom: '24px' }}>Cài Đặt Tài Khoản</h1>

      <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <button 
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <User size={18} /> Thông tin cá nhân
          </button>
          <button 
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('password')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <Lock size={18} /> Đổi mật khẩu
          </button>
        </div>

        {/* Tab Content */}
        <div className="glass-panel" style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                <img 
                  src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  alt="Avatar" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>URL Ảnh Đại Diện</label>
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://link-to-your-avatar.jpg"
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Họ và Tên</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Số Điện Thoại</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>CCCD / CMND</label>
                  <input 
                    type="text" 
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Địa chỉ (Số nhà, Phường, Thành phố)</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
                {user.isPartner && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Tên Studio / Cửa hàng</label>
                    <input 
                      type="text" 
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              {profileError && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{profileError}</div>}
              {profileSuccess && <div style={{ color: 'var(--color-success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> {profileSuccess}</div>}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSavingProfile}
                style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={18} /> {isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>

              {passwordError && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ color: 'var(--color-success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> {passwordSuccess}</div>}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSavingPassword}
                style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={18} /> {isSavingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
