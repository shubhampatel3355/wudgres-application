-- Wudgres Mobile App - Pricing Rules Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- ============================================
-- PRICING RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    thickness TEXT, -- e.g., '32mm', '35mm', '38mm'
    finish TEXT, -- e.g., '1-Side', 'Both-Side', '+Membrane'
    shade TEXT, -- e.g., 'Natural Teak', 'Mahogany'
    rate NUMERIC(10, 2) NOT NULL,
    max_height TEXT, -- e.g., '87"'
    max_width TEXT, -- e.g., '44"'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Read/Write for all (Development Mode)
DROP POLICY IF EXISTS "Anyone can view pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Anyone can manage pricing rules" ON public.pricing_rules;
CREATE POLICY "Anyone can manage pricing rules" ON public.pricing_rules
    FOR ALL USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pricing_rules_series_id ON public.pricing_rules(series_id);
