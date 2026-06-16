import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { StoreContext } from '../context/StoreContext';
import { Save, AlertCircle, UploadCloud, Loader2, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const defaultTemplate = `
  <h2 style="text-align: center;">HỢP ĐỒNG THUÊ THIẾT BỊ NHIẾP ẢNH</h2>
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
  <p><em>Chữ ký xác nhận bên dưới thể hiện sự đồng ý với mọi điều khoản trên.</em></p>
`;

export default function ContractSettings() {
  const { user, updateUserProfile } = useContext(StoreContext);
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      if (user.contractTemplates && user.contractTemplates.length > 0) {
        setTemplates(user.contractTemplates);
        if (!activeTemplateId) {
          const def = user.contractTemplates.find(t => t.isDefault) || user.contractTemplates[0];
          setActiveTemplateId(def.id);
        }
      } else {
        // Migration from old single template or new user
        const initialTemplates = [{
          id: Date.now().toString(),
          name: 'Hợp Đồng Mặc Định',
          content: user.contractTemplate || defaultTemplate,
          isDefault: true
        }];
        setTemplates(initialTemplates);
        setActiveTemplateId(initialTemplates[0].id);
      }
    }
  }, [user]);

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const updateActiveTemplateContent = (newContent) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, content: newContent } : t));
  };

  const handleAddTemplate = () => {
    const newId = Date.now().toString();
    setTemplates(prev => [
      ...prev,
      { id: newId, name: 'Mẫu Hợp Đồng Mới', content: '<p>Nội dung hợp đồng mới...</p>', isDefault: false }
    ]);
    setActiveTemplateId(newId);
  };

  const handleDeleteTemplate = (id) => {
    if (templates.length <= 1) {
      alert('Phải có ít nhất 1 mẫu hợp đồng.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa mẫu này không?')) {
      const newTemplates = templates.filter(t => t.id !== id);
      // If we deleted the default, make the first one default
      if (templates.find(t => t.id === id)?.isDefault) {
        newTemplates[0].isDefault = true;
      }
      setTemplates(newTemplates);
      if (activeTemplateId === id) setActiveTemplateId(newTemplates[0].id);
    }
  };

  const handleMakeDefault = (id) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === id
    })));
  };

  const handleChangeName = (id, newName) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const insertVariable = (variable) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertText(range.index, variable);
    editor.setSelection(range.index + variable.length);
  };

  const handleCreateCustomVariable = () => {
    const varName = prompt("Nhập tên biến (ví dụ: BIEN_SO_XE, MUC_DICH_THUE):");
    if (varName) {
      const formattedVar = varName.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      if (formattedVar) {
        insertVariable(`{{${formattedVar}}}`);
      } else {
        alert('Tên biến không hợp lệ.');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateUserProfile({ contractTemplates: templates });
    setIsSaving(false);
    
    if (error) {
      alert(`Lỗi khi lưu hợp đồng: ${error.message || 'Không xác định'}`);
    } else {
      alert('Đã lưu tất cả mẫu hợp đồng thành công!');
    }
  };

  const handleImportPdf = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeTemplate) return;

    if (file.type !== 'application/pdf') {
      alert('Vui lòng chọn file PDF.');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 500);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        clearInterval(progressInterval);
        alert('Chưa cấu hình API Key cho Gemini.');
        setIsImporting(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64EncodedDataPromise;

      const pdfPart = {
        inlineData: { data: base64Data, mimeType: file.type },
      };

      const prompt = "You are an expert HTML formatter. Convert this PDF contract document into an HTML string suitable for a rich text editor. Keep the formatting (bold, italic, lists, paragraphs, alignment) as close as possible to the original. Do not include <head> or <body> tags, just the inner content. Output ONLY the raw HTML string, without any markdown code blocks like ```html.";

      let modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
      let result = null;
      let lastError = null;

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent([prompt, pdfPart]);
          break;
        } catch (err) {
          console.warn(`Model ${modelName} failed:`, err.message);
          lastError = err;
          if (!err.message.includes('503') && !err.message.includes('429')) {
             throw err;
          }
        }
      }

      if (!result) {
        throw new Error(`Tất cả server đều đang quá tải (503). Vui lòng thử lại sau. (${lastError?.message})`);
      }

      const response = await result.response;
      let htmlText = response.text().trim();
      if (htmlText.startsWith('```html')) htmlText = htmlText.substring(7);
      else if (htmlText.startsWith('```')) htmlText = htmlText.substring(3);
      if (htmlText.endsWith('```')) htmlText = htmlText.substring(0, htmlText.length - 3);
      htmlText = htmlText.trim();
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      setTimeout(() => {
        updateActiveTemplateContent(htmlText);
        alert('Chuyển đổi thành công! Vui lòng kiểm tra lại định dạng.');
        setIsImporting(false);
        setImportProgress(0);
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      alert('Có lỗi xảy ra khi chuyển đổi PDF. Chi tiết: ' + err.message);
      setIsImporting(false);
      setImportProgress(0);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const variables = [
    { label: 'Tên Khách Hàng', val: '{{TEN_KHACH_HANG}}' },
    { label: 'SĐT Khách', val: '{{SDT_KHACH_HANG}}' },
    { label: 'CCCD Khách', val: '{{CCCD_KHACH_HANG}}' },
    { label: 'Tên Chủ Thuê', val: '{{TEN_CHU_THUE}}' },
    { label: 'SĐT Chủ Thuê', val: '{{SDT_CHU_THUE}}' },
    { label: 'CCCD Chủ Thuê', val: '{{CCCD_CHU_THUE}}' },
    { label: 'Địa Chỉ Chủ Thuê', val: '{{DIA_CHI_CHU_THUE}}' },
    { label: 'Tên Thiết Bị', val: '{{TEN_THIET_BI}}' },
    { label: 'Ngày Bắt Đầu', val: '{{NGAY_BAT_DAU}}' },
    { label: 'Ngày Kết Thúc', val: '{{NGAY_KET_THUC}}' },
    { label: 'Tổng Tiền', val: '{{TONG_TIEN}}' },
  ];

  if (!templates.length || !activeTemplate) return null;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .quill-contract .ql-container {
          min-height: 400px;
          max-height: 550px;
          overflow-y: auto;
        }
        .template-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--color-border);
          transition: background-color 0.2s;
        }
        .template-item:hover {
          background-color: #f8fafc;
        }
        .template-item.active {
          background-color: #e0f2fe;
          border-left: 3px solid var(--color-primary);
        }
      `}</style>

      <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', m: 0 }}>Quản Lý Mẫu Hợp Đồng</h2>
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} />
          {isSaving ? 'Đang lưu...' : 'Lưu Tất Cả'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: '600px' }}>
        {/* Sidebar */}
        <div style={{ width: '280px', borderRight: '1px solid var(--color-border)', backgroundColor: '#fdfdfd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={handleAddTemplate} className="btn btn-outline btn-sm w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Plus size={16} /> Thêm Mẫu Mới
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {templates.map(t => (
              <div 
                key={t.id} 
                className={`template-item ${activeTemplateId === t.id ? 'active' : ''}`}
                onClick={() => setActiveTemplateId(t.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                    {t.name}
                  </div>
                  {t.isDefault && (
                    <span style={{ fontSize: '10px', backgroundColor: 'var(--color-primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      MẶC ĐỊNH
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {!t.isDefault && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMakeDefault(t.id); }}
                      style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Đặt Mặc định
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}
                    style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <Edit2 size={18} color="var(--color-text-muted)" />
              <input 
                type="text" 
                value={activeTemplate.name}
                onChange={(e) => handleChangeName(activeTemplate.id, e.target.value)}
                style={{ fontSize: '18px', fontWeight: '600', border: 'none', outline: 'none', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', width: '300px' }}
                placeholder="Tên mẫu hợp đồng..."
              />
            </div>
            <div>
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleImportPdf} style={{ display: 'none' }} />
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isImporting ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                {isImporting ? 'Đang phân tích AI...' : 'Nhập từ file PDF (AI)'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>Chèn biến:</span>
            {variables.map(v => (
              <button key={v.val} onClick={() => insertVariable(v.val)} className="btn btn-outline btn-sm" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '99px' }}>
                {v.label}
              </button>
            ))}
            <button onClick={handleCreateCustomVariable} className="btn btn-outline btn-sm" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '99px', borderStyle: 'dashed', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <Plus size={12} style={{ marginRight: '4px' }}/> Tạo Biến Tùy Chỉnh
            </button>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {isImporting && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
              }}>
                <Loader2 size={40} className="spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Đang phân tích và chuyển đổi PDF...</h3>
                <div style={{ width: '80%', maxWidth: '400px', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${importProgress}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.4s ease-out' }}></div>
                </div>
                <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{importProgress}%</p>
              </div>
            )}

            <ReactQuill 
              ref={quillRef}
              theme="snow" 
              value={activeTemplate.content} 
              onChange={updateActiveTemplateContent}
              className="quill-contract"
              style={{ backgroundColor: '#fff', flex: 1 }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  [{ 'size': ['small', false, 'large', 'huge'] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'align': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> Chữ ký của khách hàng sẽ được tự động đính kèm ở phần cuối cùng của hợp đồng khi thuê.
          </div>
        </div>
      </div>
    </div>
  );
}
