-- ==============================================================================
-- ADMIN UPDATE USER PASSWORD RPC
-- Run this in your Supabase SQL Editor to allow admins to change user passwords
-- ==============================================================================

-- Create a secure Postgres function to update a user's password
CREATE OR REPLACE FUNCTION public.admin_update_user_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with postgres permissions (bypassing RLS)
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Security Check: Ensure the person calling this function is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Not authorized. Only admins can change passwords.';
  END IF;

  -- 2. Update the user's password in the auth.users table
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;

  -- Optional: If you also store the password in the profiles table, update it there too
  UPDATE public.profiles
  SET password = new_password
  WHERE id = target_user_id;

END;
$$;

-- Grant execute permission to authenticated users (the function itself handles authorization)
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO authenticated;
