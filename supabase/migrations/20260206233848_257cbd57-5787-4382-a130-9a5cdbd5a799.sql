-- Add photo and rating columns to testimonials
ALTER TABLE public.testimonials 
  ADD COLUMN photo_url TEXT,
  ADD COLUMN photo_path TEXT,
  ADD COLUMN rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);