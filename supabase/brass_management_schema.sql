-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the brass_settings table
CREATE TABLE IF NOT EXISTS public.brass_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brass_dome_price NUMERIC NOT NULL DEFAULT 0,
    hrztl_pcs_brass_domes_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row can exist (singleton table)
CREATE UNIQUE INDEX IF NOT EXISTS brass_settings_single_row ON public.brass_settings ((1));

-- Insert the default configuration row if it doesn't exist
INSERT INTO public.brass_settings (brass_dome_price, hrztl_pcs_brass_domes_price)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.brass_settings);

-- Add brass_dome_enabled and hrztl_pcs_enabled to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brass_dome_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS hrztl_pcs_enabled BOOLEAN NOT NULL DEFAULT true;

-- Remove the old brass_enabled column if it exists from previous attempt
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='brass_enabled') THEN
        ALTER TABLE public.products DROP COLUMN brass_enabled;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.brass_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for brass_settings
-- Anyone can read the brass_settings
CREATE POLICY "Enable read access for all users on brass_settings" 
ON public.brass_settings FOR SELECT 
USING (true);

-- Only authenticated users (admins) can update the brass_settings
CREATE POLICY "Enable update access for authenticated users on brass_settings" 
ON public.brass_settings FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can insert (though there should only be one row)
CREATE POLICY "Enable insert access for authenticated users on brass_settings" 
ON public.brass_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
