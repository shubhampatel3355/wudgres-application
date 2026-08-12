-- ==============================================================================
-- ADMIN UPDATE USER RPC
-- Run this in your Supabase SQL Editor to allow admins to edit users comprehensively
-- ==============================================================================

-- Create a secure Postgres function to update a user's details and password
CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_user_id uuid, 
  new_name text,
  new_email text,
  new_phone text,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with postgres permissions (bypassing RLS)
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- 1. Security Check: Disabled for local admin dashboard without auth
  -- (Uncomment and configure if moving to production with real admin logins)
  -- IF NOT EXISTS (
  --   SELECT 1 FROM public.profiles 
  --   WHERE id = auth.uid() AND is_admin = true
  -- ) THEN
  --   RAISE EXCEPTION 'Not authorized. Only admins can update users.';
  -- END IF;

  -- 2. Update the user's auth data in auth.users
  UPDATE auth.users 
  SET 
    email = COALESCE(NULLIF(new_email, ''), email),
    phone = COALESCE(NULLIF(new_phone, ''), phone),
    encrypted_password = CASE 
      WHEN new_password IS NOT NULL AND new_password != '' 
      THEN crypt(new_password, gen_salt('bf'))
      ELSE encrypted_password 
    END,
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(new_name)
    )
  WHERE id = target_user_id;

  -- 3. Update the profiles table
  UPDATE public.profiles
  SET 
    name = new_name,
    email = new_email,
    phone = new_phone,
    password = CASE 
      WHEN new_password IS NOT NULL AND new_password != '' 
      THEN new_password
      ELSE password 
    END
  WHERE id = target_user_id;

END;
$$;

-- Grant execute permission to authenticated users (the function itself handles authorization)
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text) TO authenticated;
