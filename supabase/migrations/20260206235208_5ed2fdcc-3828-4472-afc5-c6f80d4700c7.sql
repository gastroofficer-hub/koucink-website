-- Create table for rate limiting questionnaire submissions
CREATE TABLE public.rate_limit_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limit_ip_created ON public.rate_limit_submissions (ip_address, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limit_submissions ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) can access this table
-- No policies for authenticated users - they cannot access this table

-- Create function to clean up old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limit_submissions
    WHERE created_at < now() - interval '1 hour';
END;
$$;

-- Fix admin_users RLS policies: Remove the UPDATE policy that allows email enumeration
DROP POLICY IF EXISTS "Users can claim admin row by email" ON public.admin_users;

-- Create a more secure UPDATE policy that doesn't expose email information
-- This policy only works if the user_id is NULL (placeholder) and matches the user's email
CREATE POLICY "Users can claim their admin row"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
    user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
)
WITH CHECK (
    user_id = auth.uid()
    AND email = (auth.jwt() ->> 'email')
);

-- Ensure only admins can read the table (this policy already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));