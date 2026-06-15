-- Thêm cột status vào bảng messages để hỗ trợ tính năng Đã xem
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';

-- Cho phép update tin nhắn (chuyển status thành seen)
DROP POLICY IF EXISTS "Cho phép cập nhật trạng thái tin nhắn" ON public.messages;
CREATE POLICY "Cho phép cập nhật trạng thái tin nhắn" ON public.messages
  FOR UPDATE USING (
    auth.uid()::text = receiver_id
  );
