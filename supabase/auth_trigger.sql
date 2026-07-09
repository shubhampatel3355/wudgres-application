-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Run this in your Supabase SQL Editor to automatically sync users to profiles
-- ==============================================================================

-- 1. Create a function that automatically inserts a row into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Unknown User'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    false -- By default, new users are not admins
  );
  RETURN NEW;
END;
$$;

-- 2. Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Optional) Backfill: Insert profiles for any users that already exist in auth.users
-- but are missing from public.profiles
INSERT INTO public.profiles (id, name, phone, is_admin)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email, 'Unknown User'),
    phone,
    false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
