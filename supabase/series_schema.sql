-- Add dynamic dimension attributes to the series table
ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS allowed_thicknesses TEXT,
ADD COLUMN IF NOT EXISTS allowed_heights TEXT,
ADD COLUMN IF NOT EXISTS allowed_widths TEXT;
