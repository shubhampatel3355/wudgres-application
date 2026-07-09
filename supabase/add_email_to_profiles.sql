-- ============================================================
-- Add email column to profiles table
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add email column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- ⚠️ NOTE: Passwords are securely managed by Supabase Auth (auth.users table)
-- Storing raw passwords anywhere is a CRITICAL security risk.
-- Supabase already stores hashed passwords internally - you do NOT need them in profiles.
-- However, if you want a "password hint" (NOT the actual password), you can add:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hint TEXT;

-- Update the auth trigger to also capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Unknown User'),
    NEW.email,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    false
  )
  ON CONFLICT (id) DO UPDATE 
    SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN NEW;
END;
$$;

-- Backfill existing users with their email
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;
