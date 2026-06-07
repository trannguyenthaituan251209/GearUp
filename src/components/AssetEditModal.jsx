import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function AssetEditModal({ asset, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('sony_cam');
  const [location, setLocation] = useState('TP. Hồ Chí Minh');
  const [pricePerDay, setPricePerDay] = useState('');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [imageSelect, setImageSelect] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mount, setMount] = useState('');
  const [cameraType, setCameraType] = useState('');
  const [sensorType, setSensorType] = useState('');

  useEffect(() => {
    if (asset) {
      setTitle(asset.title || '');
      setCategory(asset.category || 'sony_cam');
      setLocation(asset.location || 'TP. Hồ Chí Minh');
      setPricePerDay(asset.pricePerDay ? asset.pricePerDay.toString() : '');
      setDescription(asset.description || '');
      setSpecsText(asset.specs ? asset.specs.join(', ') : '');
      setImageSelect(asset.imageUrl || '/camera.png');
      setMount(asset.mount || '');
      setCameraType(asset.cameraType || '');
      setSensorType(asset.sensorType || '');
    }
  }, [asset]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

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
        setImageSelect(fullUrl);
      } else {
        alert('Upload thất bại: ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Lỗi upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !pricePerDay || !description.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin thiết bị!');
      return;
    }

    const specsArray = specsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    onSave({
      title,
      category,
      location,
      pricePerDay: parseInt(pricePerDay),
      imageUrl: imageSelect,
      description,
      specs: specsArray.length > 0 ? specsArray : ['Hoạt động tốt'],
      mount,
      cameraType,
      sensorType
    });
  };

  if (!asset) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <h3 className="modal-title" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
          Chỉnh Sửa Thiết Bị Cho Thuê
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label>Tên thiết bị</label>
            <input 
              type="text" 
              className="form-control" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Phân loại danh mục</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="canon_cam">Máy ảnh Canon</option>
                <option value="sony_cam">Máy ảnh Sony</option>
                <option value="fuji_cam">Máy ảnh Fujifilm</option>
                <option value="nikon_cam">Máy ảnh Nikon</option>
                <option value="canon_lens">Ống kính Canon</option>
                <option value="sony_lens">Ống kính Sony</option>
                <option value="fuji_lens">Ống kính Fujifilm</option>
                <option value="flycam">Flycam & Drone</option>
                <option value="gimbal">Gimbal & Chống rung</option>
                <option value="studio_light">Ánh sáng & Studio</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Khu vực cho thuê</label>
              <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Giá cho thuê / Ngày (đ)</label>
              <input 
                type="number" 
                className="form-control" 
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Hình ảnh thiết bị {isUploading && <span style={{fontSize:'12px', color:'var(--color-primary)', marginLeft:'8px'}}>(Đang tải lên...)</span>}</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} disabled={isUploading} />
              {imageSelect && (
                <div style={{marginTop: '10px', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)'}}>
                  <img src={imageSelect} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
              )}
            </div>
          </div>

          {/* New Camera Specs Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Ngàm máy ảnh (Mount)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="VD: Sony E, Canon RF..."
                value={mount}
                onChange={(e) => setMount(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Loại máy ảnh (Type)</label>
              <select className="form-control" value={cameraType} onChange={(e) => setCameraType(e.target.value)}>
                <option value="">Không xác định</option>
                <option value="Mirrorless">Mirrorless</option>
                <option value="DSLR">DSLR</option>
                <option value="Compact">Compact</option>
                <option value="Action Cam">Action Cam</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Loại cảm biến (Sensor)</label>
              <select className="form-control" value={sensorType} onChange={(e) => setSensorType(e.target.value)}>
                <option value="">Không xác định</option>
                <option value="Full-frame">Full-frame</option>
                <option value="APS-C (Crop)">APS-C (Crop)</option>
                <option value="Micro Four Thirds">Micro Four Thirds</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Thông số kỹ thuật chung (Phân cách bằng dấu phẩy)</label>
            <input 
              type="text" 
              className="form-control" 
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết & Quy định cho thuê</label>
            <textarea 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ minHeight: '120px' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
