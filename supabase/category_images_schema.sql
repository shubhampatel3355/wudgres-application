-- Create the table for category images
CREATE TABLE IF NOT EXISTS app_category_images (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert the default categories
INSERT INTO app_category_images (id, name, image_url)
VALUES
    ('doors', 'Doors', null),
    ('nfc', 'NFC', null),
    ('window-shutters', 'Window Shutters', null),
    ('plywood', 'Plywood & Block Boards', null),
    ('eng-wood-frames', 'Eng. Wood Frames', null)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for now so the app can freely read it (matching current project setup)
ALTER TABLE app_category_images DISABLE ROW LEVEL SECURITY;
