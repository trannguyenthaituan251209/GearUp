import React, { useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ChevronRight, Camera, PlayCircle, Star, Zap } from 'lucide-react';

// SVG Ticket shape outline background component
const TicketBackground = () => (
  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} viewBox="0 0 420 160" preserveAspectRatio="none">
    <path 
      d="M 12 0 
         H 408 
         A 12 12 0 0 1 420 12 
         V 68 
         A 12 12 0 0 0 420 92 
         V 148 
         A 12 12 0 0 1 408 160 
         H 12 
         A 12 12 0 0 1 0 148 
         V 92 
         A 12 12 0 0 0 0 68 
         V 12 
         A 12 12 0 0 1 12 0 Z" 
      fill="white" 
      stroke="black" 
      strokeWidth="3" 
    />
  </svg>
);

// High-fidelity ticket component
const CouponTicketCard = ({ title, discount, image, gifts, pricePerDay, onClick }) => {
  return (
    <div 
      style={{
        position: 'relative',
        height: '160px',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        transition: 'transform 0.15s ease, filter 0.15s ease',
        cursor: 'pointer',
        filter: 'drop-shadow(6px 6px 0px rgba(0, 0, 0, 1))',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(2px, 2px)';
        e.currentTarget.style.filter = 'drop-shadow(4px 4px 0px rgba(0, 0, 0, 1))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.filter = 'drop-shadow(6px 6px 0px rgba(0, 0, 0, 1))';
      }}
    >
      <TicketBackground />

      {/* Ticket Grid layout */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '120px 2px 1fr',
        height: '100%',
        alignItems: 'center',
        padding: '0 16px 0 12px'
      }}>
        {/* Left Side: Product Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '8px'
        }}>
          <img 
            src={image} 
            alt={title} 
            style={{
              maxWidth: '100%',
              maxHeight: '100px',
              objectFit: 'contain',
              borderRadius: '8px'
            }} 
            onError={(e) => {
              // fallback image if path fails
              e.target.src = '/camera.png';
            }}
          />
        </div>

        {/* Dashed vertical separator line */}
        <div style={{
          height: '75%',
          borderLeft: '2px dashed #000000',
        }}></div>

        {/* Right Side: Details & CTA */}
        <div style={{
          padding: '12px 6px 12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          {/* Title */}
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '900',
              color: '#000000',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              lineHeight: '1.2'
            }}>{title}</h4>
          </div>

          {/* Discount & Included Items */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            marginTop: '4px'
          }}>
            {/* Outline 3D Gradient Discount text */}
            <div style={{
              fontSize: '36px',
              fontWeight: '950',
              backgroundImage: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0px #000000) drop-shadow(-1px -1px 0px #000000)',
              lineHeight: 1
            }}>
              {discount}
            </div>

            {/* Included accessories checklist */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '11px',
              color: '#000000',
              lineHeight: '1.4',
              fontWeight: '700'
            }}>
              {gifts.slice(0, 3).map((gift, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: '#e11d48' }}>✦</span> {gift}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row: Rental Info & CTA button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '6px'
          }}>
            <div>
              <span style={{ fontSize: '9px', color: '#475569', display: 'block', fontWeight: '700' }}>GIÁ ƯU ĐÃI</span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#000000' }}>
                {pricePerDay.toLocaleString('vi-VN')}đ<span style={{ fontSize: '9px', fontWeight: '700', color: '#475569' }}>/ngày</span>
              </span>
            </div>
            <div style={{
              backgroundColor: '#ffb800',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0px 0px #000000'
            }}>
              Thuê Ngay
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function WelcomePromoPage({ setCurrentPage, setSelectedAssetId, setFilters, filters }) {
  const { assets } = useContext(StoreContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Newcomer specific cameras lists
  const newcomerPromos = [
    {
      title: 'Fujifilm X100VI',
      discount: '5%',
      image: '/device_image/Fujifilm X100ViI.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi đựng chuyên dụng', 'Đèn flash rời'],
      pricePerDay: 250000
    },
    {
      title: 'Fujifilm XT-20',
      discount: '15%',
      image: '/device_image/Fujifilm XT-20.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi đựng máy', 'Kèm kit 16-50mm'],
      pricePerDay: 180000
    },
    {
      title: 'Canon EOS M50 II',
      discount: '9%',
      image: '/device_image/Canon EOS M50 Mark II.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi đựng', 'Đèn flash rời'],
      pricePerDay: 150000
    },
    {
      title: 'Canon EOS R50',
      discount: '12%',
      image: '/device_image/Canon EOS R50.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi chống sốc', 'Đèn flash rời'],
      pricePerDay: 200000
    },
    {
      title: 'Fujifilm X-S20',
      discount: '8%',
      image: '/device_image/Fujifilm X-S20.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi đựng', 'Đèn flash rời'],
      pricePerDay: 280000
    },
    {
      title: 'Nikon Z FC',
      discount: '10%',
      image: '/device_image/Nikon Z FC.jpg',
      gifts: ['Thẻ nhớ 64Gb', 'Túi da retro', 'Đèn flash rời'],
      pricePerDay: 220000
    },
    {
      title: 'DJI Osmo Pocket 4',
      discount: '12%',
      image: '/gimbal.png',
      gifts: ['Thẻ nhớ 64Gb', 'Hộp chống sốc', 'Đèn flash rời'],
      pricePerDay: 150000
    },
    {
      title: 'DJI Osmo Nano',
      discount: '15%',
      image: '/flycam.png',
      gifts: ['Thẻ nhớ 64Gb', 'Túi đựng', 'Đèn flash rời'],
      pricePerDay: 190000
    }
  ];

  const handleRentClick = (item) => {
    // Search matched asset inside database
    const query = item.title.toLowerCase();
    const matched = assets?.find(a => 
      a.title.toLowerCase().includes(query) || 
      query.includes(a.title.toLowerCase()) ||
      (query.includes('m50') && a.title.toLowerCase().includes('m50')) ||
      (query.includes('x100') && a.title.toLowerCase().includes('x100')) ||
      (query.includes('xt-20') && a.title.toLowerCase().includes('xt-20'))
    );

    if (matched) {
      if (setSelectedAssetId) setSelectedAssetId(matched.id);
      setCurrentPage('asset-detail', matched.id);
    } else {
      if (setFilters) {
        setFilters({
          ...filters,
          search: item.title,
          category: ''
        });
      }
      setCurrentPage('home');
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#ebd46f', 
        backgroundImage: 'url("https://imgh.in/host/xeyt4v")', 
        backgroundRepeat: 'repeat',
        backgroundSize: '1024px 576px',
        backgroundPosition: 'top center',
        minHeight: '100vh', 
        paddingBottom: '80px',
        color: '#000000',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        padding: '80px 24px 60px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Pure CSS Doodle Typography Heading */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            userSelect: 'none',
            position: 'relative'
          }}>
            {/* "CHÀO" Sticker Box */}
            <div style={{
              backgroundColor: '#b59a1b',
              color: '#ffffff',
              border: '4px solid #ffffff',
              borderRadius: '14px',
              padding: '4px 20px',
              fontSize: '20px',
              fontWeight: '900',
              textTransform: 'uppercase',
              transform: 'rotate(-8deg) translate(-30px, -12px)',
              boxShadow: '0 5px 0px #000000',
              zIndex: 2,
              letterSpacing: '1px',
              display: 'inline-block'
            }}>
              CHÀO
            </div>

            {/* "NGƯỜI MỚI" Outline Drop-shadow Text */}
            <h2 style={{
              fontSize: 'clamp(44px, 8vw, 76px)',
              fontWeight: '950',
              color: '#b59a1b',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '-1.5px',
              lineHeight: '1',
              zIndex: 1,
              textShadow: `
                -3.5px -3.5px 0 #ffffff, 
                 3.5px -3.5px 0 #ffffff, 
                -3.5px  3.5px 0 #ffffff, 
                 3.5px  3.5px 0 #ffffff, 
                -3.5px  0px   0 #ffffff, 
                 3.5px  0px   0 #ffffff, 
                 0px   -3.5px 0 #ffffff, 
                 0px    3.5px 0 #ffffff, 
                 5px    5px   0 #000000,
                 6px    6px   0 #000000
              `
            }}>
              NGƯỜI MỚI
            </h2>
          </div>
          
          {/* Rotated highlight headings in doodle style */}
          <h1 style={{ 
            fontSize: 'clamp(32px, 5vw, 52px)', 
            fontWeight: '900', 
            color: '#000000', 
            lineHeight: '1.3', 
            marginBottom: '36px',
            textTransform: 'uppercase'
          }}>
            Mở ra <span style={{ 
              backgroundColor: '#ffb800', 
              border: '3.5px solid #000000', 
              padding: '4px 16px', 
              display: 'inline-block', 
              transform: 'rotate(-2.5deg)', 
              boxShadow: '6px 6px 0px #000000' 
            }}>tầm nhìn mới.</span><br/>
            Khởi đầu <span style={{ 
              backgroundColor: '#ff85a7', 
              border: '3.5px solid #000000', 
              padding: '4px 16px', 
              display: 'inline-block', 
              transform: 'rotate(1.5deg)', 
              boxShadow: '6px 6px 0px #000000',
              marginTop: '16px' 
            }}>đam mê.</span>
          </h1>
          
          {/* Flat doodle-style description block */}
          <p style={{ 
            fontSize: '17px', 
            color: '#000000', 
            lineHeight: '1.7', 
            maxWidth: '620px', 
            margin: '0 auto 40px',
            backgroundColor: '#ffffff',
            border: '3.5px solid #000000',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '8px 8px 0px #000000',
            fontWeight: '700',
            textAlign: 'justify'
          }}>
            Bạn mới bắt đầu học nhiếp ảnh hay quay phim? Đừng lo lắng về chi phí mua sắm thiết bị đắt đỏ. Tại GearUp, bạn có thể trải nghiệm các dòng máy ảnh chuyên nghiệp với mức giá thuê cực kỳ ưu đãi. Nhập mã ưu đãi đặc quyền cho người mới để nhận quà đi kèm.
          </p>
          
          {/* Custom CTA buttons with flat shadow transitions */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{ 
                backgroundColor: '#ffb800', 
                color: '#000000', 
                border: '3.5px solid #000000', 
                padding: '16px 36px', 
                borderRadius: '16px', 
                fontSize: '18px', 
                fontWeight: '900', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer', 
                boxShadow: '6px 6px 0px #000000',
                transition: 'all 0.1s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
              }}
            >
              Xem thiết bị ngay <ChevronRight size={22} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setCurrentPage('blog/uu-dai-thang')}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#000000', 
                border: '3.5px solid #000000', 
                padding: '16px 36px', 
                borderRadius: '16px', 
                fontSize: '18px', 
                fontWeight: '900', 
                cursor: 'pointer',
                boxShadow: '6px 6px 0px #000000',
                transition: 'all 0.1s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
              }}
            >
              Đọc hướng dẫn
            </button>
          </div>
        </div>
      </section>

      {/* Suggested Gear: Tickets Grid */}
      <section className="container" style={{ marginTop: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '36px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '3px solid #000000',
            borderRadius: '16px',
            padding: '12px 24px',
            boxShadow: '6px 6px 0px #000000'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000000', margin: 0, textTransform: 'uppercase' }}>
              Gợi ý ưu đãi cho người mới
            </h2>
            <p style={{ color: '#333333', fontSize: '13px', margin: '4px 0 0', fontWeight: '700' }}>
              Những bộ máy dễ sử dụng, giao diện thân thiện, tặng kèm phụ kiện và giảm giá sâu.
            </p>
          </div>
          <button 
            onClick={() => setCurrentPage('home')}
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#000000', 
              border: '3px solid #000000', 
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '14px', 
              fontWeight: '900', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #000000',
              textTransform: 'uppercase',
              transition: 'all 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(1px, 1px)';
              e.currentTarget.style.boxShadow = '3px 3px 0px #000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
            }}
          >
            Tất cả thiết bị <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Coupons grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '32px' 
        }}>
          {newcomerPromos.map((item, idx) => (
            <CouponTicketCard 
              key={idx}
              title={item.title}
              discount={item.discount}
              image={item.image}
              gifts={item.gifts}
              pricePerDay={item.pricePerDay}
              onClick={() => handleRentClick(item)}
            />
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container" style={{ marginTop: '80px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div style={{ backgroundColor: '#ffffff', border: '3.5px solid #000000', borderRadius: '24px', padding: '32px', boxShadow: '8px 8px 0px #000000', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#afffcb', border: '3px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', marginBottom: '20px', boxShadow: '4px 4px 0px #000000' }}>
              <Zap size={28} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>Không cần cọc tiền mặt</h3>
            <p style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px', fontWeight: '700' }}>Thủ tục thuê máy đơn giản, hỗ trợ duyệt hồ sơ online nhanh chóng mà không cần đặt cọc trước toàn bộ giá trị máy.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '3.5px solid #000000', borderRadius: '24px', padding: '32px', boxShadow: '8px 8px 0px #000000', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#ffd800', border: '3px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', marginBottom: '20px', boxShadow: '4px 4px 0px #000000' }}>
              <Star size={28} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>Tình trạng hoàn hảo</h3>
            <p style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px', fontWeight: '700' }}>100% thiết bị được vệ sinh, bảo trì và kiểm tra kỹ thuật sau mỗi lần thuê. Yên tâm sáng tạo không lo hỏng hóc.</p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '3.5px solid #000000', borderRadius: '24px', padding: '32px', boxShadow: '8px 8px 0px #000000', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#ff85a7', border: '3px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', marginBottom: '20px', boxShadow: '4px 4px 0px #000000' }}>
              <PlayCircle size={28} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>Hỗ trợ tận tình</h3>
            <p style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px', fontWeight: '700' }}>Đội ngũ kỹ thuật viên sẵn sàng hướng dẫn bạn cách setup máy, chỉnh thông số cơ bản cho buổi chụp đầu tiên.</p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '40px' }}>
        <div style={{ 
          backgroundColor: '#ff85a7', 
          border: '3.5px solid #000000',
          borderRadius: '32px', 
          padding: '60px 40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '8px 8px 0px #000000'
        }}>
          {/* Hand drawn decor shapes inside the banner */}
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #000000', backgroundColor: '#ffd800' }}></div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #000000', backgroundColor: '#afffcb' }}></div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#000000', marginBottom: '20px', textTransform: 'uppercase' }}>Sẵn sàng trải nghiệm?</h2>
            <p style={{ fontSize: '18px', color: '#000000', marginBottom: '40px', fontWeight: '700' }}>Hàng trăm thiết bị xịn xò đang chờ bạn khám phá. Đừng để thiết bị giới hạn khả năng sáng tạo của bạn.</p>
            <button 
              onClick={() => setCurrentPage('home')}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#000000', 
                border: '3.5px solid #000000', 
                padding: '18px 48px', 
                borderRadius: '16px', 
                fontSize: '20px', 
                fontWeight: '900', 
                cursor: 'pointer', 
                boxShadow: '6px 6px 0px #000000',
                transition: 'all 0.1s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
              }}
            >
              Bắt đầu thuê ngay
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
