-- ============================================
-- Fix RLS Policies for Admin Dashboard
-- Run this in your Supabase SQL Editor
-- ============================================

-- Disable RLS on tables managed by the Admin Dashboard
ALTER TABLE public.push_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.series DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.veneer_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules DISABLE ROW LEVEL SECURITY;

-- Grant permissions just in case
GRANT ALL ON public.push_notifications TO anon, authenticated;
GRANT ALL ON public.inquiries TO anon, authenticated;
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.series TO anon, authenticated;
GRANT ALL ON public.veneer_options TO anon, authenticated;
GRANT ALL ON public.pricing_rules TO anon, authenticated;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
