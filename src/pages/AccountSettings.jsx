import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from '../context/StoreContext';
import { supabase } from '../supabaseClient';
import { ArrowLeft, User, Lock, Save, CheckCircle, Camera, Edit3, Eye, ShieldAlert } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function AccountSettings({ setCurrentPage }) {
  const { user, updateUserProfile, generateAndStoreOtp, verifyMockOtp } = useContext(StoreContext);
  
  // Tabs: 'view-profile', 'edit-profile', 'password'
  const [activeTab, setActiveTab] = useState('view-profile');
  
  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [studioName, setStudioName] = useState('');
  
  const savedAddress = user?.address || '';
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState(savedAddress);
  
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
  
  // OTP State
  const [passwordStep, setPasswordStep] = useState(1); // 1: Input passwords & send OTP, 2: Verify OTP
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Address Suggestions
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  // Crop State
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=2')
      .then(res => res.json())
      .then(data => {
        const suggestions = [];
        data.forEach(p => {
          if (p.districts) {
            p.districts.forEach(d => {
              suggestions.push(`${d.name}, ${p.name}`);
            });
          }
        });
        setAddressSuggestions(suggestions);
      })
      .catch(err => console.error('Failed to fetch provinces', err));
  }, []);

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
  }, [user, setCurrentPage]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsSavingProfile(true);

    const updatedData = {
      name,
      phone,
      avatar,
      citizenId,
      studioName,
      address: addressStreet ? `${addressStreet.trim()}, ${addressCity.trim()}` : addressCity.trim()
    };

    const { error } = await updateUserProfile(updatedData);

    setIsSavingProfile(false);
    if (error) {
      setProfileError('Có lỗi xảy ra: ' + error.message);
    } else {
      setProfileSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => {
        setProfileSuccess('');
        setActiveTab('view-profile'); // Switch back to view after save
      }, 2000);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSendingOtp(true);
    
    // Kiểm tra xem mật khẩu mới có trùng với mật khẩu cũ không bằng cách thử đăng nhập
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: newPassword
    });

    if (!signInError) {
      // Nếu đăng nhập thành công với mật khẩu mới -> Mật khẩu mới chính là mật khẩu cũ!
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      setIsSendingOtp(false);
      return;
    }

    try {
      const generatedOtp = await generateAndStoreOtp(user.email);
      console.log(`[Hệ thống] Gửi mã OTP tới ${user.email}: ${generatedOtp}`);
      alert(`Mã OTP 6 số đã được gửi đến email ${user.email}. Vui lòng kiểm tra email (hoặc xem Console log để lấy mã).`);
      setPasswordStep(2);
    } catch (err) {
      setPasswordError('Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    setIsSavingPassword(true);

    // Verify OTP first
    const isOtpValid = await verifyMockOtp(user.email, otpCode);
    if (!isOtpValid) {
      setPasswordError('Mã OTP không hợp lệ hoặc đã hết hạn.');
      setIsSavingPassword(false);
      return;
    }

    // Supabase auth update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    setIsSavingPassword(false);
    if (error) {
      setPasswordError('Cập nhật mật khẩu thất bại: ' + error.message);
    } else {
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setPasswordStep(1);
      setTimeout(() => setPasswordSuccess(''), 3000);
    }
  };

  // Avatar Upload Handlers
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height) * 0.8;
    setCrop({
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: (width - cropSize) / 2,
      y: (height - cropSize) / 2,
      aspect: 1
    });
  };

  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsUploading(true);
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'avatar.png');
      try {
        const res = await fetch('https://api.imgh.in/upload', {
          method: 'POST',
          headers: {
            'Authorization': 'sk_live_9mprbxu7g1vv5abjjmgmb'
          },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          const fullUrl = data.url.startsWith('http') ? data.url : 'https://' + data.url;
          setAvatar(fullUrl);
          setSrc(null); // Close crop modal
          
          // Auto-save the new avatar to DB
          await updateUserProfile({ avatar: fullUrl });
          setProfileSuccess('Cập nhật ảnh đại diện thành công!');
          setTimeout(() => setProfileSuccess(''), 3000);
        } else {
          setProfileError('Tải ảnh lên thất bại: ' + (data.error || 'Lỗi không xác định'));
        }
      } catch (err) {
        setProfileError('Tải ảnh lên thất bại. Vui lòng thử lại.');
      } finally {
        setIsUploading(false);
      }
    }, 'image/png');
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => setCurrentPage('home')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '15px' }}
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </button>

      <h1 style={{ fontSize: '28px', color: 'var(--color-dark)', marginBottom: '24px' }}>Cài Đặt Tài Khoản</h1>

      <div className="account-layout">
        
        {/* Sidebar Navigation */}
        <div className="account-sidebar">
          <div 
            className={`account-sidebar-item ${activeTab === 'view-profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('view-profile')}
          >
            <Eye size={18} /> Hồ sơ cá nhân
          </div>
          <div 
            className={`account-sidebar-item ${activeTab === 'edit-profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit-profile')}
          >
            <Edit3 size={18} /> Chỉnh sửa thông tin
          </div>
          <div 
            className={`account-sidebar-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} /> Đổi mật khẩu
          </div>
        </div>

        {/* Tab Content */}
        <div className="account-content">
          <div className="glass-panel" style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            
            {/* VIEW PROFILE (Read Only) */}
            {activeTab === 'view-profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt="Avatar" 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                  <div>
                    <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--color-dark)' }}>{user.name || 'Người dùng GearUp'}</h2>
                    <p style={{ color: 'var(--color-text-main)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Email:</strong> {user.email}
                      {user.emailVerified && <span style={{ color: 'var(--color-success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Đã xác thực</span>}
                    </p>
                    <p style={{ color: 'var(--color-text-main)', margin: 0 }}>
                      <strong>Vai trò:</strong> {user.isPartner ? 'Đối tác / Cửa hàng' : 'Thành viên'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Số điện thoại</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>CCCD / CMND</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.citizenId || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Địa chỉ</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user.address || 'Chưa cập nhật'}</div>
                  </div>
                  {user.isPartner && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Tên Studio / Cửa hàng</div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-primary)' }}>{user.studioName || 'Chưa cập nhật'}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button onClick={() => setActiveTab('edit-profile')} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    Cập Nhật Lại Thông Tin
                  </button>
                </div>
              </div>
            )}

            {/* EDIT PROFILE */}
            {activeTab === 'edit-profile' && (
              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                      alt="Avatar" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Camera size={14} />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={onSelectFile} style={{ display: 'none' }} />
                  </div>
                  <div style={{ flex: 1, fontSize: '14px', color: 'var(--color-text-main)' }}>
                    Bấm vào biểu tượng máy ảnh để thay đổi ảnh đại diện.
                    Ảnh sẽ được cắt thành hình vuông (1:1).
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Họ và Tên</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Số Điện Thoại</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>CCCD / CMND</label>
                    <input type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Địa chỉ <span style={{color: 'red'}}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} placeholder="Số nhà, Tên đường (VD: 123 Lê Lợi)" className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                      <input type="text" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Phường/Xã, Quận/Huyện, Tỉnh/TP" className="form-control" required list="account-address-suggestions" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <datalist id="account-address-suggestions">
                      {addressSuggestions.map((suggestion, idx) => <option key={idx} value={suggestion} />)}
                    </datalist>
                  </div>
                  {user.isPartner && (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Tên Studio / Cửa hàng</label>
                      <input type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>
                  )}
                </div>

                {profileError && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{profileError}</div>}
                {profileSuccess && <div style={{ color: 'var(--color-success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> {profileSuccess}</div>}

                <button type="submit" className="btn btn-primary" disabled={isSavingProfile} style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> {isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </form>
            )}

            {/* PASSWORD OTP */}
            {activeTab === 'password' && (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', color: 'var(--color-dark)' }}>
                  <ShieldAlert size={20} color="#ca8a04" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Để bảo vệ tài khoản, việc thay đổi mật khẩu yêu cầu xác thực OTP qua email liên kết ({user.email}).
                  </p>
                </div>

                {passwordStep === 1 ? (
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Xác nhận mật khẩu mới</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    </div>

                    {passwordError && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{passwordError}</div>}

                    <button type="submit" className="btn btn-primary" disabled={isSendingOtp} style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={18} /> {isSendingOtp ? 'Đang Gửi Mã...' : 'Nhận Mã OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-dark)' }}>Nhập mã OTP (6 số)</label>
                      <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required placeholder="123456" maxLength={6} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }} />
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        Mã OTP đã được gửi tới {user.email}. Không nhận được? <button type="button" onClick={() => setPasswordStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }}>Gửi lại</button>
                      </div>
                    </div>

                    {passwordError && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{passwordError}</div>}
                    {passwordSuccess && <div style={{ color: 'var(--color-success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> {passwordSuccess}</div>}

                    <button type="submit" className="btn btn-primary" disabled={isSavingPassword} style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Save size={18} /> {isSavingPassword ? 'Đang cập nhật...' : 'Xác Nhận Đổi Mật Khẩu'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CROP MODAL */}
      {src && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Cắt ảnh đại diện</h3>
            <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <ReactCrop 
                crop={crop} 
                onChange={(c) => setCrop(c)} 
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img src={src} onLoad={onImageLoad} alt="Crop me" style={{ maxHeight: '50vh' }} />
              </ReactCrop>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setSrc(null)} disabled={isUploading}>Hủy bỏ</button>
              <button className="btn btn-primary" onClick={uploadCroppedImage} disabled={isUploading || !completedCrop?.width || !completedCrop?.height}>
                {isUploading ? 'Đang Tải Lên...' : 'Sử Dụng Ảnh Này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
