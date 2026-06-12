-- Bảng Quản lý Gói Thuê Bao của người dùng (Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE, -- Mỗi user chỉ có 1 gói active tại 1 thời điểm
  tier VARCHAR NOT NULL DEFAULT 'free', -- free, silver, gold
  status VARCHAR NOT NULL DEFAULT 'active', -- active, expired, cancelled
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tắt RLS để client có thể gọi trực tiếp (như các bảng khác trong demo)
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
