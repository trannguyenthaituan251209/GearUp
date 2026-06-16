import React, { useState, useEffect, useContext, useRef } from 'react';
import { StoreContext } from '../context/StoreContext';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FileText, CheckCircle, ArrowLeft, Download, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import 'react-quill-new/dist/quill.snow.css';

export default function Contract({ setCurrentPage }) {
  const { currentCheckout, setCurrentCheckout, user, assets } = useContext(StoreContext);
  const [htmlContent, setHtmlContent] = useState('');
  const [rawTemplate, setRawTemplate] = useState('');
  const [customVariables, setCustomVariables] = useState([]);
  const [customValues, setCustomValues] = useState({});
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const sigCanvas = useRef(null);
  const contractRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!currentCheckout || !assets) return;
    const fetchPartner = async () => {
      const asset = assets.find(a => a.id === currentCheckout.assetId);
      if (asset) {
        // Find partner template
        const { data } = await supabase.from('profiles').select('contract_template, contract_templates, name, studio_name, phone, citizen_id').eq('id', asset.ownerId).maybeSingle();
        if (data) {
          setPartnerProfile(data);
          let template = '';
          
          if (data.contract_templates && data.contract_templates.length > 0) {
            const def = data.contract_templates.find(t => t.isDefault);
            template = def ? def.content : data.contract_templates[0].content;
          } else if (data.contract_template) {
            template = data.contract_template;
          }
          
          if (!template) {
            template = `<h2 style="text-align: center;">HỢP ĐỒNG THUÊ THIẾT BỊ NHIẾP ẢNH</h2>
<p><strong>Bên Cho Thuê (Bên A):</strong> {{TEN_CHU_THUE}}</p>
<p><strong>Bên Thuê (Bên B):</strong> {{TEN_KHACH_HANG}}</p>
<p><strong>SĐT Bên B:</strong> {{SDT_KHACH_HANG}}</p>
<p><strong>CCCD/CMND Bên B:</strong> {{CCCD_KHACH_HANG}}</p>
<hr />
<h3>ĐIỀU 1: THÔNG TIN THIẾT BỊ VÀ THỜI GIAN THUÊ</h3>
<p>Bên A đồng ý cho Bên B thuê thiết bị: <strong>{{TEN_THIET_BI}}</strong></p>
<p>Thời gian thuê: Từ ngày <strong>{{NGAY_BAT_DAU}}</strong> đến ngày <strong>{{NGAY_KET_THUC}}</strong></p>
<p>Tổng giá trị hợp đồng: <strong>{{TONG_TIEN}}</strong> VNĐ</p>
<hr />
<h3>ĐIỀU 2: TRÁCH NHIỆM BÊN B</h3>
<ul>
  <li>Bên B có trách nhiệm bảo quản thiết bị trong suốt thời gian thuê.</li>
  <li>Mọi hỏng hóc, mất mát do lỗi của Bên B sẽ phải bồi thường 100% giá trị thiết bị theo thị trường hiện tại.</li>
  <li>Giao trả thiết bị đúng thời hạn. Trễ hạn sẽ tính phí theo ngày.</li>
</ul>
<br/>
<p><em>Chữ ký xác nhận bên dưới thể hiện sự đồng ý với mọi điều khoản trên.</em></p>`;
          }

          setRawTemplate(template);
        }
      }
    };
    fetchPartner();
  }, [currentCheckout, assets]);

  useEffect(() => {
    if (!rawTemplate) return;
    
    const standardVars = [
      'TEN_CHU_THUE', 'TEN_KHACH_HANG', 'SDT_KHACH_HANG', 'CCCD_KHACH_HANG',
      'TEN_THIET_BI', 'NGAY_BAT_DAU', 'NGAY_KET_THUC', 'TONG_TIEN',
      'SDT_CHU_THUE', 'CCCD_CHU_THUE', 'DIA_CHI_CHU_THUE'
    ];

    let processed = rawTemplate;
    
    // Replace standard vars
    processed = processed.replace(/{{TEN_CHU_THUE}}/g, partnerProfile?.studio_name || partnerProfile?.name || assets?.find(a => a.id === currentCheckout?.assetId)?.ownerName || '');
    processed = processed.replace(/{{SDT_CHU_THUE}}/g, partnerProfile?.phone || '');
    processed = processed.replace(/{{CCCD_CHU_THUE}}/g, partnerProfile?.citizen_id || '');
    processed = processed.replace(/{{DIA_CHI_CHU_THUE}}/g, partnerProfile?.address || '');
    
    processed = processed.replace(/{{TEN_KHACH_HANG}}/g, currentCheckout?.renterName || '');
    processed = processed.replace(/{{SDT_KHACH_HANG}}/g, currentCheckout?.renterPhone || '');
    processed = processed.replace(/{{CCCD_KHACH_HANG}}/g, currentCheckout?.renterId || '(Chưa cung cấp)');
    processed = processed.replace(/{{TEN_THIET_BI}}/g, currentCheckout?.assetTitle || '');
    processed = processed.replace(/{{NGAY_BAT_DAU}}/g, currentCheckout?.startDate || '');
    processed = processed.replace(/{{NGAY_KET_THUC}}/g, currentCheckout?.endDate || '');
    processed = processed.replace(/{{TONG_TIEN}}/g, currentCheckout ? new Intl.NumberFormat('vi-VN').format(currentCheckout.totalPrice) : '');

    // Extract all custom vars
    const matches = rawTemplate.match(/\{\{([A-Z0-9_]+)\}\}/g) || [];
    const allVars = matches.map(m => m.replace(/[{}]/g, ''));
    const uniqueCustomVars = [...new Set(allVars)].filter(v => !standardVars.includes(v));
    
    if (customVariables.length === 0 && uniqueCustomVars.length > 0) {
      setCustomVariables(uniqueCustomVars);
      const initialValues = {};
      uniqueCustomVars.forEach(v => initialValues[v] = '');
      setCustomValues(initialValues);
    }

    // Replace custom vars
    uniqueCustomVars.forEach(v => {
      const regex = new RegExp(`{{${v}}}`, 'g');
      processed = processed.replace(regex, customValues[v] || `<span style="color:var(--color-primary);font-weight:bold">[Cần nhập: ${v}]</span>`);
    });

    setHtmlContent(processed);
  }, [rawTemplate, customValues, currentCheckout, partnerProfile, assets, customVariables.length]);

  const handleClearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleReview = () => {
    // Check if all custom vars are filled
    const missingVars = customVariables.filter(v => !customValues[v]?.trim());
    if (missingVars.length > 0) {
      alert(`Vui lòng điền đầy đủ các thông tin: ${missingVars.join(', ')}`);
      return;
    }
    if (sigCanvas.current.isEmpty()) {
      alert('Vui lòng ký tên xác nhận trước khi tiếp tục.');
      return;
    }
    setShowReview(true);
  };

  const handleSignAndGeneratePdf = async () => {
    setIsProcessing(true);
    try {
      if (wrapperRef.current) {
        wrapperRef.current.style.maxHeight = 'none';
        wrapperRef.current.style.overflowY = 'visible';
      }
      
      // wait for browser to apply styles
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. Convert html to canvas
      const canvas = await html2canvas(contractRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      if (wrapperRef.current) {
        wrapperRef.current.style.maxHeight = '70vh';
        wrapperRef.current.style.overflowY = 'auto';
      }
      
      // 2. Add to jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // 3. Save as Blob
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Upload to Supabase Storage
      const fileName = `contract_${currentCheckout.id || Date.now()}_${Math.floor(Math.random()*1000)}.pdf`;
      const { data, error } = await supabase.storage.from('contracts').upload(fileName, pdfBlob, {
        contentType: 'application/pdf'
      });
      
      if (!error) {
         const { data: publicUrlData } = supabase.storage.from('contracts').getPublicUrl(fileName);
         setCurrentCheckout({
           ...currentCheckout,
           contractUrl: publicUrlData.publicUrl
         });
      } else {
         console.error("Lỗi upload hợp đồng:", error);
      }

      setIsProcessing(false);
      setShowReview(false);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Hop_Dong_Thue_Thiet_Bi_${currentCheckout.assetTitle}.pdf`;
      link.click();

      // Proceed to checkout
      setTimeout(() => {
        setCurrentPage('checkout');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo PDF hợp đồng.");
      setIsProcessing(false);
    }
  };

  if (!currentCheckout) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Không có thông tin hợp đồng.</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '800px' }}>
      
      <button 
        className="btn btn-ghost" 
        onClick={() => setCurrentPage('asset-detail', currentCheckout.assetId)}
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--color-dark)' }}>Ký Hợp Đồng Điện Tử</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Vui lòng đọc kỹ các điều khoản và ký tên xác nhận.</p>
      </div>

      {customVariables.length > 0 &&          <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', padding: '32px', marginBottom: '32px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Thông tin bổ sung
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {customVariables.map(v => (
                <div key={v}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: '#475569' }}>
                    {v.replace(/_/g, ' ')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={customValues[v] || ''}
                    onChange={(e) => setCustomValues(prev => ({ ...prev, [v]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '15px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0',
                      outline: 'none',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f172a';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                    placeholder={`Nhập ${v.replace(/_/g, ' ').toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
      }

      {/* Khung chứa tờ giấy A4 có thể cuộn */}
      <div 
        ref={wrapperRef}
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '32px 16px',
          marginBottom: '32px'
        }}
      >
        {/* Tờ giấy hợp đồng A4 thực tế (Ref dùng để in PDF) */}
        <div 
          ref={contractRef}
          style={{ 
            backgroundColor: '#fff', 
            padding: '48px 40px', 
            minHeight: '1123px', // Tỷ lệ A4 ở độ phân giải 96dpi
            maxWidth: '794px',   // Chiều rộng A4 chuẩn
            margin: '0 auto',
            border: '1px solid #cbd5e1',
            lineHeight: '1.6', 
            color: '#000',
            fontSize: '15px',
            fontFamily: 'Times New Roman, serif',
            wordBreak: 'normal',
            overflowWrap: 'break-word'
          }}
        >
          <div className="ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: htmlContent }} style={{ padding: 0 }} />
          </div>
        
        {/* Phần chữ ký ở cuối Hợp đồng */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Người Thuê (Ký và ghi rõ họ tên)</p>
            {showReview || pdfUrl ? (
               <img src={sigCanvas.current?.getCanvas().toDataURL('image/png')} alt="Chữ ký" style={{ height: '100px', objectFit: 'contain' }} />
            ) : (
               <div style={{ border: '1px dashed #ccc', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                 <SignatureCanvas 
                   ref={sigCanvas} 
                   penColor="blue"
                   canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }} 
                 />
               </div>
            )}
            {!showReview && !pdfUrl && (
              <button onClick={handleClearSignature} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px', cursor: 'pointer', textDecoration: 'underline' }}>
                Xóa chữ ký
              </button>
            )}
            <p style={{ marginTop: '8px' }}>{currentCheckout.renterName}</p>
          </div>
        </div>
      </div>
      </div>

      {!pdfUrl && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleReview} className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} /> Xác Nhận & Xem Trước
          </button>
        </div>
      )}

      {pdfUrl && (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--color-success-light)', borderRadius: '8px', color: 'var(--color-success)', fontWeight: '600' }}>
          Đã ký thành công! Đang chuyển sang trang thanh toán...
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content animate-scale" style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Xác Nhận Hợp Đồng</h3>
              <button onClick={() => setShowReview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><XCircle size={24} /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Hệ thống sẽ tạo file PDF hợp đồng với các thông tin sau. Vui lòng kiểm tra kỹ trước khi xuất:</p>
              
              <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Thiết bị:</span>
                  <span style={{ fontWeight: '600' }}>{currentCheckout.assetTitle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Người thuê:</span>
                  <span style={{ fontWeight: '600' }}>{currentCheckout.renterName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Thời gian:</span>
                  <span style={{ fontWeight: '600' }}>{currentCheckout.startDate} - {currentCheckout.endDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tổng tiền:</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{new Intl.NumberFormat('vi-VN').format(currentCheckout.totalPrice)} đ</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Chữ ký của bạn:</span>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px', marginTop: '8px', display: 'inline-block' }}>
                   <img src={sigCanvas.current?.getCanvas().toDataURL('image/png')} alt="Chữ ký" style={{ height: '60px' }} />
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleSignAndGeneratePdf}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang tạo PDF...' : <><Download size={20} /> Ký & Tải File PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
