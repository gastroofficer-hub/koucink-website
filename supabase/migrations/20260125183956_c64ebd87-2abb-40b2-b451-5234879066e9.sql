-- Create table for change history
CREATE TABLE public.change_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  section TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all change history
CREATE POLICY "Admins can view change_history"
  ON public.change_history
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can insert change history
CREATE POLICY "Admins can insert change_history"
  ON public.change_history
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_change_history_created_at ON public.change_history(created_at DESC);
CREATE INDEX idx_change_history_section ON public.change_history(section);