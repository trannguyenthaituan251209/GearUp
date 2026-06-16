import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  Camera,
  Users,
  Eye,
  EyeOff,
  Edit3,
  Check,
  X,
  CreditCard,
  ArrowRight,
  RotateCcw,
  StopCircle,
  Calendar,
  MessageSquare,
  Inbox,
  User,
  Trash2,
  CheckCircle2,
  CheckCheck,
  Menu,
  FileText
} from 'lucide-react';
import AssetEditModal from '../components/AssetEditModal';
import ContractSettings from '../components/ContractSettings';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function PartnerDashboard() {
  const { user, assets, bookings, updateBookingStatus, updateAssetStatus, deleteAsset, addAsset, updateAssetDetails, messages, addMessage, markMessagesAsSeen, typingStatus, sendTypingEvent, handleViewContract } = useContext(StoreContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSelectedAssetId, setChatSelectedAssetId] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [sessionViewedBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('partner_viewed_bookings')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (activeTab === 'orders' && bookings.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('partner_viewed_bookings')) || [];
        // We use bookings instead of myBookings here to avoid myBookings dependency issues, 
        // but we filter for only the ones this partner owns.
        // Actually myBookings is available below, let's just use it.
      } catch {}
    }
  }, [activeTab, bookings]);

  // --- Data Calculations ---
  const myAssets = useMemo(() => assets.filter(a => 
    a.ownerId === user?.id || 
    (user?.id === 'demo-user-id' && a.ownerName === 'Nguyễn Minh Quân')
  ), [assets, user]);
  
  const myAssetIds = useMemo(() => myAssets.map(a => a.id), [myAssets]);

  const myBookings = useMemo(() => bookings.filter(b => myAssetIds.includes(b.assetId)), [bookings, myAssetIds]);

  const threadMessages = useMemo(() => messages.filter(m => m.customerId === chatSelectedAssetId && myAssetIds.includes(m.assetId)), [messages, chatSelectedAssetId, myAssetIds]);

  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatSelectedAssetId && activeTab === 'chat') {
      const hasUnseen = threadMessages.some(m => m.receiverId === user?.id && m.status === 'sent');
      if (hasUnseen) {
        markMessagesAsSeen(chatSelectedAssetId, false);
      }
    }
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  }, [chatSelectedAssetId, activeTab, threadMessages.length, markMessagesAsSeen, user?.id]);

  useEffect(() => {
    if (activeTab === 'orders' && myBookings.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('partner_viewed_bookings')) || [];
        const currentIds = myBookings.map(b => b.id);
        const newStored = Array.from(new Set([...stored, ...currentIds]));
        localStorage.setItem('partner_viewed_bookings', JSON.stringify(newStored));
      } catch {}
    }
  }, [activeTab, myBookings]);

  const totalGrossRevenue = useMemo(() => myBookings
    .filter(b => ['approved', 'paid', 'returned'].includes(b.status))
    .reduce((acc, curr) => acc + curr.totalPrice, 0), [myBookings]);

  // PLATFORM FEE LOGIC: 10%
  const PLATFORM_FEE_PERCENTAGE = 0.10;
  const platformFee = totalGrossRevenue * PLATFORM_FEE_PERCENTAGE;
  const netRevenue = totalGrossRevenue - platformFee;

  const activeAssetsCount = myAssets.filter(a => a.status === 'available').length;
  const pausedAssetsCount = myAssets.filter(a => a.status === 'paused').length;
  const pendingRequestsCount = myBookings.filter(b => b.status === 'pending').length;

  // Real monthly revenue data for Chart
  const monthlyRevenueData = useMemo(() => {
    const revenueByMonth = {};
    const months = [];
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, name: `Tháng ${d.getMonth() + 1}`, Doanh_Thu: 0 });
      revenueByMonth[key] = 0;
    }

    myBookings.forEach(b => {
      if (['approved', 'paid', 'returned'].includes(b.status)) {
        const d = new Date(b.createdAt || b.startDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (revenueByMonth[key] !== undefined) {
          revenueByMonth[key] += b.totalPrice;
        }
      }
    });

    return months.map(m => ({ ...m, Doanh_Thu: revenueByMonth[m.key] }));
  }, [myBookings]);

  // Real Asset Performance
  const assetPerformanceData = useMemo(() => {
    const counts = {};
    myBookings.forEach(b => {
      if (['approved', 'paid', 'returned'].includes(b.status)) {
        counts[b.assetId] = (counts[b.assetId] || 0) + 1;
      }
    });
    
    return myAssets
      .map(a => ({
        name: a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title,
        Luot_Thue: counts[a.id] || 0
      }))
      .sort((a, b) => b.Luot_Thue - a.Luot_Thue)
      .slice(0, 5);
  }, [myAssets, myBookings]);

  // --- Shared Styles ---
  const glassCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--color-border)',
    boxShadow: 'none' // User requested no shadow
  };

  // --- Subcomponents for Tabs ---

  const renderOverview = () => (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Tổng quan hoạt động</h2>
      
      {/* Metric Cards */}
      <div className="overview-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ ...glassCardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Doanh Thu (Net)</span>
            <DollarSign size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>{formatPrice(netRevenue)} đ</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>+12% so với tháng trước</div>
        </div>

        <div style={{ ...glassCardStyle, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Lượt Cho Thuê</span>
            <TrendingUp size={20} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>{myBookings.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>{pendingRequestsCount} đơn chờ duyệt</div>
        </div>

        <div style={{ ...glassCardStyle, background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>Thiết Bị Đang Thuê</span>
            <Camera size={20} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>{activeAssetsCount}</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>{pausedAssetsCount} thiết bị tạm dừng</div>
        </div>
      </div>

      {/* Charts & Upcoming Bookings */}
      <div className="overview-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={glassCardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Tăng trưởng doanh thu</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {monthlyRevenueData.some(d => d.Doanh_Thu > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatPrice(value) + ' đ'} />
                  <Area type="monotone" dataKey="Doanh_Thu" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Chưa có giao dịch nào</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ ...glassCardStyle, flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Thiết bị được thuê nhiều</h3>
            <div style={{ height: '200px', width: '100%' }}>
              {assetPerformanceData.some(d => d.Luot_Thue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetPerformanceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="Luot_Thue" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Chưa có giao dịch nào</div>
              )}
            </div>
          </div>

          <div style={{ ...glassCardStyle, flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Đơn thuê mới / sắp tới</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myBookings.filter(b => b.status === 'pending' || (['approved', 'paid'].includes(b.status) && new Date(b.startDate) > new Date())).slice(0, 5).length > 0 ? (
                myBookings.filter(b => b.status === 'pending' || (['approved', 'paid'].includes(b.status) && new Date(b.startDate) > new Date())).slice(0, 5).map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-dark)' }}>{b.assetTitle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Khách: {b.renterName}</div>
                    </div>
                    <span className={`badge badge-${b.status === 'paid' ? 'approved' : b.status}`} style={{ fontSize: '10px' }}>
                      {b.status === 'pending' ? 'Chờ duyệt' : 'Sắp tới'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px 0' }}>Chưa có đơn thuê mới nào</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [editingAsset, setEditingAsset] = useState(null);
  const [assetFilterCategory, setAssetFilterCategory] = useState('all');
  const [assetSortBy, setAssetSortBy] = useState('newest');

  const filteredAndSortedAssets = useMemo(() => {
    let result = [...myAssets];
    if (assetFilterCategory !== 'all') {
      result = result.filter(a => a.category === assetFilterCategory);
    }
    
    switch (assetSortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'name_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        result.reverse();
        break;
    }
    return result;
  }, [myAssets, assetFilterCategory, assetSortBy]);

  const [orderFilterCategory, setOrderFilterCategory] = useState('all');
  const [orderSortBy, setOrderSortBy] = useState('newest');

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...myBookings];
    
    // Filter by Category
    if (orderFilterCategory !== 'all') {
      result = result.filter(b => {
        const asset = myAssets.find(a => a.id === b.assetId);
        return asset && asset.category === orderFilterCategory;
      });
    }

    // Sort
    switch (orderSortBy) {
      case 'price_asc':
        result.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'date_desc':
        result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return result;
  }, [myBookings, myAssets, orderFilterCategory, orderSortBy]);

  const renderListings = () => (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Quản lý Thiết Bị</h2>
        <button className="btn btn-primary" onClick={() => setActiveTab('add-new')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> Đăng Thiết Bị Mới
        </button>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select 
          className="form-control" 
          style={{ width: 'auto', minWidth: '150px' }}
          value={assetFilterCategory}
          onChange={(e) => setAssetFilterCategory(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          <option value="sony_cam">Máy ảnh Sony</option>
          <option value="canon_cam">Máy ảnh Canon</option>
          <option value="fuji_cam">Máy ảnh Fujifilm</option>
          <option value="nikon_cam">Máy ảnh Nikon</option>
          <option value="sony_lens">Ống kính Sony</option>
          <option value="canon_lens">Ống kính Canon</option>
        </select>

        <select 
          className="form-control" 
          style={{ width: 'auto', minWidth: '150px' }}
          value={assetSortBy}
          onChange={(e) => setAssetSortBy(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá: Thấp đến Cao</option>
          <option value="price_desc">Giá: Cao đến Thấp</option>
          <option value="name_asc">Tên: A-Z</option>
          <option value="name_desc">Tên: Z-A</option>
        </select>
      </div>

      <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {filteredAndSortedAssets.length === 0 ? (
          <div style={{ ...glassCardStyle, gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            <Camera size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Không có thiết bị nào phù hợp.</p>
          </div>
        ) : (
          filteredAndSortedAssets.map(asset => (
            <div key={asset.id} style={{ ...glassCardStyle, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img src={asset.imageUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className={`badge badge-${asset.status === 'paused' ? 'returned' : 'available'}`} style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {asset.status === 'paused' ? 'Tạm dừng' : 'Đang hoạt động'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>{asset.title}</h3>
                <div style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '16px' }}>
                  {formatPrice(asset.pricePerDay)} đ <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '400' }}>/ ngày</span>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => {
                      if (asset.status !== 'paused') {
                        const hasActive = bookings.some(b => b.assetId === asset.id && ['pending', 'approved', 'paid', 'renting'].includes(b.status));
                        if (hasActive) {
                          alert("Không thể tạm dừng vì thiết bị đang có đơn thuê chưa hoàn tất!");
                          return;
                        }
                      }
                      updateAssetStatus(asset.id, asset.status === 'paused' ? 'available' : 'paused');
                    }}
                  >
                    {asset.status === 'paused' ? <><Eye size={14} /> Kích hoạt</> : <><EyeOff size={14} /> Tạm dừng</>}
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => setEditingAsset(asset)}
                  >
                    <Edit3 size={14} /> Sửa
                  </button>
                  {asset.pricePerDay < 0 && (
                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      onClick={() => {
                        const hasActive = bookings.some(b => b.assetId === asset.id && ['pending', 'approved', 'paid', 'renting'].includes(b.status));
                        if (hasActive) {
                          alert("Không thể xóa thiết bị đang có đơn thuê chưa hoàn tất!");
                          return;
                        }
                        if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác!')) {
                          deleteAsset(asset.id);
                          alert('Xóa thiết bị thành công!');
                        }
                      }}
                      title="Xóa thiết bị (Chỉ dành cho sản phẩm test lỗi giá âm)"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingAsset && (
        <AssetEditModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={(updatedData) => {
            updateAssetDetails(editingAsset.id, updatedData);
            setEditingAsset(null);
            alert('Cập nhật thiết bị thành công!');
          }}
        />
      )}
    </div>
  );

  const renderOrders = () => {
    const rentingBookings = filteredAndSortedBookings.filter(b => (b.status === 'approved' || b.status === 'paid') && new Date(b.startDate) <= new Date());
    const upcomingBookings = filteredAndSortedBookings.filter(b => b.status === 'pending' || ((b.status === 'approved' || b.status === 'paid') && new Date(b.startDate) > new Date()));
    const completedBookings = filteredAndSortedBookings.filter(b => b.status === 'returned');
    const cancelledBookings = filteredAndSortedBookings.filter(b => ['rejected', 'cancelled'].includes(b.status));

    const renderIsland = (list, title, color) => (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(50vh - 120px)',
        overflowY: 'auto',
        paddingRight: '6px' // for scrollbar
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10, paddingBottom: '8px', borderBottom: `2px solid ${color}` }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: color, margin: 0, textTransform: 'uppercase' }}>{title}</h3>
          <span style={{ backgroundColor: color, color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>{list.length}</span>
        </div>
        {list.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Trống</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map(b => {
              const isNewPaid = b.status === 'paid' && !sessionViewedBookings.includes(b.id);
              const isRenting = new Date(b.startDate) <= new Date();
              return (
                <div key={b.id} 
                  title={`Thiết bị: ${b.assetTitle}\nKhách: ${b.renterName} (${b.renterContact})\nThời gian: ${new Date(b.startDate).toLocaleDateString('vi-VN')} đến ${new Date(b.endDate).toLocaleDateString('vi-VN')}\nTổng tiền: ${formatPrice(b.totalPrice)} đ\nMã đơn: #${String(b.id).includes('-') ? String(b.id).split('-')[1] : b.id}`}
                  style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px', 
                  backgroundColor: '#ffffff', 
                  gap: '8px', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  flexWrap: 'wrap',
                  cursor: 'default'
                }}>
                  {/* Left info area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto', minWidth: '0' }}>
                    {isNewPaid && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)', flexShrink: 0 }}></div>}
                    
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {b.assetTitle}
                    </div>
                    
                    <div style={{ color: 'var(--color-border)', fontSize: '12px' }}>|</div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                      {b.renterName}
                    </div>
                    
                    <div style={{ color: 'var(--color-border)', fontSize: '12px' }}>|</div>
                    
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(b.startDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})} - {new Date(b.endDate).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}
                    </div>
                  </div>

                  {/* Right action area */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', marginRight: '4px' }}>
                      {formatPrice(b.totalPrice)}đ
                    </div>

                    {b.status === 'pending' && (
                      <>
                        <button title="Duyệt đơn" className="btn btn-primary btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateBookingStatus(b.id, 'approved')}><Check size={14}/></button>
                        <button title="Hủy đơn" className="btn btn-outline btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => updateBookingStatus(b.id, 'rejected')}><X size={14}/></button>
                      </>
                    )}
                    {(b.status === 'approved' || b.status === 'paid') && (
                      <>
                        <button title="Hủy đơn" className="btn btn-outline btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={() => updateBookingStatus(b.id, 'rejected')}><X size={14}/></button>
                        {isRenting && (
                          <button title="Kết thúc đơn" className="btn btn-primary btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateBookingStatus(b.id, 'returned')}><CheckCircle2 size={14}/></button>
                        )}
                      </>
                    )}
                    
                    {b.contractUrl ? (
                       <button title="Xem Hợp Đồng" className="btn btn-outline btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => handleViewContract(b.contractUrl)}><FileText size={14}/></button>
                    ) : (
                       <button title="Không có hợp đồng đính kèm" className="btn btn-outline btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', cursor: 'not-allowed', opacity: 0.5 }} disabled><FileText size={14}/></button>
                    )}

                    <button title="Nhắn tin cho khách" className="btn btn-outline btn-sm" style={{ padding: '0', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                        setChatSelectedAssetId(b.renterId);
                        setActiveTab('chat');
                      }}><MessageSquare size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );

    return (
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Quản lý Đơn Hàng</h2>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={orderFilterCategory}
            onChange={(e) => setOrderFilterCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="sony_cam">Máy ảnh Sony</option>
            <option value="canon_cam">Máy ảnh Canon</option>
            <option value="fuji_cam">Máy ảnh Fujifilm</option>
            <option value="nikon_cam">Máy ảnh Nikon</option>
            <option value="sony_lens">Ống kính Sony</option>
            <option value="canon_lens">Ống kính Canon</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={orderSortBy}
            onChange={(e) => setOrderSortBy(e.target.value)}
          >
            <option value="newest">Đơn mới nhất</option>
            <option value="price_asc">Tổng tiền: Thấp đến Cao</option>
            <option value="price_desc">Tổng tiền: Cao đến Thấp</option>
            <option value="date_asc">Ngày bắt đầu thuê: Tăng dần</option>
            <option value="date_desc">Ngày bắt đầu thuê: Giảm dần</option>
          </select>
        </div>

        <div className="orders-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          {renderIsland(rentingBookings, "Đang thuê", "#3b82f6")}
          {renderIsland(upcomingBookings, "Sắp tới", "#eab308")}
          {renderIsland(completedBookings, "Hoàn thành", "#22c55e")}
          {renderIsland(cancelledBookings, "Đã hủy", "#ef4444")}
        </div>

      </div>
    );
  };

  const renderWallet = () => (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Ví & Dòng Tiền</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ ...glassCardStyle, backgroundColor: 'var(--color-dark)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
              <Wallet size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Số Dư Khả Dụng (Net)</div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>{formatPrice(netRevenue)} đ</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: '#fff', color: 'var(--color-dark)' }}>Yêu Cầu Rút Tiền</button>
        </div>

        <div style={glassCardStyle}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Cơ cấu dòng tiền</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tổng Khách Hàng Đã Trả (Gross)</span>
              <span style={{ fontWeight: '600', fontSize: '16px' }}>{formatPrice(totalGrossRevenue)} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--color-border)' }}>
              <span style={{ color: 'var(--color-error)' }}>Chiết Khấu Nền Tảng (10%)</span>
              <span style={{ fontWeight: '600', color: 'var(--color-error)' }}>- {formatPrice(platformFee)} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Thực Nhận Của Partner (Net)</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--color-primary)' }}>{formatPrice(netRevenue)} đ</span>
            </div>
          </div>
        </div>
      </div>

      <div style={glassCardStyle}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '24px' }}>Luồng Tiền Tệ (Cashflow Process)</h3>
        
        {/* Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', paddingBottom: '20px' }}>
          <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '4px', backgroundColor: 'var(--color-border)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '20px', left: '0', width: '66%', height: '4px', backgroundColor: 'var(--color-primary)', zIndex: 1 }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, backgroundColor: '#fff', padding: '0 10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <CreditCard size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Khách Thanh Toán</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Nền tảng giữ 100%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, backgroundColor: '#fff', padding: '0 10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <ShoppingCart size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Thuê Máy Hoàn Tất</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Khách trả lại thiết bị</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, backgroundColor: '#fff', padding: '0 10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <ArrowRight size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>Chuyển Tiền</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Trừ 10% phí</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, backgroundColor: '#fff', padding: '0 10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Wallet size={20} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-muted)' }}>Vào Ví Partner</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Sẵn sàng rút</span>
          </div>
        </div>
      </div>
      <div style={{ ...glassCardStyle, marginTop: '24px', padding: '0', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '24px', marginBottom: '16px' }}>Dòng tiền theo giao dịch</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Mã Đơn</th>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Sản phẩm</th>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng thu (Gross)</th>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Phí Nền Tảng (10%)</th>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Thực nhận (Net)</th>
                <th style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Trạng thái tiền</th>
              </tr>
            </thead>
            <tbody>
              {myBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có giao dịch nào phát sinh.</td>
                </tr>
              ) : (
                myBookings.map(b => {
                  const gross = b.totalPrice || 0;
                  const fee = gross * PLATFORM_FEE_PERCENTAGE;
                  const net = gross - fee;
                  
                  let cashStatus = '';
                  let cashStatusColor = '';
                  
                  if (b.status === 'pending') {
                    cashStatus = 'Chưa thanh toán';
                    cashStatusColor = 'var(--color-text-muted)';
                  } else if (b.status === 'approved' || b.status === 'paid') {
                    cashStatus = 'Nền tảng đang giữ';
                    cashStatusColor = 'var(--color-warning)';
                  } else if (b.status === 'returned') {
                    cashStatus = 'Đã cộng vào ví';
                    cashStatusColor = 'var(--color-success)';
                  } else if (b.status === 'rejected') {
                    cashStatus = 'Đã hoàn tiền';
                    cashStatusColor = 'var(--color-error)';
                  }

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>#{b.id.split('-')[1]}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{b.assetTitle}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{formatPrice(gross)} đ</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--color-error)' }}>- {formatPrice(fee)} đ</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)' }}>{formatPrice(net)} đ</td>
                      <td style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: cashStatusColor }}>
                        {cashStatus}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Add New Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('sony_cam');
  const [newLocation, setNewLocation] = useState('TP. Hồ Chí Minh');
  const [newPricePerDay, setNewPricePerDay] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSpecsText, setNewSpecsText] = useState('');
  const [newSpecificPolicy, setNewSpecificPolicy] = useState('');
  const [newImageSelect, setNewImageSelect] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newMount, setNewMount] = useState('');
  const [newCameraType, setNewCameraType] = useState('');
  const [newSensorType, setNewSensorType] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, ...).');
      return;
    }

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
        setNewImageSelect(fullUrl);
      } else {
        alert('Upload thất bại: ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Lỗi upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNewSubmit = (e) => {
    e.preventDefault();
    if (parseInt(newPricePerDay) < 0) {
      alert('Giá thuê không được là số âm.');
      return;
    }
    const specsArray = newSpecsText.split(',').map(s => s.trim()).filter(s => s !== '');
    addAsset({
      title: newTitle,
      category: newCategory,
      location: newLocation,
      pricePerDay: parseInt(newPricePerDay),
      imageUrl: newImageSelect,
      description: newDescription,
      specs: specsArray.length > 0 ? specsArray : ['Hoạt động hoàn hảo'],
      mount: newMount,
      cameraType: newCameraType,
      sensorType: newSensorType,
      ownerId: user?.id || 'demo-user-id',
      ownerName: user?.name || 'Nguyễn Minh Quân',
      specificPolicy: newSpecificPolicy
    });
    alert('Đăng thiết bị thành công!');
    setNewTitle(''); setNewPricePerDay(''); setNewDescription(''); setNewSpecsText('');
    setNewSpecificPolicy('');
    setNewMount('');
    setNewCameraType(''); setNewSensorType('');
    setActiveTab('listings');
  };

  const renderAddNew = () => (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Đăng Thiết Bị Mới</h2>
      <div style={glassCardStyle}>
        <form onSubmit={handleAddNewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Tên thiết bị</label>
            <input type="text" className="form-control" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
          </div>
          
          <div className="grid-2">
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                <option value="sony_cam">Máy ảnh Sony</option>
                <option value="canon_cam">Máy ảnh Canon</option>
                <option value="fuji_cam">Máy ảnh Fujifilm</option>
                <option value="nikon_cam">Máy ảnh Nikon</option>
                <option value="sony_lens">Ống kính Sony</option>
                <option value="canon_lens">Ống kính Canon</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hình ảnh thiết bị {isUploading && <span style={{fontSize:'12px', color:'var(--color-primary)', marginLeft:'8px'}}>(Đang tải lên...)</span>}</label>
              <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} disabled={isUploading} />
              {newImageSelect && (
                <div style={{marginTop: '10px', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)'}}>
                  <img src={newImageSelect} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Ngàm máy ảnh</label>
              <input type="text" className="form-control" value={newMount} onChange={e => setNewMount(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Loại máy ảnh</label>
              <select className="form-control" value={newCameraType} onChange={e => setNewCameraType(e.target.value)}>
                <option value="">Chọn loại</option>
                <option value="Mirrorless">Mirrorless</option>
                <option value="DSLR">DSLR</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Loại cảm biến</label>
              <select className="form-control" value={newSensorType} onChange={e => setNewSensorType(e.target.value)}>
                <option value="">Chọn cảm biến</option>
                <option value="Full-frame">Full-frame</option>
                <option value="APS-C (Crop)">APS-C (Crop)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Giá Thuê / Ngày</label>
              <input type="number" min="0" onWheel={(e) => e.target.blur()} className="form-control" value={newPricePerDay} onChange={e => setNewPricePerDay(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Thông số kỹ thuật chung</label>
            <input type="text" className="form-control" value={newSpecsText} onChange={e => setNewSpecsText(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea className="form-control" style={{ minHeight: '100px' }} value={newDescription} onChange={e => setNewDescription(e.target.value)} required></textarea>
          </div>

          <div className="form-group">
            <label>Chính sách & Quyền lợi riêng (Tuỳ chọn)</label>
            <textarea className="form-control" style={{ minHeight: '80px' }} value={newSpecificPolicy} onChange={e => setNewSpecificPolicy(e.target.value)} placeholder="Ví dụ: Tặng kèm thẻ nhớ 64GB, giảm 5% cho sinh viên..."></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', minWidth: '150px' }}>Đăng Tải</button>
        </form>
      </div>
    </div>
  );

  const renderChat = () => {
    console.log('[DEBUG_RENDER_CHAT] messages.length:', messages.length, 'myAssetIds:', myAssetIds, 'user.id:', user?.id);
    
    const chatThreads = [];
    const seenCustomers = new Set();
    
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      
      // Ensure message belongs to one of my assets
      if (myAssetIds.includes(msg.assetId) && !seenCustomers.has(msg.customerId)) {
        seenCustomers.add(msg.customerId);
        
        const asset = myAssets.find(a => a.id === msg.assetId);
        chatThreads.push({
          threadId: msg.customerId, // Group strictly by customerId
          assetId: msg.assetId, // Keep latest asset for context
          assetTitle: msg.assetTitle,
          assetImage: asset?.imageUrl || '/camera.png',
          lastMessage: msg.text,
          timestamp: msg.timestamp,
          customerId: msg.customerId,
          renterName: messages.find(m => m.customerId === msg.customerId && m.senderName !== (user?.name || 'Partner'))?.senderName || 'Khách hàng'
        });
      }
    }

    let selectedThread = chatThreads.find(t => t.threadId === chatSelectedAssetId);
    if (!selectedThread && chatSelectedAssetId) {
      // Fallback for new unlisted threads
      const msg = messages.find(m => m.customerId === chatSelectedAssetId && myAssetIds.includes(m.assetId));
      if (msg) {
        const asset = myAssets.find(a => a.id === msg.assetId);
        selectedThread = {
          threadId: chatSelectedAssetId,
          assetId: asset.id,
          assetTitle: asset.title,
          assetImage: asset.imageUrl || '/camera.png',
          lastMessage: '',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          renterName: 'Khách hàng',
          customerId: chatSelectedAssetId
        };
        chatThreads.unshift(selectedThread);
      }
    }
    
    const handleTyping = (e) => {
      setChatReplyText(e.target.value);
      const threadId = `${user?.id}_${chatSelectedAssetId}`;
      sendTypingEvent(threadId, true, 'partner');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingEvent(threadId, false, 'partner');
      }, 2000);
    };

    const handleSendReply = (e) => {
      e.preventDefault();
      if (!chatReplyText.trim() || !chatSelectedAssetId) return;
      
      let finalMessage = chatReplyText.trim();
        addMessage(
          selectedThread.assetId,
          selectedThread.assetTitle,
          user?.studio_name || user?.name || 'Partner',
          finalMessage,
          user?.id,
          selectedThread.customerId,
          selectedThread.customerId
        );
      setChatReplyText('');
    };

    return (
      <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Tin Nhắn & Hỗ Trợ</h2>
        
        <div style={{ ...glassCardStyle, padding: 0, display: 'grid', gridTemplateColumns: '280px 1fr', flexGrow: 1, overflow: 'hidden' }} className="chat-layout">
          
          <aside style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
                Danh Sách Khách Hàng
              </h3>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
              {chatThreads.length > 0 ? (
                chatThreads.map((thread) => {
                  const unseenCount = messages.filter(m => m.customerId === thread.threadId && m.receiverId === user?.id && m.status === 'sent').length;
                  return (
                  <div 
                    key={thread.threadId}
                    onClick={() => setChatSelectedAssetId(thread.threadId)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      backgroundColor: chatSelectedAssetId === thread.threadId ? 'var(--color-primary-light)' : 'transparent',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={thread.assetImage} 
                      alt={thread.assetTitle} 
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '13px', margin: 0, fontWeight: '700', color: 'var(--color-dark)' }} className="truncate">{thread.renterName}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{thread.timestamp}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '12px', color: unseenCount > 0 ? 'var(--color-dark)' : 'var(--color-text-main)', fontStyle: unseenCount > 0 ? 'normal' : 'italic', fontWeight: unseenCount > 0 ? '600' : 'normal', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{thread.lastMessage}"
                        </p>
                        {unseenCount > 0 && (
                          <span style={{ backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                            {unseenCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )})
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có tin nhắn nào.</div>
              )}
            </div>
          </aside>

          <section className="chat-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
            {chatSelectedAssetId && selectedThread ? (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    className="mobile-back-btn" 
                    onClick={() => setChatSelectedAssetId(null)} 
                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-dark)' }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <img src={selectedThread.assetImage} alt="asset" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{selectedThread.renterName}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Quan tâm: <strong>{selectedThread.assetTitle}</strong></p>
                  </div>
                </div>

                <div ref={chatContainerRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                  {threadMessages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    const prevMsg = threadMessages[idx - 1];
                    const topicChanged = !prevMsg || prevMsg.assetId !== msg.assetId;
                    const msgAsset = myAssets.find(a => a.id === msg.assetId);

                    return (
                      <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{msg.senderName} • {msg.timestamp}</div>
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          backgroundColor: isMe ? 'var(--color-primary)' : '#ffffff',
                          color: isMe ? '#ffffff' : 'var(--color-text-main)',
                          fontSize: '14px',
                          border: isMe ? 'none' : '1px solid var(--color-border)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {topicChanged && msgAsset && (
                            <div style={{
                              backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                              borderRadius: '8px',
                              padding: '6px',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--color-border)'
                            }}>
                              <img src={msgAsset.imageUrl} alt="asset" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}/>
                              <div style={{ fontSize: '11px', fontWeight: '600' }} className="truncate">{msgAsset.title}</div>
                            </div>
                          )}
                          {msg.text}
                        </div>
                        {isMe && (
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {msg.status === 'seen' ? <><CheckCheck size={12} style={{ color: 'var(--color-primary)' }}/> Đã xem</> : <><Check size={12} /> Đã gửi</>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {typingStatus[`${user?.id}_${chatSelectedAssetId}`]?.customer && (
                  <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                    {typingStatus[`${user?.id}_${chatSelectedAssetId}`].customer} đang soạn tin...
                  </div>
                )}

                <form onSubmit={handleSendReply} style={{ padding: '16px 20px', backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', flexShrink: 0 }}>
                  <textarea 
                    className="form-control hide-scrollbar"
                    placeholder="Nhập tin nhắn..."
                    value={chatReplyText}
                    onChange={(e) => {
                      handleTyping(e);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (chatReplyText.trim()) handleSendReply(e);
                        // Reset height
                        e.target.style.height = 'auto';
                      }
                    }}
                    style={{ 
                      flexGrow: 1, 
                      borderRadius: '20px', 
                      minHeight: '40px',
                      maxHeight: '120px',
                      padding: '10px 16px',
                      resize: 'none',
                      fontFamily: 'inherit',
                      lineHeight: '1.4',
                      overflowY: 'auto'
                    }}
                    rows={1}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={48} style={{ strokeWidth: '1', marginBottom: '16px' }} />
                <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar */}
      <aside className={`sidebar-container ${!isSidebarOpen ? 'sidebar-closed' : ''}`} style={{ 
        width: isSidebarOpen ? '260px' : '80px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid var(--color-border)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 50
      }}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: 'absolute',
            right: '-14px',
            top: '24px',
            width: '28px',
            height: '28px',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: 'var(--color-text-main)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div style={{ padding: '32px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <img src={user?.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          {isSidebarOpen && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Partner</div>
            </div>
          )}
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Tổng Quan' },
            { id: 'listings', icon: Package, label: 'Thiết Bị Của Tôi' },
            { id: 'orders', icon: ShoppingCart, label: 'Đơn Hàng' },
            { id: 'chat', icon: MessageSquare, label: 'Tin Nhắn' },
            { id: 'wallet', icon: Wallet, label: 'Ví & Dòng Tiền' },
            { id: 'contract', icon: FileText, label: 'Mẫu Hợp Đồng' }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: isActive ? '600' : '500',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                }}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, padding: '32px', overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'listings' && renderListings()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'wallet' && renderWallet()}
        {activeTab === 'contract' && <ContractSettings />}
        {activeTab === 'add-new' && renderAddNew()}
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .listings-grid, .orders-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        @media (max-width: 1024px) {
          .main-content {
            padding: 12px !important;
          }
          .chat-layout {
            grid-template-columns: 1fr !important;
            height: calc(100vh - 120px) !important;
            border: none !important;
          }
          .chat-layout aside {
            max-height: none !important;
            display: ${chatSelectedAssetId ? 'none' : 'block'} !important;
          }
          .chat-section {
            display: ${!chatSelectedAssetId ? 'none' : 'flex'} !important;
          }
          .sidebar-container {
            position: absolute !important;
            height: 100%;
          }
          .sidebar-closed {
            transform: translateX(-100%);
            width: 0 !important;
            border: none !important;
            overflow: hidden !important;
          }
          .overview-metric-grid, .overview-charts-grid, .orders-grid {
            grid-template-columns: 1fr !important;
          }
          .listings-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-menu-btn, .mobile-back-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Mobile Menu Button */}
      {!isSidebarOpen && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 15px rgba(255, 120, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            cursor: 'pointer'
          }}
        >
          <Menu size={28} />
        </button>
      )}
    </div>
  );
}
