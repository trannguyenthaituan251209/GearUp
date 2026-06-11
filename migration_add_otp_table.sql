-- migration_add_otp_table.sql
-- Chạy script này trong Supabase SQL Editor để tạo bảng lưu OTP

CREATE TABLE IF NOT EXISTS public.otp_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Bật RLS
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả mọi người (kể cả chưa đăng nhập) insert, select và update bảng này để phục vụ luồng Forgot Password
CREATE POLICY "Allow public insert on otp_requests" ON public.otp_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on otp_requests" ON public.otp_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow public update on otp_requests" ON public.otp_requests
  FOR UPDATE USING (true);
