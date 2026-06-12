-- Thêm cột general_policy vào bảng profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS general_policy TEXT;

-- Thêm cột specific_policy vào bảng assets
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS specific_policy TEXT;
