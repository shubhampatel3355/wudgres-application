-- ============================================
-- Fix Dealers Table RLS Policy
-- Run this in your Supabase SQL Editor
-- ============================================

-- Allow anyone to read dealers (store locations are public info)
DROP POLICY IF EXISTS "Anyone can view dealers" ON public.dealers;
CREATE POLICY "Anyone can view dealers" ON public.dealers
    FOR SELECT USING (true);

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "Admins can manage dealers" ON public.dealers;
CREATE POLICY "Admins can manage dealers" ON public.dealers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );
