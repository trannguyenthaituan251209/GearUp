import React, { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext();

const initialAssets = [
  {
    id: 'asset-1',
    title: 'Sony Alpha 7 IV + Lens 28-70mm',
    category: 'sony_cam',
    pricePerDay: 450000,
    imageUrl: '/camera.png',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Máy ảnh Sony A7M4 chuyên nghiệp, cảm biến 33MP, lấy nét mắt theo thời gian thực cực đỉnh, quay phim 4K 10-bit. Thích hợp cho quay sự kiện, chụp ngoại cảnh, chụp ảnh cưới. Trọn bộ bao gồm body, lens kit, 2 pin, sạc và thẻ nhớ 128GB tốc độ cao.',
    specs: ['33.0 Megapixels', 'Quay phim 4K 60p', 'Lens 28-70mm f/3.5-5.6', 'Thẻ nhớ 128GB SDXC'],
    status: 'available'
  },
  {
    id: 'asset-2',
    title: 'Flycam DJI Mavic 3 Pro Cine Premium',
    category: 'flycam',
    pricePerDay: 680000,
    imageUrl: '/flycam.png',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4.8,
    location: 'Hà Nội',
    description: 'Flycam DJI Mavic 3 Pro hỗ trợ quay phim Apple ProRes chuyên nghiệp, hệ thống 3 camera chất lượng cao, cảm biến 4/3 CMOS, thời gian bay lên tới 43 phút, truyền hình ảnh O3+ xa đến 15km. Đi kèm bộ combo Fly More Kit đầy đủ 3 pin, đốc sạc.',
    specs: ['Quay phim 5.1K Apple ProRes', '3 Camera quang học DJI', 'Thời gian bay tối đa 43 phút', 'Bộ điều khiển DJI RC Pro'],
    status: 'available'
  },
  {
    id: 'asset-3',
    title: 'Gimbal chống rung DJI Ronin RS 3 Pro',
    category: 'gimbal',
    pricePerDay: 180000,
    imageUrl: '/gimbal.png',
    ownerName: 'Phạm Thùy Linh',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 4.7,
    location: 'Đà Nẵng',
    description: 'Bộ tay cầm chống rung Gimbal DJI RS3 Pro hỗ trợ tải trọng lên tới 4.5kg, cấu trúc sợi carbon siêu bền. Khóa trục tự động thông minh, màn hình cảm ứng OLED 1.8 inch sắc nét. Hoạt động cực êm ái thích hợp cho các dòng máy cinema/mirrorless nặng.',
    specs: ['Tải trọng tối đa 4.5kg', 'Khóa trục tự động', 'Màn hình cảm ứng OLED 1.8 inch', 'Thuật toán chống rung RS thế hệ thứ 3'],
    status: 'available'
  },
  {
    id: 'asset-4',
    title: 'Đèn Studio Aputure Amaran 200d COB LED',
    category: 'studio_light',
    pricePerDay: 150000,
    imageUrl: '/light.png',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 4.6,
    location: 'Hà Nội',
    description: 'Đèn LED Studio chuyên nghiệp Aputure Amaran 200d với công suất 200W, ánh sáng trắng Daylight 5600K cực kỳ chuẩn xác (CRI/TLCI >= 95). Đi kèm chóa đèn, softbox dù bát giác khuếch tán ánh sáng dịu mắt và chân đèn hơi chịu lực tốt.',
    specs: ['Công suất LED 200W', 'Nhiệt màu Daylight 5600K', 'CRI 95+ / TLCI 95+', 'Hỗ trợ ngàm Bowens tiêu chuẩn'],
    status: 'available'
  },
  {
    id: 'asset-5',
    title: 'Máy ảnh Canon EOS R5 Body',
    category: 'canon_cam',
    pricePerDay: 600000,
    imageUrl: '/camera.png',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Máy ảnh mirrorless Full-frame Canon EOS R5 độ phân giải siêu cao 45MP, hỗ trợ quay phim 8K RAW, lấy nét mắt động vật và người theo thời gian thực. Chống rung thân máy lên tới 8 stops khi kết hợp với ống kính RF. Kèm thẻ CFexpress 128GB.',
    specs: ['45.0 Megapixels', 'Quay phim 8K RAW', 'Chống rung 8 stops IBIS', 'Lấy nét Dual Pixel AF II'],
    status: 'available'
  },
  {
    id: 'asset-6',
    title: 'Máy ảnh Fujifilm X-T5 + Lens 18-55mm',
    category: 'fuji_cam',
    pricePerDay: 350000,
    imageUrl: '/camera.png',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4.8,
    location: 'Hà Nội',
    description: 'Máy ảnh mirrorless APS-C Fujifilm X-T5 phong cách retro cổ điển với cảm biến 40.2MP X-Trans, giả lập màu phim đặc trưng cực đẹp (Film Simulation). Thích hợp cho nhiếp ảnh du lịch, chân dung, chụp đường phố nghệ thuật.',
    specs: ['40.2 Megapixels X-Trans', '19 Chế độ giả lập màu phim', 'Chống rung 7.0 stops', 'Màn hình lật 3 hướng'],
    status: 'available'
  },
  {
    id: 'asset-7',
    title: 'Ống kính Sony FE 24-70mm f/2.8 GM II',
    category: 'sony_lens',
    pricePerDay: 320000,
    imageUrl: '/camera.png',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính zoom tiêu chuẩn tối tân dòng G Master thế hệ 2 của Sony. Thiết kế siêu nhẹ chỉ 695g, khẩu độ f/2.8 không đổi, độ nét hoàn hảo trên toàn bộ dải tiêu cự. Phù hợp cho quay phim điện ảnh và chụp ảnh cao cấp.',
    specs: ['Khẩu độ mở lớn f/2.8', 'Dòng ống kính cao cấp GM II', 'Thiết kế kháng bụi ẩm', 'Trọng lượng siêu nhẹ 695g'],
    status: 'available'
  }
];

const initialBookings = [
  {
    id: 'booking-1',
    assetId: 'asset-1',
    assetTitle: 'Sony Alpha 7 IV + Lens 28-70mm',
    assetImage: '/camera.png',
    pricePerDay: 450000,
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    totalPrice: 900000,
    renterName: 'Lê Minh Tuấn',
    renterContact: '0987654321',
    status: 'approved',
    createdAt: '2026-05-27T10:15:00.000Z'
  }
];

const initialMessages = [
  {
    id: 'msg-1',
    assetId: 'asset-1',
    assetTitle: 'Sony Alpha 7 IV + Lens 28-70mm',
    senderName: 'Lê Minh Tuấn',
    text: 'Chào anh Quân, máy ảnh này còn đầy đủ phụ kiện đi kèm như mô tả không ạ?',
    timestamp: '15:10'
  },
  {
    id: 'msg-2',
    assetId: 'asset-1',
    assetTitle: 'Sony Alpha 7 IV + Lens 28-70mm',
    senderName: 'Nguyễn Minh Quân',
    text: 'Chào bạn, máy đầy đủ 2 pin, sạc và thẻ nhớ 128GB nhé bạn. Bạn có thể qua nhận máy trực tiếp hoặc mình ship qua app nhé.',
    timestamp: '15:12'
  }
];

export const StoreProvider = ({ children }) => {
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('gearup_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('gearup_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('gearup_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  // Role toggle: 'renter' (Người đi thuê) vs 'lessor' (Chủ tài sản)
  // Default is 'renter'
  const [currentUserRole, setCurrentUserRole] = useState('renter');

  useEffect(() => {
    localStorage.setItem('gearup_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('gearup_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('gearup_messages', JSON.stringify(messages));
  }, [messages]);

  const toggleUserRole = () => {
    setCurrentUserRole((prev) => (prev === 'renter' ? 'lessor' : 'renter'));
  };

  const addAsset = (newAsset) => {
    const asset = {
      id: `asset-${Date.now()}`,
      rating: 5.0,
      ownerName: 'Nguyễn Minh Quân', // Hardcode matching the active lessor demo
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: 'available',
      ...newAsset
    };
    setAssets((prev) => [asset, ...prev]);
  };

  const addBooking = (newBooking) => {
    const booking = {
      id: `booking-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...newBooking
    };
    setBookings((prev) => [booking, ...prev]);
    
    // Switch asset status to indicate reservation request (optional, we can keep asset available until approved)
  };

  const updateBookingStatus = (bookingId, status) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          // If approved, optionally we can block the asset
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const addMessage = (assetId, assetTitle, senderName, text) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      assetId,
      assetTitle,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <StoreContext.Provider
      value={{
        assets,
        bookings,
        messages,
        currentUserRole,
        toggleUserRole,
        addAsset,
        addBooking,
        updateBookingStatus,
        addMessage
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
