-- Thêm cột bio vào bảng profiles nếu chưa có
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Bơm dữ liệu (mô tả) mặc định cho các tài khoản đang là đối tác (partner)
UPDATE public.profiles
SET bio = 'Xin chào! Chúng tôi là cửa hàng chuyên cung cấp và cho thuê các thiết bị quay chụp chuyên nghiệp. Cam kết thiết bị luôn trong tình trạng hoạt động tốt nhất, bảo dưỡng định kỳ và hỗ trợ tư vấn nhiệt tình cho khách hàng.'
WHERE role = 'partner' OR partner_status = 'approved';

-- Nếu bạn muốn bơm cho TẤT CẢ mọi người (bao gồm cả user bình thường nếu họ lỡ có thiết bị)
-- UPDATE public.profiles
-- SET bio = 'Thành viên thân thiết của GearUp. Chuyên chia sẻ và cho thuê các thiết bị nhiếp ảnh chất lượng cao.'
-- WHERE bio IS NULL;
