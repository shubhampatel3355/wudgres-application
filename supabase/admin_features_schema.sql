-- ============================================
-- Wudgres Admin Features Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. UPDATE PROFILES TABLE
-- Add fields for Expo push notifications and Admin roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );

-- 2. DEALERS TABLE (Store Locator)
CREATE TABLE IF NOT EXISTS public.dealers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_name TEXT NOT NULL,
    owner_name TEXT,
    contact TEXT,
    address TEXT,
    pincode TEXT,
    google_maps_url TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dealers" ON public.dealers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dealers" ON public.dealers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );

-- 3. INQUIRIES TABLE (Leads)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'New', -- New, Contacted, Converted, Closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true); -- Allow anonymous inquiries

CREATE POLICY "Users can view their own inquiries" ON public.inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage inquiries" ON public.inquiries
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );

-- 4. PUSH NOTIFICATIONS LOG (Optional: to track sent messages)
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
);

ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications" ON public.push_notifications
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );

CREATE POLICY "Admins can insert notifications" ON public.push_notifications
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE is_admin = true
        )
    );
