-- Wudgres Mobile App - Supabase Database Schema
-- Version: 1.0
-- 
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure parent_id exists if the table was already created in an older version
ALTER TABLE IF EXISTS public.series ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.series(id) ON DELETE CASCADE;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    description TEXT,
    thickness TEXT,
    height TEXT,
    width TEXT,
    finish TEXT,
    usage TEXT,
    type TEXT,
    veneers TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure is_active exists if the table was already created
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- VENEER OPTIONS TABLE (for products with veneer choices)
-- ============================================
CREATE TABLE IF NOT EXISTS public.veneer_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veneer_options ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories: Read/Write for all (Development Mode)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;
CREATE POLICY "Anyone can manage categories" ON public.categories
    FOR ALL USING (true);

-- Series: Read/Write for all (Development Mode)
DROP POLICY IF EXISTS "Anyone can view series" ON public.series;
DROP POLICY IF EXISTS "Anyone can manage series" ON public.series;
CREATE POLICY "Anyone can manage series" ON public.series
    FOR ALL USING (true);

-- Products: Read/Write for all (Development Mode)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can manage products" ON public.products;
CREATE POLICY "Anyone can manage products" ON public.products
    FOR ALL USING (true);

-- Veneer Options: Read/Write for all (Development Mode)
DROP POLICY IF EXISTS "Anyone can view veneer options" ON public.veneer_options;
DROP POLICY IF EXISTS "Anyone can manage veneer options" ON public.veneer_options;
CREATE POLICY "Anyone can manage veneer options" ON public.veneer_options
    FOR ALL USING (true);

-- ============================================
-- ADMIN POLICIES (for service role/admin)
-- ============================================
-- Note: These allow full access when using the service_role key
-- DO NOT expose the service_role key in client apps

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_series_category_id ON public.series(category_id);
CREATE INDEX IF NOT EXISTS idx_products_series_id ON public.products(series_id);
CREATE INDEX IF NOT EXISTS idx_veneer_options_product_id ON public.veneer_options(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(order_index);
CREATE INDEX IF NOT EXISTS idx_series_order ON public.series(order_index);
CREATE INDEX IF NOT EXISTS idx_products_order ON public.products(order_index);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, order_index) VALUES
    ('Doors', 'doors', 1),
    ('Eng. Wood Frames', 'eng-wood-frames', 2),
    ('Plywood', 'plywood', 3)
ON CONFLICT (slug) DO NOTHING;

-- Cleanup old incorrect series from previous iterations
DELETE FROM public.series WHERE slug = 'timbor-acacia';

-- Insert parent series
INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Timbor', 'timbor', 1, 'Precision-treated timber engineered to resist decay, termites, and fire.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Ven Decor', 'ven-decor', 2, 'Hand-selected natural wood veneers with luxury finishes.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Teak Veneer', 'teak-veneer', 3, 'Authentic tropical teak hardwood with golden grain and natural oils.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Lamorous', 'lamorous', 4, 'Artistic laminate designs blending nature with luxury surfaces.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Metalem', 'metalem', 5, 'High-grade steel doors and frames for security and sleek aesthetics.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Espial', 'espial', 6, 'Pressure-impregnated eco-safe timber resisting decay, termites and flame.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Divine', 'divine', 7, 'Sustainably sourced timber with natural fire-retardant infusion.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Embozz', 'embozz', 8, 'CNC precision-carved sculptured timber doors with deep tactile reliefs.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Lamina', 'lamina', 9, 'Ultra-thin laminations with satin-brushed finishes for modern interiors.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Solid White', 'solid-white', 10, 'White primed doors blending minimal aesthetics with robust performance.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.series (category_id, name, slug, order_index, description)
SELECT c.id, 'Flush Doors', 'flush-doors', 11, 'Classic flush door construction for standard residential and commercial use.' FROM public.categories c WHERE c.slug = 'doors' ON CONFLICT (slug) DO NOTHING;

-- Insert sub-series
-- Ven Decor Sub-Series
INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Ven Decor Legend', 'ven-decor-legend', 1, 'Timeless artistry, elegance and grandeur.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'ven-decor' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Ven Decor Lavish', 'ven-decor-lavish', 2, 'Warmth, prestige, lavish modern appeal.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'ven-decor' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Ven Decor Elite', 'ven-decor-elite', 3, 'Pinnacle of refinement, strength meets style.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'ven-decor' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Ven Decor Rich', 'ven-decor-rich', 4, 'Bold grains, depth, warmth and character.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'ven-decor' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

-- Lamorous Sub-Series
INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamorous Elite', 'lamorous-elite', 1, 'Bold imagination, timeless elegance.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamorous' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamorous Rich', 'lamorous-rich', 2, 'Real wood feel, warmth and authenticity.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamorous' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamorous Prime', 'lamorous-prime', 3, 'Infinite surface, seamless beauty, refined quality.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamorous' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamorous Eco', 'lamorous-eco', 4, 'Natural grains, harmony, authenticity and durability.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamorous' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

-- Lamina Sub-Series
INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamina Rich', 'lamina-rich', 1, 'Brass accents with faux wood grains, timeless charm.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamina' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Lamina Eco', 'lamina-eco', 2, 'Natural texture, lightweight elegance, durable finish.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'lamina' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

-- Solid White Sub-Series
INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Solid White Rich', 'solid-white-rich', 1, 'Elite purity, precision-crafted, ageless grandeur.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'solid-white' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

INSERT INTO public.series (category_id, parent_id, name, slug, order_index, description)
SELECT c.id, s.id, 'Solid White Eco', 'solid-white-eco', 2, 'Versatile white finish, sturdy and refined.'
FROM public.categories c, public.series s WHERE c.slug = 'doors' AND s.slug = 'solid-white' ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, description = EXCLUDED.description;

-- ============================================
-- STORAGE BUCKET (Run in Supabase Dashboard)
-- ============================================
-- Create a bucket called 'products' for storing product images
-- Make it public for read access
-- 
-- In Supabase Dashboard > Storage > New Bucket:
-- Name: products
-- Public: Yes
