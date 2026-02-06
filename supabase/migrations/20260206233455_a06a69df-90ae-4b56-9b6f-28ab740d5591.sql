-- Create FAQ table
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Public can view visible FAQ items
CREATE POLICY "Anyone can view visible faq" 
  ON public.faq 
  FOR SELECT 
  USING (is_visible = true);

-- Admins can manage FAQ
CREATE POLICY "Admins can insert faq" 
  ON public.faq 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update faq" 
  ON public.faq 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete faq" 
  ON public.faq 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();