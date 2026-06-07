import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from '../context/StoreContext';
import AssetCard, { formatPrice } from '../components/AssetCard';
import { 
  Camera, 
  Aperture, 
  Video, 
  Sliders, 
  Lightbulb, 
  Mic, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Zap, 
  Users, 
  User, 
  Briefcase,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Truck,
  ShoppingCart,
  Wifi,
  Heart,
  Star
} from 'lucide-react';

const CATEGORIES = [
  { value: 'canon_cam', label: 'Máy ảnh Canon' },
  { value: 'sony_cam', label: 'Máy ảnh Sony' },
  { value: 'fuji_cam', label: 'Máy ảnh Fujifilm' },
  { value: 'nikon_cam', label: 'Máy ảnh Nikon' },
  { value: 'olympus_cam', label: 'Máy ảnh Olympus' },
  { value: 'canon_lens', label: 'Ống kính Canon' },
  { value: 'sony_lens', label: 'Ống kính Sony' },
  { value: 'fuji_lens', label: 'Ống kính Fujifilm' },
  { value: 'sigma_lens', label: 'Ống kính Sigma' },
  { value: 'tamron_lens', label: 'Ống kính Tamron' },
  { value: 'flycam', label: 'Flycam & Drone' },
  { value: 'gimbal', label: 'Gimbal & Chống rung' },
  { value: 'studio_light', label: 'Ánh sáng & Studio' },
  { value: 'audio', label: 'Thiết bị âm thanh' }
];

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image skeleton-pulse" />
      <div className="skeleton-content">
        <div className="skeleton-meta">
          <div className="skeleton-line skeleton-line-sm skeleton-pulse" />
          <div className="skeleton-line skeleton-line-sm skeleton-pulse" style={{ width: '20%' }} />
        </div>
        <div className="skeleton-title-1 skeleton-pulse" />
        <div className="skeleton-title-2 skeleton-pulse" />
        <div className="skeleton-line skeleton-line-md skeleton-pulse" style={{ marginBottom: '12px' }} />
        <div className="skeleton-footer">
          <div className="skeleton-price skeleton-pulse" />
          <div className="skeleton-button skeleton-pulse" />
        </div>
      </div>
    </div>
  );
};

const StackBanner = ({ banner, setCurrentPage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Collect all valid image URLs from the banner
  const images = [banner.imageUrl, banner.imageUrl2, banner.imageUrl3].filter(Boolean);

  useEffect(() => {
    if (images.length <= 1 || banner.effect !== 'stack-by-stack') return;

    const duration = (banner.effectDuration || 3) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, duration);

    return () => clearInterval(timer);
  }, [banner, images.length]);

  if (!banner) return null;
  
  if (images.length <= 1 || banner.effect !== 'stack-by-stack') {
    return (
      <section className="container" style={{ marginBottom: '60px' }}>
        <div className="horizontal-banner" style={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0', width: '100%' }} onClick={() => banner.linkUrl && setCurrentPage(banner.linkUrl)}>
          <img src={images[0]} alt={banner.title || "Banner"} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ marginBottom: '60px' }}>
      <div 
        className="stack-banner" 
        style={{ 
          borderRadius: '16px', 
          overflow: 'hidden', 
          width: '100%', 
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          display: 'grid' // Use CSS Grid for perfect stacking
        }}
        onClick={() => banner.linkUrl && setCurrentPage(banner.linkUrl)}
      >
        {images.map((imgSrc, index) => (
          <img 
            key={index}
            src={imgSrc} 
            alt={`${banner.title} ${index + 1}`} 
            style={{ 
              gridArea: '1 / 1 / 2 / 2', // Stack them all in the exact same cell
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', // Ensures it spans fully without distortion
              display: 'block',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }} 
          />
        ))}
      </div>
    </section>
  );
};

export default function Home({ setCurrentPage, setSelectedAssetId, filters, setFilters }) {
  const { assets, user, setShowAuthModal, setShowPartnerModal, banners, isAppLoading } = useContext(StoreContext);

  const homeVertical1 = banners?.find(b => (b.position === 'sidebar_1' || b.position === 'home_vertical_1') && b.isActive);
  const homeVertical2 = banners?.find(b => (b.position === 'sidebar_2' || b.position === 'home_vertical_2') && b.isActive);
  const homeHorizontal1 = banners?.find(b => (b.position === 'horizontal_1' || b.position === 'horizontal' || b.position === 'home_horizontal') && b.isActive);
  const homeHorizontal2 = banners?.find(b => b.position === 'horizontal_2' && b.isActive);
  const homeHorizontal3 = banners?.find(b => b.position === 'horizontal_3' && b.isActive);
  const [flashSaleTab, setFlashSaleTab] = useState('Nikon');

  const MOCK_FLASH_SALE_ASSETS = [
    {
      id: 'mock-n1', brand: 'Nikon',
      title: 'Máy Ảnh Nikon Z9 Body Chính Hãng (Quay 8K)',
      imageUrl: 'https://images.unsplash.com/photo-1617005082833-1eb585703f4c?w=400&q=80',
      pricePerDay: 1500000, oldPrice: 1800000, discount: 'Tiết kiệm 300.000 đ', rating: 4.9
    },
    {
      id: 'mock-n2', brand: 'Nikon',
      title: 'Nikon Z8 Body - Thiết Kế Nhỏ Gọn Sức Mạnh Khủng',
      imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80',
      pricePerDay: 1200000, oldPrice: 1500000, discount: 'Tiết kiệm 300.000 đ', rating: 4.8
    },
    {
      id: 'mock-n3', brand: 'Nikon',
      title: 'Máy Ảnh Nikon Z7 II (Z7 2) Body Cũ Đẹp',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      pricePerDay: 800000, oldPrice: 950000, discount: 'Tiết kiệm 150.000 đ', rating: 4.7
    },
    {
      id: 'mock-n4', brand: 'Nikon',
      title: 'Ống Kính Nikon NIKKOR Z 24-70mm f/2.8 S',
      imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80',
      pricePerDay: 500000, oldPrice: 650000, discount: 'Tiết kiệm 150.000 đ', rating: 4.9
    },
    {
      id: 'mock-n5', brand: 'Nikon',
      title: 'Nikon Zfc Kit 16-50mm f/3.5-6.3 VR Phong Cách Retro',
      imageUrl: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&q=80',
      pricePerDay: 400000, oldPrice: 500000, discount: 'Tiết kiệm 100.000 đ', rating: 4.8
    },
    {
      id: 'mock-c1', brand: 'Canon',
      title: 'Máy Ảnh Canon EOS R5 Body - Đỉnh Cao Quay Chụp',
      imageUrl: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=400&q=80',
      pricePerDay: 1400000, oldPrice: 1700000, discount: 'Tiết kiệm 300.000 đ', rating: 5.0
    },
    {
      id: 'mock-c2', brand: 'Canon',
      title: 'Máy Ảnh Canon EOS R6 Mark II Tốc Độ Siêu Nhanh',
      imageUrl: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=400&q=80',
      pricePerDay: 1000000, oldPrice: 1200000, discount: 'Tiết kiệm 200.000 đ', rating: 4.9
    },
    {
      id: 'mock-c3', brand: 'Canon',
      title: 'Canon EOS RP Kèm Lens 24-105mm Dành Cho Người Mới',
      imageUrl: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=400&q=80',
      pricePerDay: 450000, oldPrice: 600000, discount: 'Tiết kiệm 150.000 đ', rating: 4.6
    },
    {
      id: 'mock-c4', brand: 'Canon',
      title: 'Ống Kính Canon RF 70-200mm f/2.8L IS USM',
      imageUrl: 'https://images.unsplash.com/photo-1621287955546-276f62ea129e?w=400&q=80',
      pricePerDay: 600000, oldPrice: 800000, discount: 'Tiết kiệm 200.000 đ', rating: 4.9
    },
    {
      id: 'mock-c5', brand: 'Canon',
      title: 'Canon EOS R50 Cực Kỳ Nhỏ Gọn Dành Cho Vlogger',
      imageUrl: 'https://images.unsplash.com/photo-1560599181-424a56a6a978?w=400&q=80',
      pricePerDay: 300000, oldPrice: 400000, discount: 'Tiết kiệm 100.000 đ', rating: 4.7
    },
    {
      id: 'mock-f1', brand: 'Fujifilm',
      title: 'Máy Ảnh Fujifilm X-T5 Cảm Biến 40MP Đỉnh Cao',
      imageUrl: 'https://images.unsplash.com/photo-1566807810034-cb5fa887754b?w=400&q=80',
      pricePerDay: 600000, oldPrice: 750000, discount: 'Tiết kiệm 150.000 đ', rating: 4.9
    },
    {
      id: 'mock-f2', brand: 'Fujifilm',
      title: 'Fujifilm X100V Bạc Xịn Xò Chụp Đường Phố',
      imageUrl: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=400&q=80',
      pricePerDay: 800000, oldPrice: 1000000, discount: 'Tiết kiệm 200.000 đ', rating: 5.0
    },
    {
      id: 'mock-f3', brand: 'Fujifilm',
      title: 'Máy Ảnh Fujifilm X-H2S Quay Phim Chuyên Nghiệp',
      imageUrl: 'https://images.unsplash.com/photo-1587841517743-f8f4842b1016?w=400&q=80',
      pricePerDay: 900000, oldPrice: 1100000, discount: 'Tiết kiệm 200.000 đ', rating: 4.8
    },
    {
      id: 'mock-f4', brand: 'Fujifilm',
      title: 'Ống Kính Fujinon XF 33mm f/1.4 R LM WR',
      imageUrl: 'https://images.unsplash.com/photo-1498028045864-4e782ca7099b?w=400&q=80',
      pricePerDay: 250000, oldPrice: 350000, discount: 'Tiết kiệm 100.000 đ', rating: 4.8
    },
    {
      id: 'mock-f5', brand: 'Fujifilm',
      title: 'Fujifilm X-T30 II Kèm Lens 15-45mm Gọn Nhẹ',
      imageUrl: 'https://images.unsplash.com/photo-1586221199587-b95c3b49cbb6?w=400&q=80',
      pricePerDay: 350000, oldPrice: 450000, discount: 'Tiết kiệm 100.000 đ', rating: 4.7
    }
  ];

  const currentFlashSaleAssets = MOCK_FLASH_SALE_ASSETS.filter(a => a.brand === flashSaleTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      tag: 'HOT DEAL',
      title: 'Sony Alpha A7 IV',
      desc: 'Giảm 20% khi thuê từ 3 ngày. Trải nghiệm Full-frame đỉnh cao ngay hôm nay!',
      action: 'Thuê Ngay'
    },
    {
      image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1200',
      tag: 'MỚI VỀ',
      title: 'Bộ Lens G-Master',
      desc: 'Kho lens đa dạng, độ phân giải cực cao cho mọi nhu cầu quay chụp.',
      action: 'Khám Phá'
    },
    {
      image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&q=80&w=1200',
      tag: 'XU HƯỚNG',
      title: 'Dji Mavic 3 Pro',
      desc: 'Ghi lại những thước phim không gian hùng vĩ với DJI Mavic 3 Pro.',
      action: 'Xem Chi Tiết'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Campaign Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-06-30T23:59:59').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const countdownInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  // Local pagination/lazy state
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLazyLoading, setIsLazyLoading] = useState(false);
  const sentinelRef = useRef(null);

  // Sync search fields with shared filters
  useEffect(() => {
    setSearchQuery(filters.search || '');
    setCategoryQuery(filters.category || '');
  }, [filters.search, filters.category]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(8);
    setIsLazyLoading(false);
  }, [filters.search, filters.category, filters.location, filters.priceRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      search: searchQuery,
      category: categoryQuery
    });
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const selectCategory = (cat) => {
    setFilters({
      ...filters,
      search: '',
      category: cat
    });
    setTimeout(() => {
      const element = document.getElementById('market-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Filter logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !filters.search || 
      asset.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      asset.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || asset.category === filters.category;
    
    const matchesLocation = !filters.location || asset.location === filters.location;
    
    const matchesPrice = !filters.priceRange || asset.pricePerDay <= filters.priceRange;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  const visibleAssets = filteredAssets.slice(0, visibleCount);

  // Scroll handler for Lazy Loading
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isLazyLoading && visibleCount < filteredAssets.length) {
        setIsLazyLoading(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 8, filteredAssets.length));
          setIsLazyLoading(false);
        }, 600); // 600ms premium feeling delay
      }
    }, {
      rootMargin: '100px'
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [isLazyLoading, visibleCount, filteredAssets.length]);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      priceRange: 1000000
    });
  };

  return (
    <div className="home-page">
      <style>{`
        .june-promo-banner {
          background-image: url(https://imgh.in/host/a5cx74);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: var(--radius-lg);
          padding: 240px 24px 48px 24px;
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .june-promo-shape {
          position: absolute;
          z-index: 1;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .june-promo-banner:hover .shape-1 { transform: translate(15px, -15px) rotate(15deg) scale(1.1); }
        .june-promo-banner:hover .shape-2 { transform: translate(-15px, 20px) rotate(-15deg) scale(1.1); }
        .june-promo-banner:hover .shape-3 { transform: translate(20px, 15px) rotate(20deg) scale(1.1); }
        .june-promo-banner:hover .shape-4 { transform: translate(-20px, -20px) rotate(-20deg) scale(1.1); }
        .june-promo-banner:hover .shape-5 { transform: translate(10px, 20px) scale(1.2); }
        .june-promo-banner:hover .shape-6 { transform: translate(-10px, -15px) scale(1.2); }
        .june-promo-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1100px) {
          .june-promo-banner {
            padding-top: 200px;
          }
          .june-promo-grid {
            max-width: 680px;
          }
        }
        @media (max-width: 768px) {
          .june-promo-banner {
            padding-top: 160px;
            background-size: cover;
          }
          .june-promo-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 440px;
          }
        }
        @media (max-width: 480px) {
          .june-promo-banner {
            padding-top: 140px;
            background-image: url(https://imgh.in/host/5qlau9);
            background-size: cover;
          }
          .june-promo-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 380px;
          }
        }
        @media (max-width: 1150px) {
          .june-promo-sticker-left, .june-promo-sticker-right {
            display: none !important;
          }
        }
        .skeleton {
          background: #e2e8f0;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: var(--radius-lg);
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      {isAppLoading ? (
        <div style={{ width: '100%', minHeight: '80vh', padding: '30px 0' }}>
          <section className="container" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 240px', gap: '24px', alignItems: 'stretch' }} className="home-hero-layout">
              <aside className="skeleton" style={{ height: '480px' }}></aside>
              <div className="skeleton" style={{ height: '480px' }}></div>
              <div className="hero-vertical-banners" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="skeleton" style={{ flex: 1, minHeight: '232px' }}></div>
                <div className="skeleton" style={{ flex: 1, minHeight: '232px' }}></div>
              </div>
            </div>
          </section>
          <section className="container" style={{ marginBottom: '60px' }}>
            <div className="skeleton" style={{ height: '280px', width: '100%', borderRadius: '16px' }}></div>
          </section>
          <section className="container" style={{ marginBottom: '60px' }}>
            <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '16px' }}></div>
          </section>
        </div>
      ) : (
        <>

      {/* Top Banner & Category Sidebar (Phong Vu Demo Style) */}
      <section className="container" style={{ paddingTop: '30px', marginBottom: '40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 240px',
          gap: '24px',
          alignItems: 'stretch'
        }} className="home-hero-layout">
          
          {/* Left Column - Category Sidebar List */}
          <aside className="glass-panel" style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '8px 20px 12px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '14px',
              fontWeight: '800',
              color: 'var(--color-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Thiết bị cho thuê
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
              {[
                { key: 'canon_cam', label: 'Máy ảnh Canon', icon: <Camera size={18} strokeWidth={2} /> },
                { key: 'sony_cam', label: 'Máy ảnh Sony', icon: <Camera size={18} strokeWidth={2} /> },
                { key: 'fuji_cam', label: 'Máy ảnh Fujifilm', icon: <Camera size={18} strokeWidth={2} /> },
                { key: 'nikon_cam', label: 'Máy ảnh Nikon', icon: <Camera size={18} strokeWidth={2} /> },
                { key: 'canon_lens', label: 'Ống kính Canon', icon: <Aperture size={18} strokeWidth={2} /> },
                { key: 'sony_lens', label: 'Ống kính Sony', icon: <Aperture size={18} strokeWidth={2} /> },
                { key: 'fuji_lens', label: 'Ống kính Fujifilm', icon: <Aperture size={18} strokeWidth={2} /> },
                { key: 'flycam', label: 'Flycam & Drone', icon: <Video size={18} strokeWidth={2} /> },
                { key: 'gimbal', label: 'Gimbal & Chống rung', icon: <Sliders size={18} strokeWidth={2} /> },
                { key: 'studio_light', label: 'Ánh sáng & Studio', icon: <Lightbulb size={18} strokeWidth={2} /> },
                { key: 'audio', label: 'Thiết bị âm thanh', icon: <Mic size={18} strokeWidth={2} /> }
              ].map((item) => (
                <li key={item.key}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); selectCategory(item.key); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 20px',
                      color: 'var(--color-text-main)',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'var(--transition-fast)'
                    }}
                    className="category-side-item"
                  >
                    <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Middle Column - Hero Banner Slider */}
          <div 
            className="hero-section" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            minHeight: '480px',
            backgroundColor: '#000',
            boxShadow: 'var(--shadow-md)'
          }}>
            {heroSlides.map((slide, index) => (
              <div key={index} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: currentSlide === index ? 1 : 0,
                transition: 'opacity 0.6s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                padding: '40px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                  zIndex: 1
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px', color: '#fff' }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '800',
                    marginBottom: '16px'
                  }}>
                    {slide.tag}
                  </span>
                  <h2 style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    lineHeight: '1.2',
                    marginBottom: '16px',
                    color: '#fff'
                  }}>
                    {slide.title}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.5',
                    color: '#e2e8f0',
                    marginBottom: '32px'
                  }}>
                    {slide.desc}
                  </p>
                  <button className="btn btn-primary btn-lg" style={{ borderRadius: '8px', fontWeight: '700' }}>
                    {slide.action}
                  </button>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
              style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff',
                border: 'none', width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3,
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff',
                border: 'none', width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3,
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease'
              }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Slider Dots */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '8px', zIndex: 3
            }}>
              {heroSlides.map((_, idx) => (
                <div key={idx} onClick={() => setCurrentSlide(idx)} style={{
                  width: currentSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          </div>

          {/* Right Column - 2 Vertical Banners */}
          <div className="hero-vertical-banners" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'flex-start'
          }}>
            {/* Vertical Banner 1 */}
            {homeVertical1 && (
              <div className="vertical-banner dark-theme-banner" style={{
                width: '100%',
                flex: 1,
                minHeight: '232px',
                backgroundImage: `url(${homeVertical1.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'none'
              }} onClick={() => homeVertical1.linkUrl && setCurrentPage(homeVertical1.linkUrl)}>
                <div className="banner-hover-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(15, 23, 42, 0.05)',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px'
                }}>
                  {homeVertical1.title && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#ffffff',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <span>{homeVertical1.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vertical Banner 2 */}
            {homeVertical2 && (
              <div className="vertical-banner light-theme-banner" style={{
                width: '100%',
                flex: 1,
                minHeight: '232px',
                backgroundImage: `url(${homeVertical2.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'none'
              }} onClick={() => homeVertical2.linkUrl && setCurrentPage(homeVertical2.linkUrl)}>
                <div className="banner-hover-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255, 120, 0, 0.02)',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px'
                }}>
                  {homeVertical2.title && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#ffffff',
                      backgroundColor: 'rgba(234, 88, 12, 0.9)',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <span>{homeVertical2.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Banner Ngang 1 (Dưới Slider) */}
      {homeHorizontal1 && <StackBanner banner={homeHorizontal1} setCurrentPage={setCurrentPage} />}

      {/* June Promo Layout (Sleek Apple style inspired) */}
      <section className="container" style={{ marginBottom: '60px', position: 'relative', marginTop: '60px' }}>
        <div className="june-promo-banner">
          {/* Neobrutalist Geometric Shapes Background */}
          {/* Top Left Star */}
          <div className="june-promo-shape shape-1" style={{ top: '220px', left: 'max(10px, calc(50% - 460px))' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#facc15" stroke="#000000" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          {/* Top Right Plus */}
          <div className="june-promo-shape shape-2" style={{ top: '250px', right: 'max(10px, calc(50% - 480px))' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#22c55e" stroke="#000000" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          {/* Bottom Left Triangle */}
          <div className="june-promo-shape shape-3" style={{ top: '650px', left: 'max(20px, calc(50% - 480px))' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#3b82f6" stroke="#000000" strokeWidth="2">
              <polygon points="12 2 22 20 2 20" />
            </svg>
          </div>
          {/* Bottom Right Circle */}
          <div className="june-promo-shape shape-4" style={{ top: '620px', right: 'max(30px, calc(50% - 440px))' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ec4899" stroke="#000000" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          {/* Mid Left Dots */}
          <div className="june-promo-shape shape-5" style={{ top: '450px', left: 'max(5px, calc(50% - 420px))' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="#a855f7" stroke="#000000" strokeWidth="2">
               <circle cx="12" cy="12" r="5" />
             </svg>
          </div>
          {/* Mid Right ZigZag/Square */}
          <div className="june-promo-shape shape-6" style={{ top: '400px', right: 'max(5px, calc(50% - 430px))' }}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="#f97316" stroke="#000000" strokeWidth="2">
               <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
             </svg>
          </div>
          {/* Neobrutalist Countdown Timer */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '3px solid #000000',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '4px 4px 0px #000000',
            marginBottom: '28px',
            zIndex: 2,
            maxWidth: '420px',
            width: 'calc(100% - 32px)',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '900',
              color: '#ff7800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center'
            }}>
              <Zap size={13} fill="#ff7800" strokeWidth={0} />
              Ưu đãi Tháng 6 sẽ khép lại sau:
            </span>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
              {[
                { label: 'NGÀY', value: timeLeft.days },
                { label: 'GIỜ', value: timeLeft.hours },
                { label: 'PHÚT', value: timeLeft.minutes },
                { label: 'GIÂY', value: timeLeft.seconds }
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: '#0066ff',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '850',
                      minWidth: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '2px 2px 0px #000000'
                    }}>
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#000000', marginTop: '4px' }}>
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '900',
                      color: '#000000',
                      alignSelf: 'flex-start',
                      marginTop: '6px'
                    }}>:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Left Sticker 1 (Yellow, top) */}
          <div className="june-promo-sticker-left" style={{
            position: 'absolute',
            left: 'max(12px, calc(50% - 410px - 170px))',
            top: '260px',
            transform: 'rotate(-12deg)',
            zIndex: 10,
            cursor: 'default',
            userSelect: 'none'
          }}>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(4px 4px 0px #000000)'
            }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', fill: '#facc15' }}>
                <path d="M50 0 L58 20 L78 12 L70 32 L88 32 L76 48 L92 58 L74 66 L82 86 L62 80 L58 100 L46 84 L32 94 L28 74 L8 78 L20 62 L4 48 L22 42 L12 22 L32 26 L38 6 Z" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                color: '#000000',
                fontWeight: '900',
                fontSize: '12px',
                lineHeight: '1.1',
                fontFamily: 'var(--font-primary)'
              }}>
                DEAL HỜI<br />THÁNG 6!
              </div>
            </div>
          </div>

          {/* Left Sticker 2 (Green, bottom) */}
          <div className="june-promo-sticker-left" style={{
            position: 'absolute',
            left: 'max(20px, calc(50% - 410px - 120px))',
            top: '500px',
            transform: 'rotate(15deg)',
            zIndex: 10,
            cursor: 'default',
            userSelect: 'none'
          }}>
            <div style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(3px 3px 0px #000000)'
            }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', fill: '#22c55e' }}>
                <path d="M50 0 L58 20 L78 12 L70 32 L88 32 L76 48 L92 58 L74 66 L82 86 L62 80 L58 100 L46 84 L32 94 L28 74 L8 78 L20 62 L4 48 L22 42 L12 22 L32 26 L38 6 Z" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '10px',
                lineHeight: '1.1',
                fontFamily: 'var(--font-primary)'
              }}>
                MÁY XỊN<br />GIÁ MỀM
              </div>
            </div>
          </div>

          {/* Right Sticker 1 (Orange, top) */}
          <div className="june-promo-sticker-right" style={{
            position: 'absolute',
            right: 'max(12px, calc(50% - 410px - 170px))',
            top: '280px',
            transform: 'rotate(10deg)',
            zIndex: 10,
            cursor: 'default',
            userSelect: 'none'
          }}>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(4px 4px 0px #000000)'
            }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', fill: '#ff7800' }}>
                <path d="M50 0 L58 20 L78 12 L70 32 L88 32 L76 48 L92 58 L74 66 L82 86 L62 80 L58 100 L46 84 L32 94 L28 74 L8 78 L20 62 L4 48 L22 42 L12 22 L32 26 L38 6 Z" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '11px',
                lineHeight: '1.1',
                fontFamily: 'var(--font-primary)'
              }}>
                UY TÍN<br />100%
              </div>
            </div>
          </div>

          {/* Right Sticker 2 (Pink, bottom) */}
          <div className="june-promo-sticker-right" style={{
            position: 'absolute',
            right: 'max(20px, calc(50% - 410px - 120px))',
            top: '520px',
            transform: 'rotate(-8deg)',
            zIndex: 10,
            cursor: 'default',
            userSelect: 'none'
          }}>
            <div style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(3px 3px 0px #000000)'
            }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', fill: '#f43f5e' }}>
                <path d="M50 0 L58 20 L78 12 L70 32 L88 32 L76 48 L92 58 L74 66 L82 86 L62 80 L58 100 L46 84 L32 94 L28 74 L8 78 L20 62 L4 48 L22 42 L12 22 L32 26 L38 6 Z" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
              </svg>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '10px',
                lineHeight: '1.1',
                fontFamily: 'var(--font-primary)'
              }}>
                ĐẶT NGAY<br />KẺO LỠ
              </div>
            </div>
          </div>

          <div className="june-promo-grid">
            {assets.slice(0, 5).map((item) => {
              // Fix NaN rent count bug by stripping non-digit chars from ID
              const numericId = parseInt((item.id || '').toString().replace(/\D/g, '')) || 1;
              const rentalsCount = 150 + (numericId % 15) * 23;

              return (
                <div key={item.id} style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #000000',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: '8px'
                }}
                onClick={() => {
                  setSelectedAssetId(item.id);
                  setCurrentPage('asset-detail');
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#000000'}
                >
                  {/* Centered Image Area */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '80px',
                    marginBottom: '8px',
                    backgroundColor: '#fff'
                  }}>
                    <img src={item.imageUrl} alt={item.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  
                  {/* Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
                    <h3 style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#000000',
                      textTransform: 'uppercase',
                      lineHeight: '1.25',
                      marginBottom: '2px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '28px'
                    }}>{item.title}</h3>
                    <p style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      {rentalsCount} lượt thuê
                    </p>
                    
                    <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                      <div style={{ textDecoration: 'line-through', color: '#ef4444', fontSize: '9px', fontWeight: '600', marginBottom: '0px' }}>
                        {formatPrice(Math.round(item.pricePerDay * 1.23))}VND
                      </div>
                      <div style={{ color: '#0066ff', fontSize: '13px', fontWeight: '800' }}>
                        {formatPrice(item.pricePerDay)}VNĐ<span style={{ fontSize: '9px', color: '#64748b', fontWeight: '500' }}>/ngày</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner Ngang 2 (Giữa trang, trên Flash Sale) */}
      {homeHorizontal2 && <StackBanner banner={homeHorizontal2} setCurrentPage={setCurrentPage} />}

      {/* FLASH SALE ONLINE SECTION */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div className="flash-sale-wrapper" style={{
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}>
          {/* Tabs Navigation */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            overflowX: 'auto'
          }}>
            {[
              { id: 'Nikon', title: 'Nikon', subtitle: 'Giảm Đến 20%' },
              { id: 'Canon', title: 'Canon', subtitle: 'Giảm Đến 25%' },
              { id: 'Fujifilm', title: 'Fujifilm', subtitle: 'Giảm Sốc 30%' },
            ].map(tab => {
              const isActive = flashSaleTab === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setFlashSaleTab(tab.id)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '16px 8px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#ea580c' : '#ffffff',
                    backgroundImage: isActive ? 'radial-gradient(#fdba74 15%, transparent 16%), radial-gradient(#fdba74 15%, transparent 16%)' : 'none',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px',
                    color: isActive ? '#ffffff' : '#333333',
                    minWidth: '150px',
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: isActive ? 'none' : '1px solid var(--color-border)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '800', 
                    margin: '0 0 4px', 
                    color: isActive ? '#ffffff' : '#333333',
                    textShadow: isActive ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none' 
                  }}>
                    {tab.title}
                  </h3>
                  <p style={{ 
                    fontSize: '12px', 
                    margin: 0, 
                    fontWeight: isActive ? '600' : '500', 
                    color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--color-text-muted)' 
                  }}>
                    {tab.subtitle}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Main Content Area */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ea580c', // Dark orange base
            backgroundImage: 'radial-gradient(#fdba74 15%, transparent 16%), radial-gradient(#fdba74 15%, transparent 16%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            padding: '24px',
            gap: '24px',
          }} className="flash-sale-content">
            
            {/* Left Sidebar */}
            <div style={{
              width: '240px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }} className="flash-sale-sidebar">
              
              <h2 style={{
                color: '#ffffff',
                textShadow: '2px 2px 0px #ea580c',
                fontSize: '32px',
                fontWeight: '900',
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.1,
                marginBottom: '32px'
              }}>
                FLASH SALE<br/>ONLINE
              </h2>

              <p style={{ color: '#ffffff', fontWeight: '600', marginBottom: '12px', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>Kết thúc sau <span style={{fontWeight: '800'}}>2</span> ngày</p>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '20px', fontWeight: '700', padding: '8px 12px', borderRadius: '6px' }}>14</div>
                <div style={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '20px', fontWeight: '700', padding: '8px 12px', borderRadius: '6px' }}>06</div>
                <div style={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '20px', fontWeight: '700', padding: '8px 12px', borderRadius: '6px' }}>40</div>
              </div>

              <div style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '30px',
                fontWeight: '800',
                textAlign: 'center',
                width: '100%',
                boxShadow: '0 4px 10px rgba(234, 88, 12, 0.4)'
              }}>
                <span style={{ display: 'block', fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Số lượng có hạn</span>
                MUA NGAY KẺO HẾT!!!
              </div>
            </div>

            {/* Right Product Grid Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px', textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>*Giới hạn 01 sản phẩm/ 1 khách hàng trong chương trình</span>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Xem tất cả &gt;</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px'
              }} className="flash-sale-grid">
                {currentFlashSaleAssets.map((asset) => (
                  <div key={asset.id} style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                    {/* Discount Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      zIndex: 2,
                      boxShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                    }}>
                      {asset.discount}
                    </div>

                    {/* Image */}
                    <div style={{ height: '140px', width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={asset.imageUrl} alt={asset.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>

                    {/* Brand & Heart */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{asset.brand}</span>
                      <Heart size={14} style={{ color: '#3b82f6' }} />
                    </div>

                    {/* Title */}
                    <h4 style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#333333',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '36px'
                    }}>
                      {asset.title}
                    </h4>

                    {/* Combo Badge */}
                    <div style={{
                      display: 'inline-block',
                      border: '1px solid #3b82f6',
                      color: '#3b82f6',
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      alignSelf: 'flex-start'
                    }}>
                      COMBO GIẢM ~ 50.000 đ
                    </div>

                    {/* Prices */}
                    <div style={{ marginTop: 'auto', marginBottom: '12px' }}>
                      <div style={{ color: '#2563eb', fontSize: '18px', fontWeight: '800', marginBottom: '2px' }}>
                        {formatPrice(asset.pricePerDay)} đ
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>
                          {formatPrice(asset.oldPrice)} đ
                        </span>
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>
                          -{Math.round((asset.oldPrice - asset.pricePerDay) / asset.oldPrice * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{asset.rating}</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: '1px solid #2563eb',
                      color: '#2563eb',
                      padding: '8px 0',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2563eb'; }}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CSS Overrides for Responsive Flash Sale Grid */}
        <style>{`
          @media (max-width: 1200px) {
            .flash-sale-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
          @media (max-width: 900px) {
            .flash-sale-content {
              flex-direction: column !important;
            }
            .flash-sale-sidebar {
              width: 100% !important;
              flex-direction: row !important;
              justify-content: space-between !important;
              padding: 16px !important;
            }
            .flash-sale-sidebar h2 {
              font-size: 24px !important;
              margin-bottom: 0 !important;
              text-align: left !important;
            }
            .flash-sale-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
          @media (max-width: 768px) {
            .flash-sale-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .flash-sale-sidebar {
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
            }
            .flash-sale-sidebar h2 {
              text-align: center !important;
              margin-bottom: 16px !important;
            }
          }
          @media (max-width: 480px) {
            .flash-sale-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>



      {/* CSS selector classes for side menu and grid layout overrides */}
      <style>{`
        .category-side-item {
          transition: var(--transition-fast);
        }
        .category-side-item:hover {
          background-color: var(--color-primary-light) !important;
          color: var(--color-primary) !important;
        }
        
        .vertical-banner {
          transition: var(--transition-fast);
        }
        .vertical-banner:hover {
          opacity: 0.85;
        }
        .vertical-banner:hover .banner-hover-overlay {
          background-color: rgba(15, 23, 42, 0.2) !important;
        }

        .horizontal-banner {
          transition: var(--transition-fast);
        }
        .horizontal-banner:hover {
          opacity: 0.85;
        }
        .horizontal-banner:hover .banner-hover-overlay {
          background-color: rgba(15, 23, 42, 0.1) !important;
        }

        @media (max-width: 1100px) {
          .home-hero-layout {
            grid-template-columns: 240px 1fr !important;
          }
          .hero-vertical-banners {
            grid-column: 1 / -1;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            height: auto !important;
            width: 100% !important;
          }
        }
        
        @media (max-width: 900px) {
          .home-hero-layout {
            grid-template-columns: 1fr !important;
          }
          .home-hero-layout aside {
            display: none !important;
          }
          .hero-vertical-banners {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            height: auto !important;
            width: 100% !important;
          }
        }
        
        @media (max-width: 768px) {
          .home-horizontal-banners {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .hero-vertical-banners {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Marketplace Section */}
        </>
      )}

      {/* Banner Ngang 3 (Cuối trang, trên Chợ Thiết Bị) */}
      {homeHorizontal3 && <StackBanner banner={homeHorizontal3} setCurrentPage={setCurrentPage} />}

      <section className="container" id="market-section" style={{ paddingTop: '40px', marginBottom: '60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '28px',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>Chợ Thiết Bị</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Khám phá đầy đủ thiết bị quay chụp chất lượng cao, tối ưu chi phí tối đa cho bạn.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '30px',
          alignItems: 'start'
        }} className="market-layout">
          
          {/* Sidebar Filters */}
          <aside className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'none', position: 'sticky', top: '100px', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Bộ Lọc Tìm Kiếm</h3>
              <button 
                onClick={resetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}
              >
                Đặt lại
              </button>
            </div>

            {/* Search */}
            <div className="form-group">
              <label>Tìm kiếm</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tên thiết bị, mô tả..." 
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Danh mục</label>
              <select 
                className="form-control" 
                value={filters.category || ''} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Khu vực</label>
              <select 
                className="form-control" 
                value={filters.location || ''} 
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">Tất cả khu vực</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Giá tối đa / ngày</label>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  {formatPrice(filters.priceRange || 1000000)} đ
                </span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="1000000" 
                step="10000"
                value={filters.priceRange || 1000000} 
                onChange={(e) => handleFilterChange('priceRange', parseInt(e.target.value) || 1000000)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)', marginTop: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>50K đ</span>
                <span>1.000K đ</span>
              </div>
            </div>
          </aside>

          {/* Assets Main Panel */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                Tìm thấy <strong style={{ color: 'var(--color-dark)' }}>{filteredAssets.length}</strong> gợi ý phù hợp
              </div>
            </div>

            {visibleAssets.length > 0 ? (
              <>
                <div className="asset-grid">
                  {visibleAssets.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onSelect={() => {
                        setSelectedAssetId(asset.id);
                        setCurrentPage('asset-detail');
                      }} 
                    />
                  ))}
                  
                  {isLazyLoading && Array.from({ length: 4 }).map((_, idx) => (
                    <SkeletonCard key={`skeleton-${idx}`} />
                  ))}
                </div>

                {visibleCount < filteredAssets.length && !isLazyLoading && (
                  <div ref={sentinelRef} style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Đang cuộn để tải thêm thiết bị...</span>
                  </div>
                )}
              </>
            ) : (
              !isLazyLoading && (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Search size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy thiết bị nào</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>
                    Vui lòng điều chỉnh hoặc đặt lại bộ lọc để tìm thấy các ưu đãi cho thuê hấp dẫn khác.
                  </p>
                  <button className="btn btn-primary" onClick={resetFilters}>Đặt Lại Bộ Lọc</button>
                </div>
              )
            )}
          </main>
        </div>
        
        {/* Dynamic responsive CSS overrides for the split layout grid */}
        <style>{`
          @media (max-width: 900px) {
            .market-layout {
              grid-template-columns: 1fr !important;
            }
            aside {
              position: relative !important;
              top: 0 !important;
              margin-bottom: 20px;
            }
          }
        `}</style>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '60px 0', marginBottom: '60px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Cách Thức Hoạt Động</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 45px' }}>
            GearUp cung cấp giải pháp trung gian chuyên nghiệp, an toàn, bảo vệ tối đa quyền lợi cho cả chủ tài sản và người thuê.
          </p>

          <div className="grid-2" style={{ gap: '30px' }}>
            {/* Renter flow */}
            <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
              <h3 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '18px' }}>
                Dành Cho Người Đi Thuê
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)', flexShrink: 0, width: '32px'
                  }}>01.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Tìm kiếm & Đặt lịch</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tìm thiết bị mong muốn, chọn số ngày cần thuê và gửi yêu cầu.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)', flexShrink: 0, width: '32px'
                  }}>02.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Chờ duyệt & Nhận tài sản</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Chủ tài sản xác nhận nhanh chóng. Bạn đến nhận hoặc giao nhận tận nơi.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-primary)', flexShrink: 0, width: '32px'
                  }}>03.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Sử dụng & Hoàn trả</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sử dụng có trách nhiệm và hoàn trả đúng hẹn. Đánh giá chất lượng dịch vụ.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessor flow */}
            <div className="glass-panel" style={{ padding: '30px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
              <h3 style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '18px' }}>
                Dành Cho Chủ Tài Sản
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-secondary)', flexShrink: 0, width: '32px'
                  }}>01.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Đăng tải tài sản miễn phí</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Đăng ảnh, ghi chi tiết thông tin, thiết lập giá thuê/ngày linh hoạt.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-secondary)', flexShrink: 0, width: '32px'
                  }}>02.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Quản lý & Duyệt yêu cầu</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Xem thông tin người thuê, phê duyệt hoặc từ chối yêu cầu thuê ngay tại Dashboard.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-secondary)', flexShrink: 0, width: '32px'
                  }}>03.</div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Nhận thanh toán an toàn</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Kiếm thêm thu nhập thụ động an toàn từ tài sản ít sử dụng của mình.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
