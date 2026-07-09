-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wishlist items
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlists;
CREATE POLICY "Users can view their own wishlist" ON public.wishlists
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own wishlist items
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlists;
CREATE POLICY "Users can insert their own wishlist items" ON public.wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own wishlist items
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlists;
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
