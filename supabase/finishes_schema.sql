-- Create finishes table
CREATE TABLE IF NOT EXISTS public.finishes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.finishes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to finishes
CREATE POLICY "Finishes are viewable by everyone" ON public.finishes FOR SELECT USING (true);

-- Allow authenticated users to manage finishes
CREATE POLICY "Finishes are manageable by authenticated users" ON public.finishes FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial hardcoded values from PricingManager
INSERT INTO public.finishes (name, description) VALUES
('1-Side', 'Front face design only, back is plain'),
('+Membrane', 'Front design + thin membrane on back (Max 87"×44")'),
('+0.8Lam', 'Front design + 0.8mm laminate on back'),
('Both-Side', 'Full design on both front and back faces'),
('1-Side+Membrane', 'Front design + thin membrane on back (Max 87"×44")'),
('+Plain Lam', 'Front design + plain laminate on back'),
('Plain', 'Smooth teak veneer on both sides, no grooves'),
('Grooved-OS', 'Decorative grooves on front face only'),
('Grooved-BS', 'Decorative grooves on both front and back faces'),
('Pooja Door (WG 1051–1070)', 'Pooja door design, 32mm only')
ON CONFLICT (name) DO NOTHING;
