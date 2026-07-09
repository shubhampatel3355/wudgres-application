-- ============================================
-- Explicitly Grant Permissions
-- Run this in your Supabase SQL Editor
-- ============================================

-- Ensure the anon and authenticated roles have access
GRANT ALL ON public.dealers TO anon;
GRANT ALL ON public.dealers TO authenticated;

-- Force PostgREST schema cache reload (sometimes needed after RLS changes)
NOTIFY pgrst, 'reload schema';
