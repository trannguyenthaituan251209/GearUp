-- ==========================================
-- 🛠️ DATABASE SCHEMA & SEED DATA - GEARUP
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Profiles Table (nâng cấp từ auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  is_partner BOOLEAN DEFAULT FALSE,
  phone TEXT,
  citizen_id TEXT,
  studio_name TEXT
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả mọi người đọc profile" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Cho phép người dùng cập nhật profile chính họ" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Cho phép người dùng chèn profile chính họ" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Create Assets Table (Danh sách thiết bị cho thuê)
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_day INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_avatar TEXT,
  owner_id TEXT NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  specs TEXT[] NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép xem danh sách thiết bị công khai" ON public.assets
  FOR SELECT USING (true);

CREATE POLICY "Cho phép đối tác tạo thiết bị của họ" ON public.assets
  FOR INSERT WITH CHECK (true); -- Trong môi trường thực tế, kiểm tra auth.uid() = owner_id

CREATE POLICY "Cho phép đối tác cập nhật thiết bị của họ" ON public.assets
  FOR UPDATE USING (true);


-- 3. Create Bookings Table (Quản lý đơn thuê thiết bị)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  asset_title TEXT NOT NULL,
  asset_image TEXT,
  price_per_day INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  renter_name TEXT NOT NULL,
  renter_contact TEXT NOT NULL,
  renter_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc đơn hàng liên quan" ON public.bookings
  FOR SELECT USING (true); -- Trong thực tế, chỉ cho phép renter hoặc owner của asset

CREATE POLICY "Cho phép tạo đơn hàng thuê mới" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Cho phép cập nhật trạng thái đơn hàng" ON public.bookings
  FOR UPDATE USING (true);


-- 4. Create Messages Table (Hộp thư trò chuyện)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  asset_title TEXT NOT NULL,
  sender_id TEXT,
  receiver_id TEXT,
  customer_id TEXT,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc tin nhắn của chính mình" ON public.messages
  FOR SELECT USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);

CREATE POLICY "Cho phép gửi tin nhắn mới" ON public.messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id);


-- ==========================================
-- 🌱 SEED DATA: ĐỐI TÁC VÀ SẢN PHẨM KHAI THÁC TỪ THƯ MỤC DEVICE_IMAGE
-- ==========================================

-- Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại script
DELETE FROM public.assets;

-- Đăng ký sản phẩm cho thuê
INSERT INTO public.assets 
(id, title, category, price_per_day, image_url, owner_name, owner_avatar, owner_id, rating, location, description, specs, status)
VALUES
(
  'asset-canon-6d', 
  'Máy ảnh Canon EOS 6D Mark II', 
  'canon_cam', 
  400000, 
  '/device_image/Canon EOS 6D Mark II.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.90, 
  'TP. Hồ Chí Minh', 
  'Canon 6D Mark II chuyên nghiệp, cảm biến Full-frame 26.2MP, bộ xử lý hình ảnh DIGIC 7. Thích hợp chụp chân dung, phong cảnh và sự kiện.', 
  ARRAY['26.2 Megapixels', 'Cảm biến Full-Frame', 'Dual Pixel CMOS AF', 'Màn hình xoay lật xoay cảm ứng'], 
  'available'
),
(
  'asset-fuji-xs20', 
  'Máy ảnh Fujifilm X-S20 Body', 
  'fuji_cam', 
  350000, 
  '/device_image/Fujifilm X-S20.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.80, 
  'Hà Nội', 
  'Fujifilm X-S20 hỗ trợ quay 6.2K, giả lập màu phim đỉnh cao, chống rung IBIS 7.0 stops, cực kì thích hợp cho các vlogger và travel creator.', 
  ARRAY['Quay phim 6.2K/30p', 'Chống rung IBIS 7 stops', 'Pin NP-W235 dung lượng cao', '19 Chế độ màu phim'], 
  'available'
),
(
  'asset-canon-2470', 
  'Ống kính Canon FE 24-70mm f2.8L II USM', 
  'canon_lens', 
  280000, 
  '/device_image/Lens Canon FE 24-70mm f2.8L II USM.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.90, 
  'TP. Hồ Chí Minh', 
  'Ống kính zoom đa dụng thuộc dòng L cao cấp của Canon, khẩu độ cố định f/2.8 cho độ nét vượt trội trên toàn dải tiêu cự. Phù hợp cho mọi thể loại ảnh.', 
  ARRAY['Khẩu độ f/2.8', 'Dòng ống kính cao cấp L-series', 'Mô-tơ lấy nét USM siêu nhanh', 'Kháng bụi và giọt bắn'], 
  'available'
),
(
  'asset-nikon-zfc', 
  'Máy ảnh Nikon Z FC + Lens kit', 
  'nikon_cam', 
  300000, 
  '/device_image/Nikon Z FC.jpg', 
  'Lê Hoàng Hải', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'user-partner-3', 
  4.70, 
  'Đà Nẵng', 
  'Nikon Z fc mang phong cách hoài cổ retro lấy cảm hứng từ dòng máy phim FM2 huyền thoại. Cảm biến DX 20.9MP, kết nối SnapBridge tiện lợi.', 
  ARRAY['Phong cách retro cổ điển', 'Cảm biến DX 20.9MP', 'Màn hình cảm ứng lật xoay', 'Quay phim 4K UHD'], 
  'available'
),
(
  'asset-fuji-xt50', 
  'Máy ảnh Fujifilm X-T50 Body', 
  'fuji_cam', 
  380000, 
  '/device_image/Fujifilm XT50.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.80, 
  'Hà Nội', 
  'Fujifilm X-T50 sở hữu cảm biến 40.2MP X-Trans CMOS 5 HR thế hệ mới nhất, bộ chọn nhanh giả lập màu phim trên thân máy cực kì độc đáo.', 
  ARRAY['Cảm biến 40.2 Megapixels', 'X-Processor 5 thông minh', 'Chống rung IBIS 7.0 stops', 'Vòng xoay chọn màu phim chuyên biệt'], 
  'available'
),
(
  'asset-sony-100400', 
  'Ống kính Sony FE 100-400mm f4.5-f5.6 GM OSS', 
  'sony_lens', 
  480000, 
  '/device_image/Len Sony FE 100-400mm f4.5-f5.6 GM OSS.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.90, 
  'TP. Hồ Chí Minh', 
  'Ống kính zoom siêu tele dòng G Master cao cấp của Sony. Chống rung quang học SteadyShot tích hợp, lấy nét DDSSM siêu nhanh thích hợp chụp thể thao, chim thú.', 
  ARRAY['Zoom siêu tele 100-400mm', 'Dòng ống kính cao cấp G Master', 'Chống rung OSS tích hợp', 'Lấy nét siêu nhanh DDSSM'], 
  'available'
),
(
  'asset-sigma-30', 
  'Ống kính Sigma 30mm f1.4 DC DN', 
  'sigma_lens', 
  120000, 
  '/device_image/Lens Sigma 30mm f 1.4.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.70, 
  'Hà Nội', 
  'Ống kính khẩu lớn f/1.4 của Sigma dành cho hệ máy APS-C. Cho bokeh xóa phông mịt mù, độ sắc nét cao ngay tại khẩu lớn nhất. Lý tưởng để chụp chân dung.', 
  ARRAY['Khẩu độ siêu lớn f/1.4', 'Tiêu cự tương đương 45mm', 'Thiết kế nhỏ gọn nhẹ', 'Bokeh tròn mịn màng'], 
  'available'
),
(
  'asset-canon-m50', 
  'Máy ảnh Canon EOS M50 Mark II', 
  'canon_cam', 
  250000, 
  '/device_image/Canon EOS M50 Mark II.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.60, 
  'TP. Hồ Chí Minh', 
  'Canon M50 Mark II nhỏ gọn, lấy nét mắt cực nhanh, tích hợp cổng micro 3.5mm cho vlogging. Thiết bị quay YouTube và livestream tuyệt vời.', 
  ARRAY['24.1 Megapixels APS-C', 'Quay phim 4K UHD', 'Dual Pixel CMOS AF', 'Hỗ trợ livestream trực tiếp'], 
  'available'
),
(
  'asset-canon-r50', 
  'Máy ảnh Canon EOS R50 Mirrorless', 
  'canon_cam', 
  280000, 
  '/device_image/Canon EOS R50.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.70, 
  'TP. Hồ Chí Minh', 
  'Dòng máy ảnh ngàm RF nhỏ nhẹ nhất của Canon, trang bị cảm biến APS-C 24.2MP cùng hệ thống Dual Pixel AF II lấy nét cực nhạy.', 
  ARRAY['24.2 Megapixels', 'Lấy nét Dual Pixel AF II', 'Quay phim 4K 30p (không crop)', 'Chụp liên tiếp 15 hình/s'], 
  'available'
),
(
  'asset-fuji-xh2s', 
  'Máy ảnh Fujifilm X-H2S Body', 
  'fuji_cam', 
  500000, 
  '/device_image/Fujifilm XH2S.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.90, 
  'Hà Nội', 
  'Fujifilm X-H2S hiệu năng cực cao, cảm biến X-Trans CMOS 5 Stacked 26.1MP chụp 40 hình/s, quay ProRes 10-bit 4:2:2 trực tiếp vào thẻ nhớ.', 
  ARRAY['Cảm biến Stacked CMOS', 'Chụp liên tiếp 40 hình/s', 'Quay phim 6.2K 30p & 4K 120p', 'Hỗ trợ Apple ProRes'], 
  'available'
),
(
  'asset-fuji-x100v', 
  'Máy ảnh Fujifilm X100VI (Bản đặc biệt)', 
  'fuji_cam', 
  400000, 
  '/device_image/Fujifilm X100ViI.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.90, 
  'Hà Nội', 
  'Fujifilm X100VI với ống kính tiêu cự cố định 23mm f/2, cảm biến 40.2MP, tích hợp chống rung IBIS 6.0 stops. Máy ảnh đường phố được săn đón nhất.', 
  ARRAY['Cảm biến 40.2 Megapixels', 'Ống kính cố định 23mm f/2', 'Chống rung IBIS 6 stops', 'Kính ngắm lai độc quyền'], 
  'available'
),
(
  'asset-nikon-d3500', 
  'Máy ảnh DSLR Nikon D3500 + Lens Kit', 
  'nikon_cam', 
  150000, 
  '/device_image/Nikon D3500.jpg', 
  'Lê Hoàng Hải', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'user-partner-3', 
  4.50, 
  'Đà Nẵng', 
  'Nikon D3500 là chiếc DSLR quốc dân cho người mới bắt đầu. Thao tác cực kỳ trực quan, thời lượng pin siêu bền chụp được hơn 1500 tấm hình một lần sạc.', 
  ARRAY['24.2 Megapixels APS-C', 'Pin dung lượng siêu trâu', 'Chế độ hướng dẫn (Guide Mode)', 'Trọng lượng siêu nhẹ'], 
  'available'
),
(
  'asset-nikon-d7200', 
  'Máy ảnh DSLR Nikon D7200 Body', 
  'nikon_cam', 
  220000, 
  '/device_image/Nikon D7200.jpg', 
  'Lê Hoàng Hải', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'user-partner-3', 
  4.70, 
  'Đà Nẵng', 
  'Nikon D7200 dòng bán chuyên nghiệp (Semi-Pro) với hệ thống lấy nét 51 điểm Multi-CAM, cảm biến 24.2MP loại bỏ bộ lọc OLPF cho ảnh siêu nét.', 
  ARRAY['Lấy nét 51 điểm AF', 'Thân máy kháng thời tiết', '2 khe cắm thẻ nhớ SD', 'Không có bộ lọc OLPF'], 
  'available'
),
(
  'asset-olympus-omd', 
  'Máy ảnh Olympus OM-D E-M10 Mark IV', 
  'olympus_cam', 
  250000, 
  '/device_image/Olympus-OM-D.jpg', 
  'Lê Hoàng Hải', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'user-partner-3', 
  4.60, 
  'Đà Nẵng', 
  'Olympus OM-D thiết kế siêu nhỏ gọn hoài cổ ngàm M4/3, hệ thống chống rung 5 trục trong thân máy cực kì mạnh mẽ cho ảnh sắc nét dù chụp cầm tay.', 
  ARRAY['Cảm biến Micro Four Thirds', 'Chống rung 5 trục IBIS', 'Thiết kế hoài cổ siêu nhẹ', 'Màn hình lật 180 độ selfie'], 
  'available'
),
(
  'asset-canon-50', 
  'Ống kính chân dung Canon EF 50mm f1.2L USM', 
  'canon_lens', 
  180000, 
  '/device_image/Lens Canon EF 50mm f1.2L DSLR.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.80, 
  'TP. Hồ Chí Minh', 
  'Huyền thoại ống kính chân dung tiêu cự 50mm dòng L cao cấp. Khẩu độ siêu mở f/1.2 tạo hiệu ứng xóa phông lung linh, mượt mà và chụp tối cực tốt.', 
  ARRAY['Khẩu độ siêu lớn f/1.2', 'Thấu kính kính phi cầu lớn', 'Mô-tơ siêu âm USM lấy nét', 'Dòng L chuyên nghiệp'], 
  'available'
),
(
  'asset-canon-1018', 
  'Ống kính góc siêu rộng Canon EF-S 10-18mm', 
  'canon_lens', 
  100000, 
  '/device_image/Lens Canon EF-S 10-18mm.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.50, 
  'TP. Hồ Chí Minh', 
  'Ống kính góc rộng giá rẻ dành cho cảm biến APS-C của Canon. Thích hợp chụp kiến trúc, phong cảnh và quay video vlog trong không gian hẹp.', 
  ARRAY['Tiêu cự góc rộng 10-18mm', 'Chống rung quang học IS', 'Động cơ bước STM lấy nét êm', 'Thiết kế gọn nhẹ'], 
  'available'
),
(
  'asset-nikon-800', 
  'Ống kính siêu Tele Nikon Z 800mm f6.3 VR S', 
  'nikon_lens', 
  600000, 
  '/device_image/Lens Nikon Z 800mm f6.3.jpg', 
  'Lê Hoàng Hải', 
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'user-partner-3', 
  4.90, 
  'Đà Nẵng', 
  'Ống kính Tele khủng long dòng S-Line của Nikon dành cho máy ảnh không gương lật Z. Sử dụng thấu kính PF (Phase Fresnel) giúp thu gọn đáng kể kích thước.', 
  ARRAY['Tiêu cự siêu Tele 800mm', 'Thân ống kính S-Line cao cấp', 'Chống rung VR tích hợp', 'Thấu kính PF siêu nhẹ'], 
  'available'
),
(
  'asset-sony-2450', 
  'Ống kính Sony FE 24-50mm f2.8 G', 
  'sony_lens', 
  200000, 
  '/device_image/Lens Sony 24-50mm F2.8 G.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.70, 
  'TP. Hồ Chí Minh', 
  'Ống kính zoom Sony FE 24-50mm F2.8 G. Mang lại độ nét xuất sắc và thiết kế vô cùng tiện lợi cho du lịch.', 
  ARRAY['Khẩu độ f/2.8 cố định', 'Dòng ống kính cao cấp G-lens', 'Trọng lượng chỉ 440g', 'Lấy nét bước tuyến tính kép'], 
  'available'
),
(
  'asset-sony-1224', 
  'Ống kính góc siêu rộng Sony FE 12-24mm f4 G', 
  'sony_lens', 
  220000, 
  '/device_image/Lens Sony FE 12-24mm f4.jpg', 
  'Nguyễn Minh Quân', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'demo-user-id', 
  4.80, 
  'TP. Hồ Chí Minh', 
  'Ống kính zoom góc siêu rộng chất lượng cao ngàm E-mount của Sony. Lý tưởng chụp ảnh nội thất, phong cảnh hùng vĩ và quay video khái quát kiến trúc góc rộng.', 
  ARRAY['Góc nhìn cực đại 12-24mm', 'Khẩu độ cố định f/4', 'Lấy nét DDSSM nhanh tĩnh lặng', 'Lớp phủ Nano AR chống lóa'], 
  'available'
),
(
  'asset-tamron-2875', 
  'Ống kính Tamron 28-75mm f2.8 Di III VXD G2', 
  'tamron_lens', 
  180000, 
  '/device_image/Lens Tamron 28-75mm f2.8.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.70, 
  'Hà Nội', 
  'Thế hệ thứ 2 của dòng ống kính bán chạy nhất của Tamron cho ngàm Sony E. Độ nét cải thiện toàn dải, động cơ lấy nét VXD siêu nhanh và êm ái.', 
  ARRAY['Khẩu độ f/2.8 trên dải zoom', 'Mô-tơ lấy nét tuyến tính VXD', 'Khoảng cách lấy nét gần nhất 18cm', 'Phủ lớp Fluorine kháng bẩn'], 
  'available'
),
(
  'asset-tamron-1728', 
  'Ống kính góc rộng Tamron 17-28mm f2.8 Di III RXD', 
  'tamron_lens', 
  150000, 
  '/device_image/Lens Tamron 17-28mm f2.8.jpg', 
  'Trần Thanh Sơn', 
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'user-partner-2', 
  4.60, 
  'Hà Nội', 
  'Ống kính góc siêu rộng f/2.8 gọn nhẹ ngàm E-mount. Sử dụng kính lọc 67mm đồng bộ với dải ống kính Tamron giúp thay đổi bộ lọc nhanh chóng.', 
  ARRAY['Tiêu cự góc rộng 17-28mm', 'Khẩu độ f/2.8 cố định', 'Mô-tơ lấy nét bước RXD', 'Trọng lượng siêu nhẹ 420g'], 
  'available'
);
