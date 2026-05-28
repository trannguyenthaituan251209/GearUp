import React, { useState, useContext, useEffect } from 'react';
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
  Briefcase 
} from 'lucide-react';

export default function PlatformDashboard() {
  const { 
    user, 
    loginUser, 
    logoutUser,
    approvePartner,
    rejectPartner,
    assets,
    bookings
  } = useContext(StoreContext);

  // Auth local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Tabs: 'approvals' | 'assets' | 'users' | 'financials'
  const [activeTab, setActiveTab] = useState('approvals');

  // Trigger state refresh for users database
  const [usersList, setUsersList] = useState([]);
  
  const fetchUsers = async () => {
    // 1. Fetch LocalStorage Mock DB
    const usersStr = localStorage.getItem('gearup_users');
    let list = usersStr ? JSON.parse(usersStr) : [];

    // 2. Fetch from real database 'profiles' if configured
    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        const { data: dbProfiles, error: dbError } = await supabase.from('profiles').select('*');
        if (!dbError && dbProfiles) {
          // Map DB profiles to UI structure and merge
          const mappedDB = dbProfiles.map(p => ({
            id: p.id,
            name: p.name || 'Người dùng Supabase',
            email: p.id, // For display
            avatar: p.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            isPartner: p.is_partner || false,
            partnerStatus: p.is_partner ? 'approved' : (p.phone && p.citizen_id ? 'pending' : null),
            phone: p.phone || '',
            citizenId: p.citizen_id || '',
            studioName: p.studio_name || '',
            isStaff: p.id === 'user-admin' // Fallback admin check
          }));
          
          // Merge lists prioritizing local database for details, but keep real profiles
          const merged = [...list];
          mappedDB.forEach(dbU => {
            const matchIndex = merged.findIndex(u => u.id === dbU.id);
            if (matchIndex >= 0) {
              merged[matchIndex] = { ...merged[matchIndex], ...dbU };
            } else {
              merged.push(dbU);
            }
          });
          list = merged;
        }
      } catch (err) {
        console.warn('[Platform SSO] Failed to fetch real database profiles:', err);
      }
    }
    setUsersList(list);
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
      const usersStr = localStorage.getItem('gearup_users');
      const allUsers = usersStr ? JSON.parse(usersStr) : [];
      const matched = allUsers.find(u => u.email === email.toLowerCase());
      
      const isUserStaff = email.toLowerCase().endsWith('@gearup.vn') || 
                          data?.user?.email?.toLowerCase().endsWith('@gearup.vn') ||
                          data?.user?.user_metadata?.isStaff ||
                          matched?.isStaff;

      if (!isUserStaff) {
        setErrorMsg('Truy cập bị từ chối! Tài khoản này không thuộc Ban nhân sự GearUp.');
        logoutUser();
      } else {
        fetchUsers();
      }
    }
  };

  const handleApproveStore = async (userId) => {
    await approvePartner(userId);
    alert('Đã phê duyệt hồ sơ đối tác! Cửa hàng đã được kích hoạt hoạt động.');
    fetchUsers();
  };

  const handleRejectStore = async (userId) => {
    await rejectPartner(userId);
    alert('Đã từ chối hồ sơ đối tác.');
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
      <div className="container" style={{ flex: 1, padding: '40px 0 60px 0' }}>
        
        {/* Page Head */}
        <div style={{ marginBottom: '35px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Bảng Quản Trị Hệ Thống GearUp
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Giám sát hồ sơ đối tác mở cửa hàng, quản lý danh sách thiết bị công cộng và phân tích doanh thu 10% hoa hồng nền tảng.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #cbd5e1',
          marginBottom: '35px',
          gap: '24px',
          overflowX: 'auto'
        }}>
          <button 
            onClick={() => setActiveTab('approvals')}
            style={{
              background: 'none', border: 'none', padding: '14px 4px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              color: activeTab === 'approvals' ? '#0066ff' : '#64748b',
              borderBottom: activeTab === 'approvals' ? '2.5px solid #0066ff' : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={16} />
            <span>Phê Duyệt Đối Tác ({pendingStores.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('assets')}
            style={{
              background: 'none', border: 'none', padding: '14px 4px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              color: activeTab === 'assets' ? '#0066ff' : '#64748b',
              borderBottom: activeTab === 'assets' ? '2.5px solid #0066ff' : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Camera size={16} />
            <span>Danh Sách Thiết Bị ({assets.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            style={{
              background: 'none', border: 'none', padding: '14px 4px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              color: activeTab === 'users' ? '#0066ff' : '#64748b',
              borderBottom: activeTab === 'users' ? '2.5px solid #0066ff' : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <Users size={16} />
            <span>Danh Sách Người Dùng ({usersList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('financials')}
            style={{
              background: 'none', border: 'none', padding: '14px 4px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              color: activeTab === 'financials' ? '#0066ff' : '#64748b',
              borderBottom: activeTab === 'financials' ? '2.5px solid #0066ff' : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap'
            }}
          >
            <DollarSign size={16} />
            <span>Doanh Thu & Hoa Hồng Nền Tảng (10%)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <section>
          
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

        </section>

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
