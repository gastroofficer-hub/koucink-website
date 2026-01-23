-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Admins can view other admins
CREATE POLICY "Admins can view admin_users"
ON public.admin_users FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can add new admins
CREATE POLICY "Admins can insert admin_users"
ON public.admin_users FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can remove admins
CREATE POLICY "Admins can delete admin_users"
ON public.admin_users FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Drop old diploma policies and create new ones using is_admin function
DROP POLICY IF EXISTS "Authenticated users can insert diplomas" ON public.diplomas;
DROP POLICY IF EXISTS "Authenticated users can delete diplomas" ON public.diplomas;

CREATE POLICY "Admins can insert diplomas"
ON public.diplomas FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete diplomas"
ON public.diplomas FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Drop old storage policies and create new ones
DROP POLICY IF EXISTS "Authenticated users can upload diplomas" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete diplomas" ON storage.objects;

CREATE POLICY "Admins can upload diplomas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diplomas' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete diplomas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diplomas' AND public.is_admin(auth.uid()));