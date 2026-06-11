CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id TEXT NOT NULL,
  booking_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_rating INTEGER NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
  equipment_rating INTEGER NOT NULL CHECK (equipment_rating >= 1 AND equipment_rating <= 5),
  average_rating NUMERIC(3, 1) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone." 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own reviews." 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews." 
  ON public.reviews FOR UPDATE 
  USING (auth.uid() = user_id);
