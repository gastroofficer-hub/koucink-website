-- Create storage bucket for diplomas
INSERT INTO storage.buckets (id, name, public)
VALUES ('diplomas', 'diplomas', true);

-- Allow public read access to diplomas
CREATE POLICY "Anyone can view diplomas"
ON storage.objects FOR SELECT
USING (bucket_id = 'diplomas');

-- Create table to store diploma metadata
CREATE TABLE public.diplomas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read
ALTER TABLE public.diplomas ENABLE ROW LEVEL SECURITY;

-- Anyone can view diplomas
CREATE POLICY "Anyone can view diplomas"
ON public.diplomas FOR SELECT
USING (true);