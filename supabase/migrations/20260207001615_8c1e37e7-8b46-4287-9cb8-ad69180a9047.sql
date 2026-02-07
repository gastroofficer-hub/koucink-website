-- Add database-level constraints for blog_comments to prevent bypass of client-side validation
-- Using a trigger instead of CHECK constraints for flexibility

-- Create validation trigger function for blog comments
CREATE OR REPLACE FUNCTION public.validate_blog_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace from inputs
  NEW.author_name := trim(NEW.author_name);
  NEW.content := trim(NEW.content);
  
  -- Validate author_name length (1-100 characters)
  IF length(NEW.author_name) = 0 THEN
    RAISE EXCEPTION 'Author name cannot be empty';
  END IF;
  
  IF length(NEW.author_name) > 100 THEN
    RAISE EXCEPTION 'Author name cannot exceed 100 characters';
  END IF;
  
  -- Validate content length (1-1000 characters)
  IF length(NEW.content) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  IF length(NEW.content) > 1000 THEN
    RAISE EXCEPTION 'Comment content cannot exceed 1000 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to validate blog comments before insert
CREATE TRIGGER validate_blog_comment_trigger
  BEFORE INSERT ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_blog_comment();

-- Create rate limiting table for blog comments (similar to questionnaire)
CREATE TABLE IF NOT EXISTS public.blog_comment_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limit table (no policies needed - accessed via SECURITY DEFINER function)
ALTER TABLE public.blog_comment_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create cleanup function for blog comment rate limits
CREATE OR REPLACE FUNCTION public.cleanup_old_blog_comment_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.blog_comment_rate_limits
    WHERE created_at < now() - interval '1 hour';
END;
$$;

-- Create function to check and record blog comment rate limit
CREATE OR REPLACE FUNCTION public.check_blog_comment_rate_limit(client_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Clean up old entries first
    PERFORM cleanup_old_blog_comment_rate_limits();
    
    -- Count recent submissions from this IP (last hour)
    SELECT COUNT(*) INTO recent_count
    FROM public.blog_comment_rate_limits
    WHERE ip_address = client_ip
    AND created_at > now() - interval '1 hour';
    
    -- Allow max 10 comments per hour per IP
    IF recent_count >= 10 THEN
        RETURN FALSE;
    END IF;
    
    -- Record this submission
    INSERT INTO public.blog_comment_rate_limits (ip_address)
    VALUES (client_ip);
    
    RETURN TRUE;
END;
$$;