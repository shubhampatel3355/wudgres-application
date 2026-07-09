-- ============================================
-- NUCLEAR FIX: Disable RLS on dealers table
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop ALL existing policies on dealers
DROP POLICY IF EXISTS "Anyone can view dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can manage dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can view dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can insert dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can update dealers" ON public.dealers;
DROP POLICY IF EXISTS "Admins can delete dealers" ON public.dealers;

-- Disable RLS entirely on dealers (store locations are public data)
ALTER TABLE public.dealers DISABLE ROW LEVEL SECURITY;

-- Verify data is there
SELECT COUNT(*) as total_dealers FROM public.dealers;
