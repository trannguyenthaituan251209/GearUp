-- 1. Create the contracts bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files in the contracts bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'contracts' );

-- 3. Allow authenticated users to upload files to the contracts bucket
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'contracts' AND auth.role() = 'authenticated' );

-- 4. Add contract_url column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS contract_url TEXT;
