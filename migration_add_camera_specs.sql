-- migration_add_camera_specs.sql
-- Run this script in your Supabase SQL Editor to add the new columns and populate existing data.

-- 1. Add new columns to the assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS mount text DEFAULT '',
ADD COLUMN IF NOT EXISTS camera_type text DEFAULT '',
ADD COLUMN IF NOT EXISTS sensor_type text DEFAULT '';

-- 2. Populate default values for existing cameras based on their category
UPDATE public.assets
SET 
  camera_type = 'Mirrorless',
  sensor_type = 'Full-frame',
  mount = CASE 
    WHEN category = 'sony_cam' THEN 'Sony E'
    WHEN category = 'canon_cam' THEN 'Canon RF'
    WHEN category = 'nikon_cam' THEN 'Nikon Z'
    WHEN category = 'fuji_cam' THEN 'Fujifilm X'
    ELSE ''
  END
WHERE camera_type = '' AND category LIKE '%_cam';

-- 3. Populate default mount for existing lenses
UPDATE public.assets
SET 
  mount = CASE 
    WHEN category = 'sony_lens' THEN 'Sony E'
    WHEN category = 'canon_lens' THEN 'Canon RF'
    WHEN category = 'nikon_lens' THEN 'Nikon Z'
    WHEN category = 'fuji_lens' THEN 'Fujifilm X'
    ELSE ''
  END
WHERE mount = '' AND category LIKE '%_lens';
