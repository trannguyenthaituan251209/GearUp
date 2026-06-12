import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, Smartphone, CheckCircle, ShieldCheck, Lock, Crown } from 'lucide-react';

export default function SubscriptionCheckout({ tier, onCancel, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Giả lập gọi API thanh toán mất 2 giây
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Đợi 2 giây sau khi báo thành công rồi mới gọi onComplete để về trang trước
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <CheckCircle size={48} color="#10b981" />
        </div>
        <h2 style={{ fontSize: '32px', color: 'var(--color-dark)', marginBottom: '12px' }}>Thanh Toán Thành Công!</h2>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
          Cảm ơn bạn đã đăng ký <strong>{tier.name}</strong>. Quyền lợi của bạn đã được kích hoạt ngay lập tức.
        </p>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '16px' }}>Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', zIndex: 9999, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', padding: '16px 24px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <button 
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontWeight: '600' }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
          <Lock size={16} />
          <span>Thanh toán bảo mật SSL</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--color-dark)', marginBottom: '32px' }}>Thanh toán Gói Hội Viên</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Column: Payment Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-dark)' }}>1. Chọn phương thức thanh toán</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  onClick={() => setPaymentMethod('credit_card')}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: paymentMethod === 'credit_card' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: paymentMethod === 'credit_card' ? '#eff6ff' : '#fff', transition: 'all 0.2s' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--color-dark)' }}>Thẻ Tín dụng / Ghi nợ</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Visa, Mastercard, JCB</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'credit_card' ? '6px solid var(--color-primary)' : '2px solid #cbd5e1', backgroundColor: '#fff' }} />
                </div>

                <div 
                  onClick={() => setPaymentMethod('momo')}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: paymentMethod === 'momo' ? '2px solid #a82468' : '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: paymentMethod === 'momo' ? '#fdf2f8' : '#fff', transition: 'all 0.2s' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={20} color="#a82468" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--color-dark)' }}>Ví MoMo</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Thanh toán qua ứng dụng MoMo</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'momo' ? '6px solid #a82468' : '2px solid #cbd5e1', backgroundColor: '#fff' }} />
                </div>

                <div 
                  onClick={() => setPaymentMethod('vnpay')}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: paymentMethod === 'vnpay' ? '2px solid #005a9e' : '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', backgroundColor: paymentMethod === 'vnpay' ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={20} color="#005a9e" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--color-dark)' }}>VNPAY-QR</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Quét mã qua ứng dụng Ngân hàng</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'vnpay' ? '6px solid #005a9e' : '2px solid #cbd5e1', backgroundColor: '#fff' }} />
                </div>
              </div>
            </div>

            {/* Payment Details Form (Only for Credit Card) */}
            {paymentMethod === 'credit_card' && (
              <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)', animation: 'fadeIn 0.3s' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-dark)' }}>2. Thông tin thẻ</h3>
                
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)' }}>Số thẻ</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength="19"
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)' }}>Tên in trên thẻ</label>
                    <input 
                      type="text" 
                      placeholder="NGUYEN VAN A" 
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)' }}>Ngày hết hạn (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        maxLength="5"
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)' }}>Mã bảo mật (CVV)</label>
                      <input 
                        type="password" 
                        placeholder="***" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength="3"
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isProcessing}
                    style={{ marginTop: '16px', padding: '16px', fontSize: '16px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', height: '56px' }}
                  >
                    {isProcessing ? (
                      <>
                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Đang xử lý...
                      </>
                    ) : (
                      `Thanh toán ${tier.price}`
                    )}
                  </button>
                </form>
              </div>
            )}

            {paymentMethod !== 'credit_card' && (
              <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)', animation: 'fadeIn 0.3s' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                    <div style={{ width: '160px', height: '160px', border: '1px dashed var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>QR Code giả lập</span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
                      Mở ứng dụng {paymentMethod === 'momo' ? 'MoMo' : 'ngân hàng'} để quét mã QR thanh toán.
                    </p>
                    <button 
                      onClick={handlePayment} 
                      className="btn btn-primary"
                      disabled={isProcessing}
                      style={{ padding: '14px 32px', fontWeight: '600', minWidth: '200px' }}
                    >
                      {isProcessing ? 'Đang chờ xác nhận...' : 'Giả lập quét xong'}
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-dark)' }}>Chi tiết đơn hàng</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: tier.id === 'gold' ? '#fefce8' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Crown size={32} color={tier.id === 'gold' ? '#eab308' : '#94a3b8'} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-dark)', marginBottom: '4px' }}>{tier.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Thời hạn: 30 ngày</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-main)' }}>
                <span>Giá gói</span>
                <span>{tier.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-main)' }}>
                <span>VAT (10%)</span>
                <span>Đã bao gồm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981' }}>
                <span>Mã giảm giá</span>
                <span>-0 VNĐ</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: '600', fontSize: '16px', color: 'var(--color-dark)' }}>Tổng thanh toán</span>
              <span style={{ fontWeight: '800', fontSize: '24px', color: 'var(--color-primary)' }}>{tier.price}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#15803d', fontSize: '12px' }}>
              <ShieldCheck size={16} />
              <span>Giao dịch của bạn được bảo vệ với công nghệ mã hóa chuẩn quốc tế 256-bit.</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
