import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { supabase } from '../supabaseClient';
import AssetCard from '../components/AssetCard';
import { Star, MapPin, Calendar, Camera } from 'lucide-react';

export default function PartnerProfile({ partnerId, setCurrentPage }) {
  const { assets } = useContext(StoreContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    async function fetchProfile() {
      if (!partnerId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();
          
        if (error) {
          console.error("Error fetching partner profile:", error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Exception fetching partner profile:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [partnerId]);

  const partnerAssets = (assets || []).filter(a => a.ownerId === partnerId);
  
  // Calculate average rating from assets
  const avgRating = partnerAssets.length > 0 
    ? (partnerAssets.reduce((sum, a) => sum + (a.rating || 5), 0) / partnerAssets.length).toFixed(1)
    : '5.0';

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải thông tin đối tác...</div>;
  }

  if (!profile && partnerAssets.length === 0) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Không tìm thấy thông tin đối tác này.</div>;
  }

  // Use fallback name if profile not found but we have assets
  const displayName = profile?.studio_name || profile?.name || 'Đối tác GearUp';
  const avatarUrl = profile?.avatar || 'https://imgh.in/host/i0s5n9'; // Default avatar

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      {/* Cover Photo */}
      <div style={{ width: '100%', height: '250px', backgroundColor: 'var(--color-primary-light)', backgroundImage: 'url(https://imgh.in/host/t1n75a)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      
      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        {/* Profile Info Card */}
        <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '40px' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
            <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          <div style={{ flex: 1, minWidth: '300px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)', margin: '0 0 8px 0' }}>
                  {displayName}
                  {profile?.partner_status === 'approved' && (
                    <span style={{ marginLeft: '8px', fontSize: '14px', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: '600' }}>✔ Đối tác chính thức</span>
                  )}
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--color-text-main)', margin: '0 0 16px 0', maxWidth: '600px', lineHeight: '1.5' }}>
                  {profile?.bio || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>
              <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}>
                Liên Hệ Ngay
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-main)', fontSize: '14px' }}>
                <Star size={16} fill="var(--color-primary)" color="var(--color-primary)" />
                <span style={{ fontWeight: '600', color: 'var(--color-dark)' }}>{avgRating}</span> ({partnerAssets.length} đánh giá)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-main)', fontSize: '14px' }}>
                <Camera size={16} color="var(--color-text-muted)" />
                <span style={{ fontWeight: '600', color: 'var(--color-dark)' }}>{partnerAssets.length}</span> thiết bị cho thuê
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-main)', fontSize: '14px' }}>
                <MapPin size={16} color="var(--color-text-muted)" />
                <span style={{ fontWeight: '500' }}>Toàn quốc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-main)', fontSize: '14px' }}>
                <Calendar size={16} color="var(--color-text-muted)" />
                <span style={{ fontWeight: '500' }}>Tham gia từ 2024</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Assets Section */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-dark)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid var(--color-border)', display: 'inline-block' }}>
            Thiết bị đang cho thuê
          </h2>
          
          {partnerAssets.length > 0 ? (
            <div className="asset-grid">
              {partnerAssets.map(asset => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onSelect={() => {
                    setCurrentPage('asset-detail', asset.id);
                  }} 
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <Camera size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>Đối tác này chưa có thiết bị nào đang cho thuê.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
