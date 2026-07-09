-- ============================================
-- Fix Profiles Table RLS Policy
-- Run this in your Supabase SQL Editor
-- ============================================

-- Disable RLS on profiles to allow the Admin Dashboard to fetch users easily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions just in case
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
