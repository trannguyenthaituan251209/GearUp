-- Migration: Thêm bảng favorites và notifications

-- 1. Bảng Favorites (Yêu thích)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  asset_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tắt RLS cho favorites (dễ dàng insert/select từ client)
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;

-- 2. Bảng Notifications (Thông báo)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'system', -- system, promotion, message
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tắt RLS cho notifications
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Tạo một vài thông báo mẫu cho user đang đăng nhập (user_id của Admin/User hiện tại thường là email hoặc username)
-- Thay đổi 'user_id' thành ID thực tế nếu bạn muốn nhắm đúng mục tiêu, hoặc chèn cho mọi người dùng (Demo).
-- Ở đây tôi chèn sẵn một thông báo toàn hệ thống (user_id = 'all') để mọi user đều thấy
INSERT INTO public.notifications (user_id, title, message, type)
VALUES 
  ('all', 'Chào mừng bạn đến với GearUp! 🎉', 'Khám phá hàng ngàn thiết bị quay phim, chụp ảnh chất lượng cao đang chờ đón bạn.', 'system'),
  ('all', 'Khuyến mãi Khai trương 🎁', 'Nhập mã GEARUP20 để được giảm giá 20% cho lần thuê đầu tiên.', 'promotion'),
  ('all', 'Cập nhật tính năng mới 🚀', 'Bạn đã có thể theo dõi tiến độ thuê thiết bị ngay trên bảng điều khiển. Trải nghiệm ngay!', 'system');
