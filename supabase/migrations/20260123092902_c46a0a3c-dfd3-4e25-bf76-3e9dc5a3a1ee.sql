-- Allow authenticated users to upload to diplomas bucket
CREATE POLICY "Authenticated users can upload diplomas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diplomas');

-- Allow authenticated users to delete diplomas
CREATE POLICY "Authenticated users can delete diplomas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diplomas');

-- Allow authenticated users to insert diploma records
CREATE POLICY "Authenticated users can insert diplomas"
ON public.diplomas FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete diploma records
CREATE POLICY "Authenticated users can delete diplomas"
ON public.diplomas FOR DELETE
TO authenticated
USING (true);