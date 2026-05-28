import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { AlertCircle, ArrowLeft, Smartphone, CreditCard, Building, ShieldCheck, FileText, Check } from 'lucide-react';

const LogoInnovateX = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L26 26" stroke="#ff7800" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M26 6L6 26" stroke="#0066ff" strokeWidth="5.5" strokeLinecap="round"/>
    </svg>
    <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-primary)', color: '#0f172a', letterSpacing: '-0.5px' }}>
      Innovate<span style={{ color: '#ff7800' }}>X</span>
    </span>
  </div>
);

const LogoGearUp = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 13.2386 13.2386 11 16 11C17.3807 11 18.6307 11.5596 19.5355 12.4645" stroke="#0066ff" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M16 16L23 9" stroke="#ff7800" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M18 9H23V14" stroke="#ff7800" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-primary)', color: '#0f172a', letterSpacing: '-0.5px' }}>
      Gear<span style={{ color: '#ff7800' }}>Up</span>
    </span>
  </div>
);

export default function PartnerRegister({ setCurrentPage }) {
  const { user, registerPartner } = useContext(StoreContext);

  // Steps: 
  // 1: Studio Name & Contact phone
  // 2: Identity (Citizen ID, front & back image mocks)
  // 3: Legals (Tax ID, Business registration / device possession license)
  // 4: Agreement & Submit
  const [step, setStep] = useState(1);

  // Form Fields
  const [phone, setPhone] = useState(user?.phone || '');
  const [studioName, setStudioName] = useState(user?.studioName || '');
  const [citizenId, setCitizenId] = useState(user?.citizenId || '');
  const [frontCardName, setFrontCardName] = useState('');
  const [backCardName, setBackCardName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!studioName.trim()) {
        setErrorMsg('Vui lòng nhập tên Cửa hàng / Studio của bạn!');
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Vui lòng nhập số điện thoại liên hệ!');
        return;
      }
      const phoneRegex = /^[0-9+]{9,12}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        setErrorMsg('Số điện thoại không hợp lệ!');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!citizenId.trim()) {
        setErrorMsg('Vui lòng nhập Số CCCD/CMND!');
        return;
      }
      if (citizenId.length < 9 || citizenId.length > 12) {
        setErrorMsg('Số CCCD/CMND không đúng định dạng (9 hoặc 12 số)!');
        return;
      }
      if (!frontCardName || !backCardName) {
        setErrorMsg('Vui lòng tải lên đầy đủ ảnh chụp mặt trước và mặt sau CCCD!');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!taxId.trim()) {
        setErrorMsg('Vui lòng nhập Mã số thuế cá nhân hoặc Hộ kinh doanh!');
        return;
      }
      if (!licenseName) {
        setErrorMsg('Vui lòng tải lên Giấy phép ĐKKD hoặc Giấy chứng nhận sở hữu thiết bị!');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('Bạn phải đồng ý với cam kết điều khoản đối tác!');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const { error } = await registerPartner(phone, citizenId, studioName);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Đăng ký đối tác thất bại. Vui lòng kiểm tra lại thông tin.');
    } else {
      // Build Partner URL redirect
      const { protocol, host, hostname, port, pathname } = window.location;
      let partnerUrl = '';
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        partnerUrl = `${protocol}//partner.localhost:${port || '5173'}${pathname}?portal=partner`;
      } else {
        partnerUrl = `${protocol}//partner.${host}${pathname}`;
      }
      
      alert('Gửi yêu cầu đăng ký Đối Tác thành công! Hồ sơ của bạn đang được tiếp nhận và chờ Ban quản trị phê duyệt.');
      window.location.href = partnerUrl;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-secondary)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '80px',
        maxWidth: '1100px',
        width: '100%',
        padding: '40px var(--spacing-lg)',
        flexWrap: 'wrap'
      }} className="register-layout">
        
        {/* Left Side: Brand Logos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} className="register-logos">
          <LogoInnovateX />
          <div style={{
            height: '45px',
            width: '1.5px',
            backgroundColor: '#cbd5e1',
            margin: '0 24px'
          }} />
          <LogoGearUp />
        </div>

        {/* Right Side: Step Partner Registration Form */}
        <div style={{
          flex: '1 1 400px',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column'
        }} className="register-form-panel">
          
          {/* Top Info Header */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontSize: '14px', color: '#ff7800', fontWeight: '700', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trở Thành Đối Tác GearUp
            </span>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
              color: 'var(--color-dark)',
              fontFamily: 'var(--font-primary)'
            }}>
              {step === 1 && '1. Thông tin Cửa Hàng'}
              {step === 2 && '2. Xác minh Danh Tính'}
              {step === 3 && '3. Giấy Tờ Pháp Lý'}
              {step === 4 && '4. Cam kết & Kích hoạt'}
            </h1>
            
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: s <= step ? 'var(--color-secondary)' : '#e2e8f0',
                    transition: 'background-color 0.3s'
                  }}
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              color: 'var(--color-danger)',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              border: '1px solid #fee2e2'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={step === 4 ? handleRegister : handleNextStep} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Step 1: Shop & Contact */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Thiết lập kênh cho thuê hoặc thương hiệu Studio của bạn
                </span>
                
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <Building size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Tên Kênh cho thuê / Studio của bạn</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control register-input"
                    placeholder="Ví dụ: Hoàng Hải Studio, A7 Rental..."
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <Smartphone size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Số điện thoại hotline liên hệ</span>
                  </label>
                  <input 
                    type="tel" 
                    className="form-control register-input"
                    placeholder="Ví dụ: 0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Identification documents */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Tải lên tài liệu xác minh căn cước công dân
                </span>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <CreditCard size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Số CMND / CCCD</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control register-input"
                    placeholder="Nhập chính xác 9 hoặc 12 số"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                  />
                </div>

                {/* File uploads */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Mặt trước CCCD</label>
                    <div style={{
                      height: '90px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#f8fafc'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                        onChange={(e) => setFrontCardName(e.target.files[0]?.name || '')}
                      />
                      <span style={{ fontSize: '12px', color: '#ff7800', fontWeight: '700' }}>
                        {frontCardName ? 'Đã chọn ảnh' : 'Chọn ảnh chụp'}
                      </span>
                      {frontCardName && (
                        <span style={{ fontSize: '10px', color: '#64748b', padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', marginTop: '4px' }}>
                          {frontCardName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Mặt sau CCCD</label>
                    <div style={{
                      height: '90px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#f8fafc'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                        onChange={(e) => setBackCardName(e.target.files[0]?.name || '')}
                      />
                      <span style={{ fontSize: '12px', color: '#ff7800', fontWeight: '700' }}>
                        {backCardName ? 'Đã chọn ảnh' : 'Chọn ảnh chụp'}
                      </span>
                      {backCardName && (
                        <span style={{ fontSize: '10px', color: '#64748b', padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', marginTop: '4px' }}>
                          {backCardName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Legals & Licensing */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Cung cấp mã số thuế và tài liệu xác thực kinh doanh
                </span>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span>Mã Số Thuế (MST) cá nhân / HKD / Doanh nghiệp</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control register-input"
                    placeholder="Nhập 10 hoặc 13 chữ số MST"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    Giấy Đăng Ký Kinh Doanh hoặc Giấy Tờ Sở Hữu Thiết Bị (PDF/Ảnh)
                  </label>
                  <div style={{
                    height: '110px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: '#f8fafc',
                    padding: '16px'
                  }}>
                    <input 
                      type="file" 
                      accept=".pdf,image/*"
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                      onChange={(e) => setLicenseName(e.target.files[0]?.name || '')}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {licenseName ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : '+ Đính kèm tài liệu'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
                      {licenseName ? licenseName : 'Chấp nhận tệp PDF, PNG, JPG tối đa 10MB'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Terms & Sign Off */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-secondary-light)',
                  border: '1px solid rgba(255, 120, 0, 0.25)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: 'var(--color-secondary-active)',
                  lineHeight: '1.6'
                }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#ff7800' }}>
                    <ShieldCheck size={16} /> 
                    <span>Cam kết Đối tác Nền tảng:</span>
                  </strong>
                  Bằng việc hoàn tất quy trình đăng ký, tôi cam kết tất cả thông tin và chứng từ cung cấp trên đây là hoàn toàn đúng pháp luật. Tôi đồng ý duy trì chất lượng thiết bị tốt nhất và tuân thủ các quy chế bồi thường/bảo hiểm của GearUp.
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="agreeTermsPartner"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--color-secondary)', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="agreeTermsPartner" style={{ fontSize: '13px', color: 'var(--color-text-main)', cursor: 'pointer', lineHeight: '1.5' }}>
                    Tôi đồng ý với các <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-secondary)', fontWeight: '700', textDecoration: 'underline' }}>Điều khoản & Quy chế hoạt động đối tác</a> của GearUp.
                  </label>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', alignItems: 'center', gap: '20px' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-primary)'
                  }}
                  className="prev-step-btn"
                >
                  Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-primary)'
                  }}
                  className="prev-step-btn"
                >
                  Hủy đăng ký
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-secondary)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-primary)',
                  transition: 'var(--transition-fast)'
                }}
                className="next-step-btn-partner"
              >
                {loading ? 'Đang kích hoạt...' : (step === 4 ? 'Kích hoạt Cửa Hàng' : 'Tiếp tục')}
              </button>
            </div>

          </form>

        </div>
      </div>

      <style>{`
        .register-input:focus {
          border-color: var(--color-secondary) !important;
          box-shadow: 0 0 0 3px rgba(255, 120, 0, 0.15) !important;
          outline: none;
        }
        .next-step-btn-partner:hover {
          color: var(--color-secondary-active) !important;
          transform: translateX(2px);
        }
        .prev-step-btn:hover {
          color: var(--color-dark) !important;
        }
        @media (max-width: 820px) {
          .register-layout {
            flex-direction: column !important;
            gap: 40px !important;
            padding: 40px 24px !important;
          }
          .register-logos {
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 24px;
            width: 100%;
          }
          .register-logos div {
            display: none !important;
          }
          .register-form-panel {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
