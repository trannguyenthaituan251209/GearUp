-- Xóa toàn bộ dữ liệu tin nhắn cũ do cấu trúc bị lỗi (leakage)
DELETE FROM public.messages;

-- Thêm các cột cần thiết cho việc phân luồng và bảo mật
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_id TEXT,
ADD COLUMN IF NOT EXISTS receiver_id TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Xóa policy cũ
DROP POLICY IF EXISTS "Cho phép đọc tin nhắn liên quan" ON public.messages;
DROP POLICY IF EXISTS "Cho phép gửi tin nhắn mới" ON public.messages;

-- Cập nhật RLS Policies mới cho messages
-- User chỉ được phép đọc tin nhắn nếu user là người gửi (sender_id) hoặc người nhận (receiver_id)
-- Để cho phép Admin CSKH đọc tất cả, chúng ta có thể kiểm tra thêm role nếu cần, 
-- nhưng hiện tại cứ mở nếu sender_id hoặc receiver_id khớp với user hiện tại.
CREATE POLICY "Cho phép đọc tin nhắn của chính mình" ON public.messages
  FOR SELECT USING (
    auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
  );

CREATE POLICY "Cho phép gửi tin nhắn mới" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
  );
