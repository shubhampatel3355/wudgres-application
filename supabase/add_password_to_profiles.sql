-- Add password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add email column too (if not already added)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;
