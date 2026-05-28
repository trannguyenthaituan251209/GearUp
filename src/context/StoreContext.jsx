import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StoreContext = createContext();

const initialAssets = [
  {
    id: 'asset-canon-6d',
    title: 'Máy ảnh Canon EOS 6D Mark II',
    category: 'canon_cam',
    pricePerDay: 400000,
    imageUrl: '/device_image/Canon EOS 6D Mark II.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Canon 6D Mark II chuyên nghiệp, cảm biến Full-frame 26.2MP, bộ xử lý hình ảnh DIGIC 7. Thích hợp chụp chân dung, phong cảnh và sự kiện.',
    specs: ['26.2 Megapixels', 'Cảm biến Full-Frame', 'Dual Pixel CMOS AF', 'Màn hình xoay lật xoay cảm ứng'],
    status: 'available'
  },
  {
    id: 'asset-fuji-xs20',
    title: 'Máy ảnh Fujifilm X-S20 Body',
    category: 'fuji_cam',
    pricePerDay: 350000,
    imageUrl: '/device_image/Fujifilm X-S20.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.8,
    location: 'Hà Nội',
    description: 'Fujifilm X-S20 hỗ trợ quay 6.2K, giả lập màu phim đỉnh cao, chống rung IBIS 7.0 stops, cực kì thích hợp cho các vlogger và travel creator.',
    specs: ['Quay phim 6.2K/30p', 'Chống rung IBIS 7 stops', 'Pin NP-W235 dung lượng cao', '19 Chế độ màu phim'],
    status: 'available'
  },
  {
    id: 'asset-canon-2470',
    title: 'Ống kính Canon FE 24-70mm f2.8L II USM',
    category: 'canon_lens',
    pricePerDay: 280000,
    imageUrl: '/device_image/Lens Canon FE 24-70mm f2.8L II USM.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính zoom đa dụng thuộc dòng L cao cấp của Canon, khẩu độ cố định f/2.8 cho độ nét vượt trội trên toàn dải tiêu cự. Phù hợp cho mọi thể loại ảnh.',
    specs: ['Khẩu độ f/2.8', 'Dòng ống kính cao cấp L-series', 'Mô-tơ lấy nét USM siêu nhanh', 'Kháng bụi và giọt bắn'],
    status: 'available'
  },
  {
    id: 'asset-nikon-zfc',
    title: 'Máy ảnh Nikon Z FC + Lens kit',
    category: 'nikon_cam',
    pricePerDay: 300000,
    imageUrl: '/device_image/Nikon Z FC.jpg',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-3',
    rating: 4.7,
    location: 'Đà Nẵng',
    description: 'Nikon Z fc mang phong cách hoài cổ retro lấy cảm hứng từ dòng máy phim FM2 huyền thoại. Cảm biến DX 20.9MP, kết nối SnapBridge tiện lợi.',
    specs: ['Phong cách retro cổ điển', 'Cảm biến DX 20.9MP', 'Màn hình cảm ứng lật xoay', 'Quay phim 4K UHD'],
    status: 'available'
  },
  {
    id: 'asset-fuji-xt50',
    title: 'Máy ảnh Fujifilm X-T50 Body',
    category: 'fuji_cam',
    pricePerDay: 380000,
    imageUrl: '/device_image/Fujifilm XT50.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.8,
    location: 'Hà Nội',
    description: 'Fujifilm X-T50 sở hữu cảm biến 40.2MP X-Trans CMOS 5 HR thế hệ mới nhất, bộ chọn nhanh giả lập màu phim trên thân máy cực kì độc đáo.',
    specs: ['Cảm biến 40.2 Megapixels', 'X-Processor 5 thông minh', 'Chống rung IBIS 7.0 stops', 'Vòng xoay chọn màu phim chuyên biệt'],
    status: 'available'
  },
  {
    id: 'asset-sony-100400',
    title: 'Ống kính Sony FE 100-400mm f4.5-f5.6 GM OSS',
    category: 'sony_lens',
    pricePerDay: 480000,
    imageUrl: '/device_image/Len Sony FE 100-400mm f4.5-f5.6 GM OSS.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.9,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính zoom siêu tele dòng G Master cao cấp của Sony. Chống rung quang học SteadyShot tích hợp, lấy nét DDSSM siêu nhanh thích hợp chụp thể thao, chim thú.',
    specs: ['Zoom siêu tele 100-400mm', 'Dòng ống kính cao cấp G Master', 'Chống rung OSS tích hợp', 'Lấy nét siêu nhanh DDSSM'],
    status: 'available'
  },
  {
    id: 'asset-sigma-30',
    title: 'Ống kính Sigma 30mm f1.4 DC DN',
    category: 'sigma_lens',
    pricePerDay: 120000,
    imageUrl: '/device_image/Lens Sigma 30mm f 1.4.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.7,
    location: 'Hà Nội',
    description: 'Ống kính khẩu lớn f/1.4 của Sigma dành cho hệ máy APS-C. Cho bokeh xóa phông mịt mù, độ sắc nét cao ngay tại khẩu lớn nhất. Lý tưởng để chụp chân dung.',
    specs: ['Khẩu độ siêu lớn f/1.4', 'Tiêu cự tương đương 45mm', 'Thiết kế nhỏ gọn nhẹ', 'Bokeh tròn mịn màng'],
    status: 'available'
  },
  {
    id: 'asset-canon-m50',
    title: 'Máy ảnh Canon EOS M50 Mark II',
    category: 'canon_cam',
    pricePerDay: 250000,
    imageUrl: '/device_image/Canon EOS M50 Mark II.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.6,
    location: 'TP. Hồ Chí Minh',
    description: 'Canon M50 Mark II nhỏ gọn, lấy nét mắt cực nhanh, tích hợp cổng micro 3.5mm cho vlogging. Thiết bị quay YouTube và livestream tuyệt vời.',
    specs: ['24.1 Megapixels APS-C', 'Quay phim 4K UHD', 'Dual Pixel CMOS AF', 'Hỗ trợ livestream trực tiếp'],
    status: 'available'
  },
  {
    id: 'asset-canon-r50',
    title: 'Máy ảnh Canon EOS R50 Mirrorless',
    category: 'canon_cam',
    pricePerDay: 280000,
    imageUrl: '/device_image/Canon EOS R50.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.7,
    location: 'TP. Hồ Chí Minh',
    description: 'Dòng máy ảnh ngàm RF nhỏ nhẹ nhất của Canon, trang bị cảm biến APS-C 24.2MP cùng hệ thống Dual Pixel AF II lấy nét cực nhạy.',
    specs: ['24.2 Megapixels', 'Lấy nét Dual Pixel AF II', 'Quay phim 4K 30p (không crop)', 'Chụp liên tiếp 15 hình/s'],
    status: 'available'
  },
  {
    id: 'asset-fuji-xh2s',
    title: 'Máy ảnh Fujifilm X-H2S Body',
    category: 'fuji_cam',
    pricePerDay: 500000,
    imageUrl: '/device_image/Fujifilm XH2S.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.9,
    location: 'Hà Nội',
    description: 'Fujifilm X-H2S hiệu năng cực cao, cảm biến X-Trans CMOS 5 Stacked 26.1MP chụp 40 hình/s, quay ProRes 10-bit 4:2:2 trực tiếp vào thẻ nhớ.',
    specs: ['Cảm biến Stacked CMOS', 'Chụp liên tiếp 40 hình/s', 'Quay phim 6.2K 30p & 4K 120p', 'Hỗ trợ Apple ProRes'],
    status: 'available'
  },
  {
    id: 'asset-fuji-x100v',
    title: 'Máy ảnh Fujifilm X100VI (Bản đặc biệt)',
    category: 'fuji_cam',
    pricePerDay: 400000,
    imageUrl: '/device_image/Fujifilm X100ViI.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.9,
    location: 'Hà Nội',
    description: 'Fujifilm X100VI với ống kính tiêu cự cố định 23mm f/2, cảm biến 40.2MP, tích hợp chống rung IBIS 6.0 stops. Máy ảnh đường phố được săn đón nhất.',
    specs: ['Cảm biến 40.2 Megapixels', 'Ống kính cố định 23mm f/2', 'Chống rung IBIS 6 stops', 'Kính ngắm lai độc quyền'],
    status: 'available'
  },
  {
    id: 'asset-nikon-d3500',
    title: 'Máy ảnh DSLR Nikon D3500 + Lens Kit',
    category: 'nikon_cam',
    pricePerDay: 150000,
    imageUrl: '/device_image/Nikon D3500.jpg',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-3',
    rating: 4.5,
    location: 'Đà Nẵng',
    description: 'Nikon D3500 là chiếc DSLR quốc dân cho người mới bắt đầu. Thao tác cực kỳ trực quan, thời lượng pin siêu bền chụp được hơn 1500 tấm hình một lần sạc.',
    specs: ['24.2 Megapixels APS-C', 'Pin dung lượng siêu trâu', 'Chế độ hướng dẫn (Guide Mode)', 'Trọng lượng siêu nhẹ'],
    status: 'available'
  },
  {
    id: 'asset-nikon-d7200',
    title: 'Máy ảnh DSLR Nikon D7200 Body',
    category: 'nikon_cam',
    pricePerDay: 220000,
    imageUrl: '/device_image/Nikon D7200.jpg',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-3',
    rating: 4.7,
    location: 'Đà Nẵng',
    description: 'Nikon D7200 dòng bán chuyên nghiệp (Semi-Pro) với hệ thống lấy nét 51 điểm Multi-CAM, cảm biến 24.2MP loại bỏ bộ lọc OLPF cho ảnh siêu nét.',
    specs: ['Lấy nét 51 điểm AF', 'Thân máy kháng thời tiết', '2 khe cắm thẻ nhớ SD', 'Không có bộ lọc OLPF'],
    status: 'available'
  },
  {
    id: 'asset-olympus-omd',
    title: 'Máy ảnh Olympus OM-D E-M10 Mark IV',
    category: 'olympus_cam',
    pricePerDay: 250000,
    imageUrl: '/device_image/Olympus-OM-D.jpg',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-3',
    rating: 4.6,
    location: 'Đà Nẵng',
    description: 'Olympus OM-D thiết kế siêu nhỏ gọn hoài cổ ngàm M4/3, hệ thống chống rung 5 trục trong thân máy cực kì mạnh mẽ cho ảnh sắc nét dù chụp cầm tay.',
    specs: ['Cảm biến Micro Four Thirds', 'Chống rung 5 trục IBIS', 'Thiết kế hoài cổ siêu nhẹ', 'Màn hình lật 180 độ selfie'],
    status: 'available'
  },
  {
    id: 'asset-canon-50',
    title: 'Ống kính chân dung Canon EF 50mm f1.2L USM',
    category: 'canon_lens',
    pricePerDay: 180000,
    imageUrl: '/device_image/Lens Canon EF 50mm f1.2L DSLR.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.8,
    location: 'TP. Hồ Chí Minh',
    description: 'Huyền thoại ống kính chân dung tiêu cự 50mm dòng L cao cấp. Khẩu độ siêu mở f/1.2 tạo hiệu ứng xóa phông lung linh, mượt mà và chụp tối cực tốt.',
    specs: ['Khẩu độ siêu lớn f/1.2', 'Thấu kính kính phi cầu lớn', 'Mô-tơ siêu âm USM lấy nét', 'Dòng L chuyên nghiệp'],
    status: 'available'
  },
  {
    id: 'asset-canon-1018',
    title: 'Ống kính góc siêu rộng Canon EF-S 10-18mm',
    category: 'canon_lens',
    pricePerDay: 100000,
    imageUrl: '/device_image/Lens Canon EF-S 10-18mm.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.5,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính góc rộng giá rẻ dành cho cảm biến APS-C của Canon. Thích hợp chụp kiến trúc, phong cảnh và quay video vlog trong không gian hẹp.',
    specs: ['Tiêu cự góc rộng 10-18mm', 'Chống rung quang học IS', 'Động cơ bước STM lấy nét êm', 'Thiết kế gọn nhẹ'],
    status: 'available'
  },
  {
    id: 'asset-nikon-800',
    title: 'Ống kính siêu Tele Nikon Z 800mm f6.3 VR S',
    category: 'nikon_lens',
    pricePerDay: 600000,
    imageUrl: '/device_image/Lens Nikon Z 800mm f6.3.jpg',
    ownerName: 'Lê Hoàng Hải',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-3',
    rating: 4.9,
    location: 'Đà Nẵng',
    description: 'Ống kính Tele khủng long dòng S-Line của Nikon dành cho máy ảnh không gương lật Z. Sử dụng thấu kính PF (Phase Fresnel) giúp thu gọn đáng kể kích thước.',
    specs: ['Tiêu cự siêu Tele 800mm', 'Thân ống kính S-Line cao cấp', 'Chống rung VR tích hợp', 'Thấu kính PF siêu nhẹ'],
    status: 'available'
  },
  {
    id: 'asset-sony-2450',
    title: 'Ống kính Sony FE 24-50mm f2.8 G',
    category: 'sony_lens',
    pricePerDay: 200000,
    imageUrl: '/device_image/Lens Sony 24-50mm F2.8 G.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.7,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính zoom tiêu chuẩn gọn nhẹ nhất dòng G của Sony với khẩu độ cố định f/2.8. Mang lại độ nét xuất sắc và thiết kế vô cùng tiện lợi cho du lịch.',
    specs: ['Khẩu độ f/2.8 cố định', 'Dòng ống kính cao cấp G-lens', 'Trọng lượng chỉ 440g', 'Lấy nét bước tuyến tính kép'],
    status: 'available'
  },
  {
    id: 'asset-sony-1224',
    title: 'Ống kính góc siêu rộng Sony FE 12-24mm f4 G',
    category: 'sony_lens',
    pricePerDay: 220000,
    imageUrl: '/device_image/Lens Sony FE 12-24mm f4.jpg',
    ownerName: 'Nguyễn Minh Quân',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ownerId: 'demo-user-id',
    rating: 4.8,
    location: 'TP. Hồ Chí Minh',
    description: 'Ống kính zoom góc siêu rộng chất lượng cao ngàm E-mount của Sony. Lý tưởng chụp ảnh nội thất, phong cảnh hùng vĩ và quay video kiến trúc góc rộng.',
    specs: ['Góc nhìn cực đại 12-24mm', 'Khẩu độ cố định f/4', 'Lấy nét DDSSM nhanh tĩnh lặng', 'Lớp phủ Nano AR chống lóa'],
    status: 'available'
  },
  {
    id: 'asset-tamron-2875',
    title: 'Ống kính Tamron 28-75mm f2.8 Di III VXD G2',
    category: 'tamron_lens',
    pricePerDay: 180000,
    imageUrl: '/device_image/Lens Tamron 28-75mm f2.8.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.7,
    location: 'Hà Nội',
    description: 'Thế hệ thứ 2 của dòng ống kính bán chạy nhất của Tamron cho ngàm Sony E. Độ nét cải thiện toàn dải, động cơ lấy nét VXD siêu nhanh và êm ái.',
    specs: ['Khẩu độ f/2.8 trên dải zoom', 'Mô-tơ lấy nét tuyến tính VXD', 'Khoảng cách lấy nét gần nhất 18cm', 'Phủ lớp Fluorine kháng bẩn'],
    status: 'available'
  },
  {
    id: 'asset-tamron-1728',
    title: 'Ống kính góc rộng Tamron 17-28mm f2.8 Di III RXD',
    category: 'tamron_lens',
    pricePerDay: 150000,
    imageUrl: '/device_image/Lens Tamron 17-28mm f2.8.jpg',
    ownerName: 'Trần Thanh Sơn',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ownerId: 'user-partner-2',
    rating: 4.6,
    location: 'Hà Nội',
    description: 'Ống kính góc siêu rộng f/2.8 gọn nhẹ ngàm E-mount. Sử dụng kính lọc 67mm đồng bộ với dải ống kính Tamron giúp thay đổi bộ lọc nhanh chóng.',
    specs: ['Tiêu cự góc rộng 17-28mm', 'Khẩu độ f/2.8 cố định', 'Mô-tơ lấy nét bước RXD', 'Trọng lượng siêu nhẹ 420g'],
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
    renterId: 'user-renter-demo',
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

// Database mapping functions
const mapAssetFromDB = (a) => ({
  id: a.id,
  title: a.title,
  category: a.category,
  pricePerDay: Number(a.price_per_day),
  imageUrl: a.image_url,
  ownerName: a.owner_name,
  ownerAvatar: a.owner_avatar,
  ownerId: a.owner_id,
  rating: Number(a.rating),
  location: a.location,
  description: a.description,
  specs: a.specs,
  status: a.status
});

const mapAssetToDB = (a) => ({
  id: a.id,
  title: a.title,
  category: a.category,
  price_per_day: a.pricePerDay,
  image_url: a.imageUrl,
  owner_name: a.ownerName,
  owner_avatar: a.ownerAvatar,
  owner_id: a.ownerId,
  rating: a.rating,
  location: a.location,
  description: a.description,
  specs: a.specs,
  status: a.status
});

const mapBookingFromDB = (b) => ({
  id: b.id,
  assetId: b.asset_id,
  assetTitle: b.asset_title,
  assetImage: b.asset_image,
  pricePerDay: Number(b.price_per_day),
  startDate: b.start_date,
  endDate: b.end_date,
  totalPrice: Number(b.total_price),
  renterName: b.renter_name,
  renterContact: b.renter_contact,
  renterId: b.renter_id,
  status: b.status,
  createdAt: b.created_at
});

const mapBookingToDB = (b) => ({
  id: b.id,
  asset_id: b.assetId,
  asset_title: b.assetTitle,
  asset_image: b.assetImage,
  price_per_day: b.pricePerDay,
  start_date: b.startDate,
  end_date: b.endDate,
  total_price: b.totalPrice,
  renter_name: b.renterName,
  renter_contact: b.renterContact,
  renter_id: b.renterId,
  status: b.status,
  created_at: b.createdAt
});

const mapMessageFromDB = (m) => ({
  id: m.id,
  assetId: m.asset_id,
  assetTitle: m.asset_title,
  senderName: m.sender_name,
  text: m.text,
  timestamp: m.timestamp,
  createdAt: m.created_at
});

const mapMessageToDB = (m) => ({
  id: m.id,
  asset_id: m.assetId,
  asset_title: m.assetTitle,
  sender_name: m.senderName,
  text: m.text,
  timestamp: m.timestamp,
  created_at: m.createdAt
});

export const StoreProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);

  // Auth States
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  // Sync state helpers
  const getTableData = (table, defaults) => {
    const storageKey = `gearup_${table}`;
    const data = localStorage.getItem(storageKey);
    if (!data) {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  };

  // Initialize mock users database with default admin/staff account
  useEffect(() => {
    const usersStr = localStorage.getItem('gearup_users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    const hasAdmin = users.some(u => u.email === 'admin@gearup.vn');
    if (!hasAdmin) {
      const defaultAdmin = {
        id: 'user-admin',
        email: 'admin@gearup.vn',
        password: 'admin123',
        name: 'Trần Nguyễn Thái Tuấn (Admin)',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        isPartner: false,
        partnerStatus: null,
        isStaff: true,
        role: 'admin',
        phone: '0901234567',
        citizenId: '123456789012',
        studioName: 'GearUp Headquarters'
      };
      users.push(defaultAdmin);
      localStorage.setItem('gearup_users', JSON.stringify(users));
    }
  }, []);

  // Auth state change handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user || (session?.email ? session : null);
      if (activeUser) {
        // Retrieve partner status from local storage or real metadata
        const metadata = activeUser.user_metadata || {};
        
        // Retrieve fresh partner status from gearup_users mock database
        const usersStr = localStorage.getItem('gearup_users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        const freshUser = users.find(u => u.id === activeUser.id || u.email === activeUser.email);

        const mappedUser = {
          ...activeUser,
          id: activeUser.id || freshUser?.id || 'demo-user-id',
          email: activeUser.email,
          name: freshUser?.name || metadata.name || activeUser.email.split('@')[0],
          avatar: freshUser?.avatar || metadata.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          isPartner: freshUser?.isPartner || false,
          partnerStatus: freshUser?.partnerStatus || null,
          isStaff: freshUser?.isStaff || metadata.isStaff || activeUser.email?.toLowerCase().endsWith('@gearup.vn') || false,
          phone: freshUser?.phone || metadata.phone || '',
          citizenId: freshUser?.citizenId || metadata.citizenId || '',
          studioName: freshUser?.studioName || metadata.studioName || ''
        };

        // Cache the verified user session details
        localStorage.setItem('gearup_current_user', JSON.stringify(mappedUser));

        setUser(mappedUser);
      } else {
        localStorage.removeItem('gearup_current_user');
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch / Seed tables on user mount
  useEffect(() => {
    const fetchDB = async () => {
      let assetsFetched = null;
      let bookingsFetched = null;
      let messagesFetched = null;

      // Detect if real Supabase client is configured and try fetching
      const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
      if (isRealSupabase) {
        try {
          const { data: assetsData, error: assetsError } = await supabase.from('assets').select('*');
          if (!assetsError && assetsData) {
            assetsFetched = assetsData.map(mapAssetFromDB);
          } else if (assetsError) {
            console.log('[Supabase] Failed to fetch assets (schema might not exist yet):', assetsError.message);
          }

          const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
          if (!bookingsError && bookingsData) {
            bookingsFetched = bookingsData.map(mapBookingFromDB);
          }

          const { data: messagesData, error: messagesError } = await supabase.from('messages').select('*');
          if (!messagesError && messagesData) {
            messagesFetched = messagesData.map(mapMessageFromDB);
          }
        } catch (err) {
          console.warn('[Supabase] Database fetch error, falling back to LocalStorage:', err);
        }
      }

      // Populate state: real data if fetched, otherwise LocalStorage mock database
      if (assetsFetched && assetsFetched.length > 0) {
        setAssets(assetsFetched);
      } else {
        const localAssets = getTableData('assets', initialAssets);
        setAssets(localAssets);
      }

      if (bookingsFetched) {
        setBookings(bookingsFetched);
      } else {
        const localBookings = getTableData('bookings', initialBookings);
        setBookings(localBookings);
      }

      if (messagesFetched) {
        setMessages(messagesFetched);
      } else {
        const localMessages = getTableData('messages', initialMessages);
        setMessages(localMessages);
      }
    };
    fetchDB();
  }, [user]);



  // Auth Functions
  const signUpUser = async (email, password, name, phone = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
          }
        }
      });
      if (error) {
        return { data: null, error };
      }
      
      // Immediately insert into public.profiles table to prevent any trigger delays
      if (data?.user) {
        try {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name,
            phone,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            is_partner: false,
            citizen_id: '',
            studio_name: ''
          }]);
          console.log('[Supabase Profiles] Immediately synced profile for user:', data.user.id);
        } catch (dbErr) {
          console.warn('[Supabase Profiles] Profile immediate insert error:', dbErr);
        }
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] SignOut exception:', err);
    }
    localStorage.removeItem('gearup_current_user');
    setUser(null);
    return { error: null };
  };

  const registerPartner = async (phone, citizenId, studioName) => {
    if (!user) return { error: new Error('Vui lòng đăng nhập trước!') };
    
    const updatedUser = {
      ...user,
      isPartner: false, // Wait for platform approval
      partnerStatus: 'pending',
      phone,
      citizenId,
      studioName: studioName || `${user.name} Studio`
    };

    // Update in stored users database
    const usersData = localStorage.getItem('gearup_users');
    const users = usersData ? JSON.parse(usersData) : [];
    const updatedUsers = users.map((u) => u.id === user.id ? updatedUser : u);
    if (!users.some((u) => u.id === user.id)) {
      updatedUsers.push(updatedUser);
    }
    localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
    
    // Update active session
    localStorage.setItem('gearup_current_user', JSON.stringify(updatedUser));
    
    // If it's a real Supabase client (not mock user), update user metadata
    if (user.id && !user.id.startsWith('user-')) {
      try {
        if (supabase.auth.updateUser) {
          await supabase.auth.updateUser({
            data: {
              isPartner: false,
              partnerStatus: 'pending',
              phone,
              citizenId,
              studioName: studioName || `${user.name} Studio`
            }
          });
        }
        // Also update in profiles table on database
        await supabase.from('profiles').update({
          phone,
          citizen_id: citizenId,
          studio_name: studioName || `${user.name} Studio`,
          is_partner: false
        }).eq('id', user.id);
        console.log('[Supabase Profiles] Successfully updated partner status to pending in DB');
      } catch (e) {
        console.warn('[Supabase] Failed to update user metadata or profiles table:', e);
      }
    }
    
    setUser(updatedUser);
    return { data: updatedUser, error: null };
  };

  const approvePartner = async (userId) => {
    const usersData = localStorage.getItem('gearup_users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const approvedUser = {
          ...u,
          isPartner: true,
          partnerStatus: 'approved'
        };
        if (user && user.id === userId) {
          setUser(approvedUser);
          localStorage.setItem('gearup_current_user', JSON.stringify(approvedUser));
        }
        return approvedUser;
      }
      return u;
    });
    
    localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));

    // Real Supabase update
    if (userId && !userId.startsWith('user-')) {
      try {
        await supabase.from('profiles').update({
          is_partner: true
        }).eq('id', userId);
        console.log('[Supabase Profiles] Approved partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Failed to approve partner in DB:', err);
      }
    }

    return { error: null };
  };

  const rejectPartner = async (userId) => {
    const usersData = localStorage.getItem('gearup_users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        const rejectedUser = {
          ...u,
          isPartner: false,
          partnerStatus: 'rejected'
        };
        if (user && user.id === userId) {
          setUser(rejectedUser);
          localStorage.setItem('gearup_current_user', JSON.stringify(rejectedUser));
        }
        return rejectedUser;
      }
      return u;
    });
    
    localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));

    // Real Supabase update
    if (userId && !userId.startsWith('user-')) {
      try {
        await supabase.from('profiles').update({
          is_partner: false
        }).eq('id', userId);
        console.log('[Supabase Profiles] Rejected partner in database:', userId);
      } catch (err) {
        console.warn('[Supabase Profiles] Failed to reject partner in DB:', err);
      }
    }

    return { error: null };
  };

  // Database Functions
  const addAsset = async (newAsset) => {
    const assetRecord = {
      id: `asset-${Date.now()}`,
      rating: 5.0,
      ownerName: user?.name || 'Nguyễn Minh Quân',
      ownerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      ownerId: user?.id || 'demo-user-id',
      status: 'available',
      ...newAsset
    };
    
    const currentAssets = getTableData('assets', initialAssets);
    const updated = [assetRecord, ...currentAssets];
    localStorage.setItem('gearup_assets', JSON.stringify(updated));
    setAssets(updated);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('assets').insert([mapAssetToDB(assetRecord)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert asset:', err);
      }
    }
  };

  const updateAssetStatus = async (assetId, status) => {
    const currentAssets = getTableData('assets', initialAssets);
    const updated = currentAssets.map((a) => a.id === assetId ? { ...a, status } : a);
    localStorage.setItem('gearup_assets', JSON.stringify(updated));
    setAssets(updated);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('assets').update({ status }).eq('id', assetId);
      } catch (err) {
        console.warn('[Supabase] Failed to update asset status:', err);
      }
    }
  };

  const addBooking = async (newBooking) => {
    const bookingRecord = {
      id: `booking-${Date.now()}`,
      status: 'pending',
      renterId: user?.id || 'guest',
      createdAt: new Date().toISOString(),
      ...newBooking
    };
    
    const currentBookings = getTableData('bookings', initialBookings);
    const updated = [bookingRecord, ...currentBookings];
    localStorage.setItem('gearup_bookings', JSON.stringify(updated));
    setBookings(updated);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('bookings').insert([mapBookingToDB(bookingRecord)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert booking:', err);
      }
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    const currentBookings = getTableData('bookings', initialBookings);
    const updated = currentBookings.map((b) => b.id === bookingId ? { ...b, status } : b);
    localStorage.setItem('gearup_bookings', JSON.stringify(updated));
    setBookings(updated);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
      } catch (err) {
        console.warn('[Supabase] Failed to update booking status:', err);
      }
    }
  };

  const addMessage = async (assetId, assetTitle, senderName, text) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      assetId,
      assetTitle,
      senderName: user?.name || senderName,
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    
    const currentMessages = getTableData('messages', initialMessages);
    const updated = [...currentMessages, newMessage];
    localStorage.setItem('gearup_messages', JSON.stringify(updated));
    setMessages(updated);

    const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-url');
    if (isRealSupabase) {
      try {
        await supabase.from('messages').insert([mapMessageToDB(newMessage)]);
      } catch (err) {
        console.warn('[Supabase] Failed to insert message:', err);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        assets,
        bookings,
        messages,
        user,
        showAuthModal,
        setShowAuthModal,
        showPartnerModal,
        setShowPartnerModal,
        signUpUser,
        loginUser,
        logoutUser,
        registerPartner,
        approvePartner,
        rejectPartner,
        addAsset,
        updateAssetStatus,
        addBooking,
        updateBookingStatus,
        addMessage
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
