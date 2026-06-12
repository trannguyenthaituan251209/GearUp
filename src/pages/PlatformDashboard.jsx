import React, { useState, useContext, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { StoreContext } from '../context/StoreContext';
import { formatPrice } from '../components/AssetCard';
import { supabase } from '../supabaseClient';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  LogOut, 
  Users, 
  Camera, 
  DollarSign, 
  Check, 
  X, 
  ChevronRight, 
  Calendar, 
  FileText, 
  Briefcase,
  Edit3,
  Trash2,
  Plus,
  Image,
  MessageCircle
} from 'lucide-react';

export default function PlatformDashboard() {
  const { 
    user, 
    loginUser, 
    logoutUser,
    approvePartner,
    rejectPartner,
    assets,
    bookings,
    blogs,
    addBlog,
    updateBlog,
    deleteBlog,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    messages,
    addMessage
  } = useContext(StoreContext);

  const [selectedCskhUserId, setSelectedCskhUserId] = useState(null);
  const [cskhReplyText, setCskhReplyText] = useState('');

  // Auth local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Tabs: 'approvals' | 'assets' | 'users' | 'financials' | 'blogs'
  const [activeTab, setActiveTab] = useState('approvals');
  const [cskhTab, setCskhTab] = useState('unassigned'); // 'unassigned' or 'mine'
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Blog Management States
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', imageUrl: '', content: '', category: 'news' });

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (editingBlogId) {
      await updateBlog(editingBlogId, blogForm);
      alert('Đã cập nhật bài viết thành công!');
    } else {
      await addBlog(blogForm);
      alert('Đã tạo bài viết mới!');
    }
    setShowBlogForm(false);
    setBlogForm({ title: '', slug: '', imageUrl: '', content: '', category: 'news' });
    setEditingBlogId(null);
  };

  // Banner Management States
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', imageUrl2: '', imageUrl3: '', linkUrl: '', position: 'sidebar_1', isActive: true, effect: 'none', effectDuration: 3 });

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (editingBannerId) {
      await updateBanner({ id: editingBannerId, ...bannerForm });
      alert('Đã cập nhật banner thành công!');
    } else {
      await addBanner(bannerForm);
      alert('Đã tạo banner mới!');
    }
    setShowBannerForm(false);
    setBannerForm({ title: '', imageUrl: '', imageUrl2: '', imageUrl3: '', linkUrl: '', position: 'sidebar_1', isActive: true, effect: 'none', effectDuration: 3 });
    setEditingBannerId(null);
  };

  const handleEditBanner = (banner) => {
    let position = banner.position;
    // Migrate old positions if editing
    if (position === 'home_vertical_1' || position === 'blog_sidebar_1') position = 'sidebar_1';
    if (position === 'home_vertical_2' || position === 'blog_sidebar_2') position = 'sidebar_2';
    if (position === 'home_horizontal') position = 'horizontal';

    setBannerForm({
      title: banner.title,
      imageUrl: banner.imageUrl || '',
      imageUrl2: banner.imageUrl2 || '',
      imageUrl3: banner.imageUrl3 || '',
      linkUrl: banner.linkUrl || '',
      position: position || 'sidebar_1',
      isActive: banner.isActive,
      effect: banner.effect || 'none',
      effectDuration: banner.effectDuration || 3
    });
    setEditingBannerId(banner.id);
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này không?')) {
      await deleteBanner(bannerId);
    }
  };

  const handleEditBlog = (blog) => {
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      imageUrl: blog.imageUrl || '',
      content: blog.content,
      category: blog.category || 'news'
    });
    setEditingBlogId(blog.id);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      await deleteBlog(blogId);
    }
  };

  // Trigger state refresh for users database
  const [usersList, setUsersList] = useState([]);
  
  const fetchUsers = async () => {
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const { data: dbProfiles, error: dbError } = await supabase.from('profiles').select('*');
        if (!dbError && dbProfiles) {
          const mappedDB = dbProfiles.map(p => {
            // Generate a readable email for display based on name or studio
            let cleanName = p.name ? p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
            let cleanStudio = p.studio_name ? p.studio_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            let displayEmail = cleanStudio ? `${cleanStudio}@gearup.vn` : `${cleanName}@gmail.com`;
            if (p.id === 'user-admin') displayEmail = 'admin@gearup.vn';
            
            return {
              id: p.id,
              name: p.name || 'Người dùng Supabase',
              email: displayEmail,
              avatar: p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              isPartner: p.is_partner || false,
              partnerStatus: (p.partner_status && p.partner_status !== 'NULL' && p.partner_status !== 'null') 
                              ? p.partner_status 
                              : (p.is_partner ? 'approved' : (p.phone && p.citizen_id ? 'pending' : null)),
              phone: p.phone || '',
              citizenId: p.citizen_id || '',
              studioName: p.studio_name || '',
              isStaff: p.id === 'user-admin' || displayEmail.endsWith('@gearup.vn')
            };
          });
          setUsersList(mappedDB);
          return;
        }
      } catch (err) {
        console.warn('[Platform SSO] Failed to fetch real database profiles:', err);
      }
    }
    setUsersList([]);
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const { data, error } = await loginUser(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Thông tin đăng nhập không hợp lệ.');
    } else {
      // Check if logged in user is actually staff
      const isUserStaff = email.toLowerCase().endsWith('@gearup.vn') || 
                          data?.user?.email?.toLowerCase().endsWith('@gearup.vn') ||
                          data?.user?.user_metadata?.isStaff;

      if (!isUserStaff) {
        setErrorMsg('Truy cập bị từ chối! Tài khoản này không thuộc Ban nhân sự GearUp.');
        logoutUser();
      } else {
        fetchUsers();
      }
    }
  };

  const handleApproveStore = async (userId) => {
    const result = await approvePartner(userId);
    if (result && result.error) {
      alert('Lỗi phê duyệt (có thể do phân quyền Supabase RLS): ' + result.error.message);
    } else {
      alert('Đã phê duyệt hồ sơ đối tác! Cửa hàng đã được kích hoạt hoạt động.');
    }
    fetchUsers();
  };

  const handleRejectStore = async (userId) => {
    const result = await rejectPartner(userId);
    if (result && result.error) {
      alert('Lỗi từ chối (có thể do phân quyền Supabase RLS): ' + result.error.message);
    } else {
      alert('Đã từ chối hồ sơ đối tác.');
    }
    fetchUsers();
  };

  // Calculations for Financials
  // Total transaction volume across the network
  const totalNetworkVolume = bookings
    .filter(b => ['approved', 'returned'].includes(b.status))
    .reduce((sum, curr) => sum + curr.totalPrice, 0);
  
  // Platform Commission (10% fee on all completed rentals)
  const platformCommission = totalNetworkVolume * 0.10;

  // Filter pending, approved, and rejected partner applications
  const pendingStores = usersList.filter(u => u.partnerStatus === 'pending');
  const approvedStores = usersList.filter(u => u.partnerStatus === 'approved');
  const rejectedStores = usersList.filter(u => u.partnerStatus === 'rejected');

  // ----------------------------------------------------
  // SSO SIGN-IN VIEW
  // ----------------------------------------------------
  if (!user || !user.isStaff) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'var(--font-secondary)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid #334155',
          borderRadius: '16px',
          padding: '40px 36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}>
          {/* Brand logos */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '36px', filter: 'brightness(0) invert(1)' }} />
              <div style={{ width: '1.5px', height: '24px', backgroundColor: '#475569' }} />
              <span style={{
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Platform SSO
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              GEARUP STAFF LOG IN
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Authorized Personnel Only
            </p>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontSize: '13px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '8px' }}>
                <Mail size={14} style={{ color: '#94a3b8' }} />
                <span>SSO Email nhân sự</span>
              </label>
              <input 
                type="email"
                style={{
                  width: '100%',
                  height: '50px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="email@gearup.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '8px' }}>
                <Lock size={14} style={{ color: '#94a3b8' }} />
                <span>Mật khẩu SSO</span>
              </label>
              <input 
                type="password"
                style={{
                  width: '100%',
                  height: '50px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                height: '50px',
                backgroundColor: '#0066ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '10px',
                boxShadow: '0 4px 14px rgba(0, 102, 255, 0.4)',
                transition: 'background-color 0.2s'
              }}
              disabled={loading}
            >
              {loading ? 'Đang xác thực bảo mật...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#64748b' }}>
            Hệ thống đăng nhập bảo mật SSO được giám sát bởi Ban Công Nghệ GearUp.
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // PLATFORM DASHBOARD SUITE (STAFF PORTAL)
  // ----------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'var(--font-secondary)',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Admin Corporate Header */}
      <header style={{
        backgroundColor: '#0f172a',
        borderBottom: '2.5px solid #0284c7',
        color: '#ffffff',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/main_logo.png" alt="GearUp Logo" style={{ height: '34px', filter: 'brightness(0) invert(1)' }} />
            <div style={{ width: '1.5px', height: '22px', backgroundColor: '#334155' }} />
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Platform Administrator
            </span>
            <span style={{
              backgroundColor: 'rgba(14, 116, 144, 0.3)',
              color: '#22d3ee',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(34, 211, 238, 0.2)'
            }}>
              SSO ACTIVE
            </span>
          </div>

          {/* User Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7' }}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                  Nhân sự quản trị hệ thống
                </span>
              </div>
            </div>

            <button 
              onClick={logoutUser}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            >
              <LogOut size={14} />
              <span>Đăng xuất SSO</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="container sso-main-container" style={{ flex: 1, padding: '40px 0 60px 0', display: 'flex', gap: '32px' }}>
        
        {/* Sidebar */}
        <aside className="sso-sidebar" style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ marginBottom: '35px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              Bảng Quản Trị Hệ Thống
            </h1>
            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '13px' }}>
              Giám sát, quản lý hệ thống GearUp.
            </p>
          </div>

          <div className="sso-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('approvals')}
              style={{
                background: activeTab === 'approvals' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'approvals' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={18} />
              <span style={{ flex: 1 }}>Phê Duyệt Đối Tác</span>
              {pendingStores.length > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>{pendingStores.length}</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('assets')}
              style={{
                background: activeTab === 'assets' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'assets' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <Camera size={18} />
              <span style={{ flex: 1 }}>Danh Sách Thiết Bị</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>{assets.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('users')}
              style={{
                background: activeTab === 'users' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'users' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <Users size={18} />
              <span style={{ flex: 1 }}>Danh Sách Người Dùng</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>{usersList.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('financials')}
              style={{
                background: activeTab === 'financials' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'financials' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <DollarSign size={18} />
              <span style={{ flex: 1 }}>Hoa Hồng Nền Tảng</span>
            </button>

            <button 
              onClick={() => setActiveTab('blogs')}
              style={{
                background: activeTab === 'blogs' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'blogs' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <FileText size={18} />
              <span style={{ flex: 1 }}>Quản Lý Bài Viết</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>{blogs?.length || 0}</span>
            </button>

            <button 
              onClick={() => setActiveTab('banners')}
              style={{
                background: activeTab === 'banners' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'banners' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <Image size={18} />
              <span style={{ flex: 1 }}>Quản Lý Banner</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>{banners?.length || 0}</span>
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              style={{
                background: activeTab === 'support' ? '#eff6ff' : 'transparent',
                border: 'none', padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                color: activeTab === 'support' ? '#0066ff' : '#475569',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
            >
              <MessageCircle size={18} />
              <span style={{ flex: 1 }}>Hỗ trợ KH</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '12px' }}>
                {messages?.filter(m => m.assetId?.startsWith('cskh-')).length > 0 ? 'Mới' : ''}
              </span>
            </button>
          </div>
        </aside>

        {/* Tab Contents */}
        <main style={{ flex: 1, minWidth: 0 }}>
          
          {/* TAB 1: PARTNER APPROVALS */}
          {activeTab === 'approvals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Pending Approvals Section */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                  <ShieldCheck size={18} style={{ color: '#eab308' }} />
                  Danh Sách Yêu Cầu Chờ Xét Duyệt ({pendingStores.length})
                </h3>

                {pendingStores.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Thành viên</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Tên Cửa hàng / Studio</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Số CCCD</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Số điện thoại</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b', textAlign: 'center' }}>Thao tác phê duyệt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingStores.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={item.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <span style={{ fontWeight: '700', fontSize: '14px', display: 'block' }}>{item.name}</span>
                                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{item.email}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px', color: '#ff7800' }}>
                              {item.studioName}
                            </td>
                            <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'monospace' }}>
                              {item.citizenId}
                            </td>
                            <td style={{ padding: '16px', fontSize: '13px' }}>
                              {item.phone}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleApproveStore(item.id)}
                                  style={{
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Check size={12} />
                                  <span>Phê duyệt</span>
                                </button>
                                
                                <button 
                                  onClick={() => handleRejectStore(item.id)}
                                  style={{
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: '1px solid #ef4444',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <X size={12} />
                                  <span>Từ chối</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '30px' }}>
                    Hiện không có yêu cầu phê duyệt cửa hàng nào đang chờ.
                  </p>
                )}
              </div>

              {/* History Section */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: '#0f172a' }}>
                  Lịch Sử Xét Duyệt Gần Đây ({approvedStores.length + rejectedStores.length})
                </h3>

                {(approvedStores.length > 0 || rejectedStores.length > 0) ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Thành viên</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Kênh đăng ký</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Số điện thoại</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Trạng thái duyệt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...approvedStores, ...rejectedStores].map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={item.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.name}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                              {item.studioName}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                              {item.phone}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor: item.partnerStatus === 'approved' ? '#ecfdf5' : '#fef2f2',
                                color: item.partnerStatus === 'approved' ? '#059669' : '#dc2626'
                              }}>
                                {item.partnerStatus === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    Chưa có hồ sơ xét duyệt nào trước đây.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ASSET MANAGEMENT */}
          {activeTab === 'assets' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
                Danh Sách Toàn Bộ Thiết Bị Trên Nền Tảng ({assets.length})
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Thiết bị</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Chủ sở hữu (Đối tác)</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Khu vực</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Đơn giá thuê / Ngày</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={asset.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{asset.title}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{asset.ownerName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {asset.ownerId}</div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          {asset.location}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '800', color: '#0066ff', fontSize: '14px' }}>
                          {formatPrice(asset.pricePerDay)} đ
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: asset.status === 'available' ? '#ecfdf5' : '#f1f5f9',
                            color: asset.status === 'available' ? '#059669' : '#64748b',
                            textTransform: 'uppercase'
                          }}>
                            {asset.status === 'available' ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
                Danh Sách Thành Viên Hệ Thống ({usersList.length})
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Thành viên</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Thông tin liên hệ</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Vai trò</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Số CCCD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={item.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                          <div>{item.email}</div>
                          <div style={{ color: '#64748b' }}>{item.phone || 'Chưa cung cấp'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {item.isStaff ? (
                            <span style={{
                              display: 'inline-flex', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                              backgroundColor: '#ecfeff', color: '#0891b2', border: '1px solid rgba(8, 145, 178, 0.2)', textTransform: 'uppercase'
                            }}>
                              Nhân sự GearUp
                            </span>
                          ) : item.isPartner ? (
                            <span style={{
                              display: 'inline-flex', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                              backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid rgba(194, 65, 12, 0.2)', textTransform: 'uppercase'
                            }}>
                              Đối tác cho thuê
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                              backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.2)', textTransform: 'uppercase'
                            }}>
                              Khách hàng (Client)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#64748b' }}>
                          {item.citizenId || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PLATFORM COMMISSION & FINANCIALS */}
          {activeTab === 'financials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Financial KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Network rental volume */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  borderLeft: '5px solid #0066ff'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tổng sản lượng giao dịch mạng lưới
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                    {formatPrice(totalNetworkVolume)} đ
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Tổng doanh thu thuê từ các giao dịch được phê duyệt
                  </p>
                </div>

                {/* Platform commission fee (10%) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  borderLeft: '5px solid #ff7800'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#ff7800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Hoa hồng GearUp thu (10% fee)
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ff7800', marginTop: '10px' }}>
                    {formatPrice(platformCommission)} đ
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Nguồn thu trực tiếp để vận hành & bảo hiểm thiết bị nền tảng
                  </p>
                </div>

                {/* Active Providers */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  borderLeft: '5px solid #10b981'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Cửa hàng / Đối tác hoạt động
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                    {usersList.filter(u => u.isPartner).length}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    {pendingStores.length} đơn đăng ký đang chờ phê duyệt
                  </p>
                </div>
              </div>

              {/* Monthly Commission Growth Panel */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '24px' }}>
                  Biểu Đồ Tăng Trưởng Thu Nhập Hoa Hồng Nền Tảng (đ)
                </h3>

                {/* Simulated Chart */}
                <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '30px', borderBottom: '2.5px solid #cbd5e1', paddingBottom: '10px' }}>
                  {[
                    { month: 'T12/2025', val: 320000 },
                    { month: 'T01/2026', val: 450000 },
                    { month: 'T02/2026', val: 510000 },
                    { month: 'T03/2026', val: 420000 },
                    { month: 'T04/2026', val: 680000 },
                    { month: 'Tháng hiện tại (10%)', val: platformCommission || 750000 }
                  ].map((item, idx, arr) => {
                    const maxVal = Math.max(...arr.map(a => a.val));
                    const barHeight = maxVal > 0 ? (item.val / maxVal) * 110 : 0;
                    return (
                      <div key={idx} style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#ff7800', marginBottom: '6px' }}>
                          {formatPrice(item.val)}
                        </span>
                        
                        <div style={{
                          width: '100%',
                          maxWidth: '60px',
                          height: `${barHeight}px`,
                          backgroundColor: idx === arr.length - 1 ? '#ff7800' : '#3b82f6',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.8s ease'
                        }} />
                        
                        <span style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', whiteSpace: 'nowrap' }}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLOG MANAGEMENT */}
          {activeTab === 'blogs' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Quản Lý Bài Viết (CMS)
                </h3>
                {!showBlogForm && (
                  <button
                    onClick={() => {
                      setBlogForm({ title: '', slug: '', imageUrl: '', content: '', category: 'news' });
                      setEditingBlogId(null);
                      setShowBlogForm(true);
                    }}
                    style={{
                      backgroundColor: '#0066ff',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={16} /> Viết bài mới
                  </button>
                )}
              </div>

              {showBlogForm ? (
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700' }}>
                    {editingBlogId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                  </h4>
                  <form onSubmit={handleBlogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Tiêu đề bài viết</label>
                      <input 
                        type="text" 
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        placeholder="Ví dụ: Giới thiệu về nền tảng GearUp"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Đường dẫn tĩnh (Slug)</label>
                      <input 
                        type="text" 
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({...blogForm, slug: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        placeholder="Ví dụ: gioi-thieu, chinh-sach"
                      />
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>Đường dẫn không nên có dấu, ngăn cách bằng dấu gạch ngang.</small>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Danh mục bài viết</label>
                      <select 
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
                      >
                        <option value="news">Tin tức chung</option>
                        <option value="promotion">Chương trình ưu đãi</option>
                        <option value="platform">Thông tin nền tảng</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>URL Ảnh bìa (Không bắt buộc)</label>
                      <input 
                        type="text" 
                        value={blogForm.imageUrl}
                        onChange={(e) => setBlogForm({...blogForm, imageUrl: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                        placeholder="https://imgh.in/host/..."
                      />
                    </div>
                    <div style={{ marginBottom: '40px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Nội dung bài viết (Rich Text Editor)</label>
                      <div style={{ backgroundColor: '#ffffff' }}>
                        <ReactQuill 
                          theme="snow" 
                          value={blogForm.content} 
                          onChange={(val) => setBlogForm({...blogForm, content: val})} 
                          style={{ height: '300px' }}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }, { 'size': ['small', false, 'large', 'huge'] }],
                              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                              [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                              ['link', 'image'],
                              ['clean']
                            ]
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button 
                        type="submit"
                        style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {editingBlogId ? 'Lưu cập nhật' : 'Đăng bài viết'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowBlogForm(false)}
                        style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Tiêu đề</th>
                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Danh mục</th>
                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Đường dẫn (Slug)</th>
                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Ngày tạo</th>
                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs && blogs.length > 0 ? blogs.map((blog) => (
                        <tr key={blog.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {blog.imageUrl && <img src={blog.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '13px', color: '#0f172a' }}>
                            <span style={{ 
                              backgroundColor: blog.category === 'promotion' ? '#fef08a' : (blog.category === 'platform' ? '#bfdbfe' : '#e2e8f0'), 
                              padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' 
                            }}>
                              {blog.category === 'promotion' ? 'Ưu đãi' : (blog.category === 'platform' ? 'Nền tảng' : 'Tin tức')}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '13px', fontFamily: 'monospace', color: '#3b82f6' }}>
                            {blog.slug}
                          </td>
                          <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleEditBlog(blog)}
                                style={{ background: 'none', border: '1px solid #cbd5e1', color: '#64748b', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteBlog(blog.id)}
                                style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            Chưa có bài viết nào trong hệ thống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BANNERS MANAGEMENT */}
          {activeTab === 'banners' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                    <Image size={18} style={{ color: '#0066ff' }} />
                    Danh Sách Banner Cửa Hàng
                  </h3>
                  {!showBannerForm && (
                    <button 
                      onClick={() => setShowBannerForm(true)}
                      style={{ backgroundColor: '#0066ff', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Tạo Banner Mới
                    </button>
                  )}
                </div>

                {showBannerForm ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>{editingBannerId ? 'Chỉnh sửa Banner' : 'Tạo Banner mới'}</h4>
                    <form onSubmit={handleBannerSubmit}>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Tiêu đề Banner (Ghi chú)</label>
                        <input 
                          type="text" 
                          value={bannerForm.title}
                          onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                          required
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          placeholder="Nhập tiêu đề banner..."
                        />
                      </div>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>URL Hình ảnh (Link lấy từ imgh.in hoặc tương đương)</label>
                        <input 
                          type="url" 
                          value={bannerForm.imageUrl}
                          onChange={(e) => setBannerForm({...bannerForm, imageUrl: e.target.value})}
                          required
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          placeholder="https://imgh.in/host/..."
                        />
                      </div>
                      
                      {bannerForm.effect === 'stack-by-stack' && (
                        <>
                          <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>URL Hình ảnh 2 (Hiển thị luân phiên)</label>
                            <input 
                              type="url" 
                              value={bannerForm.imageUrl2}
                              onChange={(e) => setBannerForm({...bannerForm, imageUrl2: e.target.value})}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                              placeholder="https://imgh.in/host/..."
                            />
                          </div>
                          <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>URL Hình ảnh 3 (Hiển thị luân phiên)</label>
                            <input 
                              type="url" 
                              value={bannerForm.imageUrl3}
                              onChange={(e) => setBannerForm({...bannerForm, imageUrl3: e.target.value})}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                              placeholder="https://imgh.in/host/..."
                            />
                          </div>
                        </>
                      )}

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Đường dẫn đích (Khi click vào banner sẽ đến đâu? Ví dụ: blog/uu-dai-thang)</label>
                        <input 
                          type="text" 
                          value={bannerForm.linkUrl}
                          onChange={(e) => setBannerForm({...bannerForm, linkUrl: e.target.value})}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          placeholder="blog/uu-dai-thang"
                        />
                      </div>
                      <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={bannerForm.isActive}
                            onChange={(e) => setBannerForm({...bannerForm, isActive: e.target.checked})}
                            style={{ width: '18px', height: '18px' }}
                          />
                          Hiển thị Banner (Active)
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Hiệu ứng luân phiên</label>
                          <select 
                            value={bannerForm.effect}
                            onChange={(e) => setBannerForm({...bannerForm, effect: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          >
                            <option value="none">Tĩnh (Không hiệu ứng)</option>
                            <option value="stack-by-stack">Stack-by-Stack (3 Ảnh luân phiên)</option>
                            <option value="carousel">Luân phiên (Carousel)</option>
                          </select>
                        </div>
                        {bannerForm.effect === 'stack-by-stack' && (
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Thời gian chuyển (giây)</label>
                            <input 
                              type="number" 
                              min="1"
                              max="60"
                              value={bannerForm.effectDuration}
                              onChange={(e) => setBannerForm({...bannerForm, effectDuration: parseInt(e.target.value) || 3})}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Visual Layout Map Here */}
                      <div style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Vị trí hiển thị (Click chọn trực tiếp trên sơ đồ bên dưới)</label>
                        <div style={{ 
                          border: '2px dashed #cbd5e1', 
                          padding: '24px', 
                          borderRadius: '12px', 
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          maxWidth: '700px',
                          margin: '0 auto'
                        }}>
                          {/* Header */}
                          <div style={{ height: '40px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>HEADER</div>
                          {/* Nav */}
                          <div style={{ height: '30px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>NAVIGATION MENU</div>
                          
                          {/* Main area with sidebar */}
                          <div style={{ display: 'flex', gap: '16px', minHeight: '300px' }}>
                            {/* Content */}
                            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>SLIDER TRANG CHỦ</div>
                              
                              <div 
                                onClick={() => setBannerForm({...bannerForm, position: 'horizontal_1'})}
                                style={{ height: '40px', backgroundColor: bannerForm.position === 'horizontal_1' ? '#3b82f6' : '#cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', transition: '0.2s', border: bannerForm.position === 'horizontal_1' ? '2px solid #2563eb' : '2px dashed #94a3b8' }}
                              >
                                BANNER NGANG 1 (Dưới Slider)
                              </div>
                              
                              <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>FLASH SALE & SẢN PHẨM</div>

                              <div 
                                onClick={() => setBannerForm({...bannerForm, position: 'horizontal_2'})}
                                style={{ height: '40px', backgroundColor: bannerForm.position === 'horizontal_2' ? '#3b82f6' : '#cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', transition: '0.2s', border: bannerForm.position === 'horizontal_2' ? '2px solid #2563eb' : '2px dashed #94a3b8' }}
                              >
                                BANNER NGANG 2 (Giữa Trang)
                              </div>

                              <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>CHỢ THIẾT BỊ</div>

                              <div 
                                onClick={() => setBannerForm({...bannerForm, position: 'horizontal_3'})}
                                style={{ height: '40px', backgroundColor: bannerForm.position === 'horizontal_3' ? '#3b82f6' : '#cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', transition: '0.2s', border: bannerForm.position === 'horizontal_3' ? '2px solid #2563eb' : '2px dashed #94a3b8' }}
                              >
                                BANNER NGANG 3 (Trên Chợ Thiết Bị)
                              </div>
                            </div>

                            {/* Sidebar */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div 
                                onClick={() => setBannerForm({...bannerForm, position: 'sidebar_1'})}
                                style={{ 
                                  flex: 1, 
                                  backgroundColor: bannerForm.position === 'sidebar_1' ? '#3b82f6' : '#cbd5e1', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: '#fff', 
                                  fontWeight: '700', 
                                  transition: '0.2s',
                                  border: bannerForm.position === 'sidebar_1' ? '2px solid #2563eb' : '2px dashed #94a3b8'
                                }}
                              >
                                BANNER SIDEBAR DỌC 1
                              </div>
                              <div 
                                onClick={() => setBannerForm({...bannerForm, position: 'sidebar_2'})}
                                style={{ 
                                  flex: 1, 
                                  backgroundColor: bannerForm.position === 'sidebar_2' ? '#3b82f6' : '#cbd5e1', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: '#fff', 
                                  fontWeight: '700', 
                                  transition: '0.2s',
                                  border: bannerForm.position === 'sidebar_2' ? '2px solid #2563eb' : '2px dashed #94a3b8'
                                }}
                              >
                                BANNER SIDEBAR DỌC 2
                              </div>
                              <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>CÁC WIDGET KHÁC</div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div style={{ height: '50px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>FOOTER</div>
                        </div>
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#1e3a8a',
                          lineHeight: '1.5',
                          maxWidth: '700px',
                          margin: '16px auto 0'
                        }}>
                          <strong>💡 Lưu ý về phạm vi hiển thị:</strong><br/>
                          - <strong>Banner Dọc (1, 2):</strong> Sẽ tự động đồng bộ xuất hiện trên cả cột bên phải của <em>Trang Chủ</em> lẫn cột phải của <em>Trang Bài Viết</em>.<br/>
                          - <strong>Banner Ngang:</strong> Chỉ được thiết kế để hiển thị độc quyền tại phần nội dung chính của <em>Trang Chủ</em>.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          type="submit"
                          style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          {editingBannerId ? 'Lưu cập nhật' : 'Thêm Banner'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setShowBannerForm(false);
                            setEditingBannerId(null);
                            setBannerForm({ title: '', imageUrl: '', imageUrl2: '', imageUrl3: '', linkUrl: '', position: 'home_vertical_1', isActive: true, effect: 'none', effectDuration: 3 });
                          }}
                          style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Tiêu đề</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Vị trí hiển thị</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Trạng thái</th>
                          <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#64748b', textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {banners && banners.length > 0 ? banners.map((banner) => (
                          <tr key={banner.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {banner.imageUrl && <img src={banner.imageUrl} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />}
                              <div>
                                <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', display: 'block' }}>{banner.title}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{banner.linkUrl}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px', fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>
                              {banner.position === 'sidebar_1' && 'Sidebar Dọc 1'}
                              {banner.position === 'sidebar_2' && 'Sidebar Dọc 2'}
                              {banner.position === 'horizontal' && 'Banner Ngang (Nội dung)'}
                              {/* Fallbacks for older banners */}
                              {banner.position === 'home_vertical_1' && 'Sidebar Dọc 1'}
                              {banner.position === 'home_vertical_2' && 'Sidebar Dọc 2'}
                              {banner.position === 'home_horizontal' && 'Banner Ngang'}
                              {banner.position === 'blog_sidebar_1' && 'Sidebar Dọc 1'}
                              {banner.position === 'blog_sidebar_2' && 'Sidebar Dọc 2'}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                backgroundColor: banner.isActive ? '#dcfce7' : '#fee2e2', 
                                color: banner.isActive ? '#166534' : '#991b1b',
                                padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' 
                              }}>
                                {banner.isActive ? 'Đang bật' : 'Đang tắt'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleEditBanner(banner)}
                                  style={{ background: 'none', border: '1px solid #cbd5e1', color: '#64748b', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                  title="Chỉnh sửa"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteBanner(banner.id)}
                                  style={{ background: 'none', border: '1px solid #fca5a5', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                  title="Xóa"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                              Chưa có banner nào. Hãy tạo banner đầu tiên!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB 6: CUSTOMER SUPPORT (CSKH) */}
          {activeTab === 'support' && (() => {
            const cskhMessages = messages?.filter(m => m.assetId?.startsWith('cskh-')) || [];
            
            // Group by user id
            const conversationsMap = {};
            cskhMessages.forEach(m => {
              const uId = m.assetId.replace('cskh-', '');
              if (!conversationsMap[uId]) {
                conversationsMap[uId] = {
                  userId: uId,
                  userName: m.senderName !== 'Admin CSKH' ? m.senderName : 'Khách hàng', // fallback if first msg is admin
                  lastMsgDate: m.timestamp,
                  messages: [],
                  assignee: null
                };
              }
              const text = m.text || '';
              if (m.senderName !== 'Admin CSKH' && m.senderName !== 'Hệ thống' && m.senderName !== 'GearUp AI' && !text.includes('[ASSIGNED]') && !text.startsWith('[RESOLVED]')) {
                conversationsMap[uId].userName = m.senderName;
              }
              if (text.startsWith('[ASSIGNED]')) {
                conversationsMap[uId].assignee = text.replace('[ASSIGNED]', '').trim();
              } else if (m.senderName === 'Admin CSKH') {
                // If an admin replies, they auto-claim it (fallback for old messages)
                if (!conversationsMap[uId].assignee) {
                   conversationsMap[uId].assignee = 'Admin CSKH';
                }
              }
              conversationsMap[uId].messages.push(m);
              conversationsMap[uId].lastMsgDate = m.timestamp;
            });
            
            // Filter out AI messages for each conversation
            Object.values(conversationsMap).forEach(conv => {
              let lastRequestIndex = -1;
              let lastResolvedIndex = -1;
              conv.messages.forEach((m, idx) => {
                const text = m.text || '';
                if (text.includes('[CẦN CSKH]')) lastRequestIndex = idx;
                if (text.startsWith('[RESOLVED]')) lastResolvedIndex = idx;
              });
              
              conv.isResolved = lastResolvedIndex > lastRequestIndex;

              if (lastRequestIndex !== -1) {
                 conv.messages = conv.messages.slice(lastRequestIndex);
              } else if (!conv.assignee) {
                 conv.messages = [];
              }
              
              conv.messages = conv.messages.filter(m => m.senderName !== 'GearUp AI');
            });
            
            const calculateSlaStatus = (conv) => {
              if (conv.isResolved) return { type: 'none' };

              const userMessages = conv.messages.filter(m => m.senderName !== 'Admin CSKH' && m.senderName !== 'Hệ thống' && m.senderName !== 'GearUp AI' && !(m.text || '').startsWith('[ASSIGNED]') && !(m.text || '').startsWith('[RESOLVED]'));
              const lastAdminMessage = conv.messages.slice().reverse().find(m => m.senderName === 'Admin CSKH' || m.senderName === 'Hệ thống' || (m.text || '').startsWith('[ASSIGNED]') || (m.text || '').startsWith('[RESOLVED]'));
              const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;

              if (!lastUserMessage) return { type: 'none' };
              if (lastAdminMessage && (!lastUserMessage.createdAt || (lastAdminMessage.createdAt && lastAdminMessage.createdAt > lastUserMessage.createdAt))) return { type: 'replied' };
              
              if (!lastUserMessage.createdAt) return { type: 'none' };

              // Timer running
              const msgTime = new Date(lastUserMessage.createdAt).getTime();
              const elapsedMin = (now - msgTime) / 60000;
              if (elapsedMin > 10) return { type: 'overdue', val: Math.floor(elapsedMin - 10) };
              
              const remainingSec = Math.floor(600 - (now - msgTime) / 1000);
              const mm = Math.floor(remainingSec / 60).toString().padStart(2, '0');
              const ss = (remainingSec % 60).toString().padStart(2, '0');
              return { type: 'running', val: `${mm}:${ss}` };
            };

            const unassignedList = Object.values(conversationsMap)
              .filter(conv => !conv.isResolved && conv.messages.some(m => (m.text || '').includes('[CẦN CSKH]')) && !conv.assignee)
              .sort((a, b) => b.lastMsgDate.localeCompare(a.lastMsgDate));
            
            const myAssignedList = Object.values(conversationsMap)
              .filter(conv => !conv.isResolved && (conv.assignee === user?.name || (conv.assignee === 'Admin CSKH' && user)))
              .sort((a, b) => b.lastMsgDate.localeCompare(a.lastMsgDate));

            const historyList = Object.values(conversationsMap)
              .filter(conv => conv.isResolved)
              .sort((a, b) => b.lastMsgDate.localeCompare(a.lastMsgDate));

            const conversationsList = cskhTab === 'unassigned' ? unassignedList : (cskhTab === 'mine' ? myAssignedList : historyList);
            const selectedConv = selectedCskhUserId ? conversationsMap[selectedCskhUserId] : null;

            const handleAcceptTicket = () => {
              if (!selectedCskhUserId) return;
              addMessage(`cskh-${selectedCskhUserId}`, 'Hỗ trợ Khách hàng', 'Hệ thống', `[ASSIGNED] ${user?.name}`);
            };

            const handleReply = (e) => {
              e.preventDefault();
              if (!cskhReplyText.trim() || !selectedCskhUserId) return;
              addMessage(`cskh-${selectedCskhUserId}`, 'Hỗ trợ Khách hàng', 'Admin CSKH', cskhReplyText);
              setCskhReplyText('');
            };

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: '600px' }}>
                
                {/* User List */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div 
                      onClick={() => setCskhTab('unassigned')}
                      style={{ flex: 1, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '13px', borderBottom: cskhTab === 'unassigned' ? '2px solid var(--color-primary)' : '2px solid transparent', color: cskhTab === 'unassigned' ? 'var(--color-primary)' : '#64748b', transition: 'all 0.2s' }}
                    >
                      Hộp thư ({unassignedList.length})
                    </div>
                    <div 
                      onClick={() => setCskhTab('mine')}
                      style={{ flex: 1, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '13px', borderBottom: cskhTab === 'mine' ? '2px solid var(--color-primary)' : '2px solid transparent', color: cskhTab === 'mine' ? 'var(--color-primary)' : '#64748b', transition: 'all 0.2s' }}
                    >
                      Của tôi ({myAssignedList.length})
                    </div>
                    <div 
                      onClick={() => setCskhTab('history')}
                      style={{ flex: 1, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontWeight: '600', fontSize: '13px', borderBottom: cskhTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent', color: cskhTab === 'history' ? 'var(--color-primary)' : '#64748b', transition: 'all 0.2s' }}
                    >
                      Lịch sử ({historyList.length})
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversationsList.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Chưa có tin nhắn nào</div>
                    ) : (
                      conversationsList.map(conv => {
                        const sla = calculateSlaStatus(conv);
                        return (
                          <div 
                            key={conv.userId}
                            onClick={() => setSelectedCskhUserId(conv.userId)}
                            style={{
                              padding: '16px',
                              borderBottom: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              backgroundColor: selectedCskhUserId === conv.userId ? '#eff6ff' : '#ffffff',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ fontWeight: '500', color: '#0f172a' }}>{conv.userName}</div>
                              {sla.type === 'running' && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#eab308', backgroundColor: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>
                                  ⏳ {sla.val}
                                </div>
                              )}
                              {sla.type === 'overdue' && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                                  ⚠️ Quá hạn {sla.val}p
                                </div>
                              )}
                              {sla.type === 'replied' && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                                  ✓ Đã phản hồi
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {conv.messages[conv.messages.length - 1]?.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {selectedConv ? (
                    <>
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>Đang hỗ trợ: {selectedConv.userName}</div>
                        {selectedConv.assignee && !selectedConv.isResolved && (
                          <button
                            onClick={() => {
                              addMessage(`cskh-${selectedConv.userId}`, 'Hỗ trợ Khách hàng', 'Hệ thống', `[RESOLVED] Cuộc hội thoại đã được đóng bởi ${user?.name}`);
                              setSelectedCskhUserId(null);
                            }}
                            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Kết thúc hỗ trợ
                          </button>
                        )}
                      </div>
                      
                      {/* Message List */}
                      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
                        {selectedConv.messages.filter(m => {
                          const text = m.text || '';
                          return m.senderName !== 'GearUp AI' && !text.startsWith('[ASSIGNED]') && !text.startsWith('[RESOLVED]');
                        }).map(msg => {
                          const isAdmin = msg.senderName === 'Admin CSKH';
                          
                          return (
                            <div key={msg.id} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textAlign: isAdmin ? 'right' : 'left' }}>
                                {msg.senderName} • {msg.timestamp}
                              </div>
                              <div style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: isAdmin ? 'var(--color-primary)' : '#ffffff', color: isAdmin ? '#ffffff' : '#0f172a', border: isAdmin ? 'none' : '1px solid #e2e8f0', fontSize: '14px', lineHeight: '1.5', borderBottomRightRadius: isAdmin ? '4px' : '16px', borderBottomLeftRadius: isAdmin ? '16px' : '4px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {(msg.text || '').replace('[CẦN CSKH]', '').trim()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Reply Input */}
                      <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                        {!selectedConv.assignee ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>Cuộc hội thoại này chưa được phân công</div>
                            <button 
                              onClick={handleAcceptTicket}
                              style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Tiếp nhận xử lý
                            </button>
                          </div>
                        ) : selectedConv.isResolved ? (
                          <div style={{ color: '#10b981', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                            Cuộc hội thoại này đã được kết thúc.
                          </div>
                        ) : selectedConv.assignee !== user?.name && selectedConv.assignee !== 'Admin CSKH' ? (
                          <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                            Cuộc hội thoại này đang được xử lý bởi {selectedConv.assignee}
                          </div>
                        ) : (
                          <form onSubmit={handleReply} style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="text"
                              value={cskhReplyText}
                              onChange={(e) => setCskhReplyText(e.target.value)}
                              placeholder="Nhập câu trả lời..."
                              style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px' }}
                            />
                            <button 
                              type="submit" 
                              disabled={!cskhReplyText.trim()}
                              style={{ backgroundColor: cskhReplyText.trim() ? 'var(--color-primary)' : '#94a3b8', color: '#ffffff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: '600', cursor: cskhReplyText.trim() ? 'pointer' : 'not-allowed' }}
                            >
                              Gửi
                            </button>
                          </form>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <div style={{ textAlign: 'center' }}>
                        <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>Chọn một cuộc hội thoại để bắt đầu hỗ trợ</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}

        </main>

      </div>

      {/* Corporate Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#475569',
        padding: '20px 0',
        fontSize: '13px',
        borderTop: '1px solid #1e293b',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>© 2026 GearUp Platform SSO Manager - Bảng điều khiển bảo mật dành cho Ban quản trị. Mọi truy cập trái phép sẽ bị ghi nhật ký bảo mật.</p>
        </div>
      </footer>

    </div>
  );
}
