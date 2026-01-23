-- Allow a user to claim (link) their admin_users row by matching email
-- This fixes the bootstrap flow when an admin record exists by email but user_id is not yet linked.

CREATE POLICY "Users can claim admin row by email"
ON public.admin_users
FOR UPDATE
USING (
  (auth.jwt() ->> 'email') = email
)
WITH CHECK (
  (auth.jwt() ->> 'email') = email
  AND user_id = auth.uid()
);

-- Optional bootstrap: allow creating the very first admin when no admins exist yet
-- (kept permissive so existing stricter admin-only insert policy still applies once a first admin exists)
CREATE POLICY "Bootstrap first admin"
ON public.admin_users
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (auth.jwt() ->> 'email') = email
  AND NOT EXISTS (SELECT 1 FROM public.admin_users)
);
