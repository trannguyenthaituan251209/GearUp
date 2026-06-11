import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const LogoInnovateX = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {/* Stylized X Icon */}
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
    {/* Stylized G Icon with arrow */}
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Semi-circle G in blue */}
      <path d="M21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 13.2386 13.2386 11 16 11C17.3807 11 18.6307 11.5596 19.5355 12.4645" stroke="#0066ff" strokeWidth="4.5" strokeLinecap="round"/>
      {/* Arrow pointing up-right in orange */}
      <path d="M16 16L23 9" stroke="#ff7800" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M18 9H23V14" stroke="#ff7800" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-primary)', color: '#0f172a', letterSpacing: '-0.5px' }}>
      Gear<span style={{ color: '#ff7800' }}>Up</span>
    </span>
  </div>
);

export default function Register({ setCurrentPage }) {
  const { signUpUser, setShowAuthModal } = useContext(StoreContext);
  
  // Registration flow state
  const [step, setStep] = useState(1);
  
  // Fields
  const [ho, setHo] = useState('');
  const [ten, setTen] = useState('');
  const [phone, setPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);

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
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!ho.trim() || !ten.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ Họ và Tên!');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!phone.trim()) {
        setErrorMsg('Vui lòng nhập số điện thoại!');
        return;
      }
      // Simple phone format validation
      const phoneRegex = /^[0-9+]{9,12}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        setErrorMsg('Số điện thoại không hợp lệ!');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!addressCity.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ Quận, Thành phố!');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!email.trim()) {
        setErrorMsg('Vui lòng nhập email!');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Địa chỉ email không hợp lệ!');
        return;
      }
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Vui lòng điền mật khẩu!');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    
    // Concatenate full name from Ho and Ten
    const fullName = `${ho.trim()} ${ten.trim()}`;
    const fullAddress = addressStreet.trim() ? `${addressStreet.trim()}, ${addressCity.trim()}` : addressCity.trim();
    const { error } = await signUpUser(email, password, fullName, phone, fullAddress);
    setLoading(false);
    
    if (error) {
      setErrorMsg(error.message || 'Đăng ký không thành công.');
    } else {
      alert('Đăng ký tài khoản khách hàng thành công!');
      setCurrentPage('home');
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

        {/* Right Side: Step Registration Form */}
        <div style={{
          flex: '1 1 400px',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column'
        }} className="register-form-panel">
          
          {/* Top Info Header */}
          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', display: 'block' }}>
              Chào mừng bạn đến với GearUp
            </span>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
              color: 'var(--color-dark)',
              fontFamily: 'var(--font-primary)'
            }}>
              {step === 5 ? 'BƯỚC CUỐI CÙNG' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </h1>
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
          <form onSubmit={step === 5 ? handleRegister : handleNextStep} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Step 1: Name Field */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Hãy cho chúng tôi biết tên của bạn
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className="form-control register-input"
                      placeholder="Họ"
                      value={ho}
                      onChange={(e) => setHo(e.target.value)}
                      required
                      autoFocus
                      style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className="form-control register-input"
                      placeholder="Tên"
                      value={ten}
                      onChange={(e) => setTen(e.target.value)}
                      required
                      style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Phone number Field */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Hãy cho chúng tôi biết số điện thoại của bạn
                </span>
                <div>
                  <input 
                    type="tel" 
                    className="form-control register-input"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Address Field */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Địa chỉ hiện tại của bạn
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="text" 
                    className="form-control register-input"
                    placeholder="Số nhà, Tên đường (VD: 123 Lê Lợi)"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                  <input 
                    type="text" 
                    className="form-control register-input"
                    placeholder="Phường/Xã, Quận/Huyện, Tỉnh/TP"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    required
                    list="address-suggestions"
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                  <datalist id="address-suggestions">
                    {addressSuggestions.map((suggestion, idx) => (
                      <option key={idx} value={suggestion} />
                    ))}
                  </datalist>
                  <p style={{fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px'}}>
                    * Bắt buộc: Giúp chúng tôi ưu tiên gợi ý các thiết bị ở gần bạn nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Email Field */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600' }}>
                  Hãy cho chúng tôi biết email của bạn
                </span>
                <div>
                  <input 
                    type="email" 
                    className="form-control register-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Password Fields */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Hãy nhập mật khẩu của bạn
                  </span>
                  <input 
                    type="password" 
                    className="form-control register-input"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Nhập lại mật khẩu
                  </span>
                  <input 
                    type="password" 
                    className="form-control register-input"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ height: '52px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '15px', width: '100%' }}
                  />
                </div>

                <span style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4', display: 'block', marginTop: '4px' }}>
                  Bằng việc tạo tài khoản, bạn đồng ý với <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#ff7800', fontWeight: '600', textDecoration: 'underline' }}>chính sách, điều khoản</a> của GearUP
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', alignItems: 'center', gap: '20px' }}>
              {step > 1 && (
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
              )}
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00c3ff', // Light blue text button representing mockup
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'var(--font-primary)',
                  transition: 'var(--transition-fast)'
                }}
                className="next-step-btn"
              >
                {loading ? 'Đang xử lý...' : (step === 5 ? 'Hoàn thành' : 'Bước tiếp theo')}
              </button>
            </div>

          </form>

          {/* Inline Back to Login */}
          <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Đã có tài khoản? </span>
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowAuthModal(true); 
              }}
              style={{ color: 'var(--color-primary)', fontWeight: '700' }}
            >
              Đăng nhập ngay
            </a>
          </div>

        </div>
      </div>

      <style>{`
        .register-input:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15) !important;
          outline: none;
        }
        .next-step-btn:hover {
          color: #0099cc !important;
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
