-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT,
  author_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_posts
CREATE POLICY "Anyone can view blog_posts"
ON public.blog_posts
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert blog_posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update blog_posts"
ON public.blog_posts
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog_posts"
ON public.blog_posts
FOR DELETE
USING (is_admin(auth.uid()));

-- RLS policies for blog_comments
CREATE POLICY "Anyone can view blog_comments"
ON public.blog_comments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert blog_comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete blog_comments"
ON public.blog_comments
FOR DELETE
USING (is_admin(auth.uid()));

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog-images bucket
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();