-- Frame Dimensions Table
-- Stores the configurable table rows for Frame Dimension sections
-- across NFC Frames, Window Shutters, and Engineered Wood Frames screens.

CREATE TABLE IF NOT EXISTS public.frame_dimensions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    series_slug TEXT NOT NULL,        -- 'nfc-frames' | 'window-shutters' | 'eng-wood-frames'
    description TEXT NOT NULL,        -- First column: e.g. "FRAME SECTION 75X50"
    col2 TEXT,                        -- Second column value
    col3 TEXT,                        -- Third column value
    col4 TEXT,                        -- Fourth column value (Engineered Wood only)
    col5 TEXT,                        -- Fifth column value (Engineered Wood only)
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Allow public read (mobile app fetches without auth)
ALTER TABLE public.frame_dimensions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read frame_dimensions" ON public.frame_dimensions;
CREATE POLICY "Public can read frame_dimensions"
  ON public.frame_dimensions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage frame_dimensions" ON public.frame_dimensions;
CREATE POLICY "Admins can manage frame_dimensions"
  ON public.frame_dimensions FOR ALL USING (true) WITH CHECK (true);
