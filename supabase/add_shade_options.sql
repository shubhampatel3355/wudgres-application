-- Add shade options to series and products tables
ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS allowed_shades TEXT;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS shade TEXT;
