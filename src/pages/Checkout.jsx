import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { ArrowLeft, CheckCircle, QrCode, ShieldCheck } from 'lucide-react';

export default function Checkout({ setCurrentPage }) {
  const { currentCheckout, setCurrentCheckout, addBooking } = useContext(StoreContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes to pay

  useEffect(() => {
    if (!currentCheckout) {
      setCurrentPage('home');
    }
  }, [currentCheckout, setCurrentPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Thời gian thanh toán đã hết. Vui lòng đặt lại.');
          setCurrentCheckout(null);
          setCurrentPage('home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setCurrentCheckout, setCurrentPage]);

  if (!currentCheckout) return null;

  const bankName = import.meta.env.VITE_SEPAY_BANK || 'MBBank';
  const bankAcc = import.meta.env.VITE_SEPAY_ACC || '0123456789';
  const orderId = `GU${Math.floor(Math.random() * 1000000)}`;
  const des = orderId;
  const amount = currentCheckout.totalPrice;
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAcc}&bank=${bankName}&amount=${amount}&des=${des}`;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateWebhook = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Simulate completing booking
      addBooking({
        ...currentCheckout,
        id: orderId,
        status: 'paid'
      });
      setCurrentCheckout(null);
      setIsProcessing(false);
      setCurrentPage('customer-dashboard');
    }, 1500);
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => { setCurrentCheckout(null); setCurrentPage('home'); }} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600', marginBottom: '24px', fontSize: '15px' }}
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', alignItems: 'start' }} className="checkout-grid">
        
        {/* Left Column: Order Summary & Fee Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--color-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ color: 'var(--color-primary)' }} />
              Chi tiết đơn thuê
            </h2>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed var(--color-border)' }}>
              <img src={currentCheckout.assetImage} alt={currentCheckout.assetTitle} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{currentCheckout.assetTitle}</h3>
                <div style={{ fontSize: '14px', color: 'var(--color-text-main)', marginBottom: '4px' }}><strong>Người thuê:</strong> {currentCheckout.renterName}</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-main)' }}><strong>SĐT:</strong> {currentCheckout.renterContact}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Thời gian thuê:</span>
              <strong>{currentCheckout.startDate} đến {currentCheckout.endDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Số ngày thuê:</span>
              <strong>{currentCheckout.rentalDays} ngày</strong>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--color-dark)' }}>Thành phần giá & Biểu phí</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Đơn giá thiết bị:</span>
              <span>{formatPrice(currentCheckout.pricePerDay)} đ / ngày</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Tiền thuê ({currentCheckout.rentalDays} ngày):</span>
              <span>{formatPrice(currentCheckout.rentalDays * currentCheckout.pricePerDay)} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Cọc bảo đảm (Tạm tính):</span>
              <span>0 đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-main)' }}>Phí dịch vụ nền tảng:</span>
              <span style={{ color: 'var(--color-success)' }}>Bao gồm trong giá</span>
            </div>
            
            <div style={{ margin: '20px 0', borderBottom: '1px solid var(--color-border)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-dark)' }}>Tổng thanh toán:</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary-active)' }}>{formatPrice(amount)} đ</span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code */}
        <div className="glass-panel" style={{ padding: '30px 24px', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--color-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <QrCode style={{ color: 'var(--color-primary)' }} />
            Quét mã để thanh toán
          </h2>
          
          <div style={{ fontSize: '14px', color: 'var(--color-text-main)', marginBottom: '20px' }}>
            Thời gian giữ đơn: <span style={{ color: 'var(--color-danger)', fontWeight: '600', fontSize: '16px' }}>{formatTime(timeLeft)}</span>
          </div>

          <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'inline-block' }}>
            <img src={qrUrl} alt="VietQR" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
          </div>

          <div style={{ fontSize: '14px', textAlign: 'left', background: 'var(--color-light)', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}><strong>Ngân hàng:</strong> {bankName}</div>
            <div style={{ marginBottom: '8px' }}><strong>Số tài khoản:</strong> {bankAcc}</div>
            <div style={{ marginBottom: '8px' }}><strong>Số tiền:</strong> <span style={{ color: 'var(--color-primary-active)', fontWeight: '600' }}>{formatPrice(amount)} đ</span></div>
            <div><strong>Nội dung:</strong> <span style={{ background: '#fff', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}>{des}</span></div>
          </div>

          {/* Simulate webhook button */}
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={handleSimulateWebhook}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang xử lý...' : <><CheckCircle size={18} /> Tôi đã chuyển khoản xong</>}
          </button>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
            (Nút này dùng để giả lập Webhook thành công khi chưa kết nối Backend)
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
