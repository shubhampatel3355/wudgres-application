-- Add rich content columns to app_category_images
ALTER TABLE app_category_images 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_source TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS pricing_data JSONB DEFAULT '[]'::jsonb;
