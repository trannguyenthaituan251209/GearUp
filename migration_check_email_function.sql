-- migration_check_email_function.sql
-- Chạy script này trong Supabase SQL Editor để tạo hàm kiểm tra email tồn tại

CREATE OR REPLACE FUNCTION check_email_exists(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Cho phép hàm này chạy với quyền admin để có thể đọc bảng auth.users
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = check_email);
END;
$$;
