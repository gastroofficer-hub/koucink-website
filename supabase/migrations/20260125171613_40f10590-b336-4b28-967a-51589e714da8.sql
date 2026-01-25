-- Create table for site content (Informační souhlas, Kontakt, etc.)
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view site content
CREATE POLICY "Anyone can view site_content" 
ON public.site_content 
FOR SELECT 
USING (true);

-- Only admins can update site content
CREATE POLICY "Admins can update site_content" 
ON public.site_content 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Only admins can insert site content
CREATE POLICY "Admins can insert site_content" 
ON public.site_content 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Insert default content for Informační souhlas
INSERT INTO public.site_content (key, content) VALUES (
  'informacni_souhlas',
  '{
    "intro": "Vážený klienti, před zahájením koučovacího procesu je důležité, abyste byli plně informováni o průběhu a podmínkách naší spolupráce.",
    "sections": [
      {
        "title": "Základní informace o koučinku",
        "items": [
          "Koučink je partnerský vztah založený na důvěře a otevřené komunikaci",
          "Kouč neposkytuje rady ani řešení, ale podporuje klienta v hledání vlastních odpovědí",
          "Veškeré informace sdílené během sezení jsou důvěrné",
          "Klient má právo kdykoliv ukončit spolupráci"
        ]
      },
      {
        "title": "Ochrana osobních údajů",
        "text": "Vaše osobní údaje jsou zpracovávány v souladu s GDPR. Údaje jsou uchovávány pouze po dobu nezbytnou pro poskytování služeb a jsou chráněny před neoprávněným přístupem."
      },
      {
        "title": "Souhlas klienta",
        "text": "Podpisem tohoto dokumentu potvrzujete, že jste byli informováni o výše uvedených podmínkách a souhlasíte s nimi."
      }
    ]
  }'::jsonb
);

-- Insert default content for Kontakt
INSERT INTO public.site_content (key, content) VALUES (
  'kontakt',
  '{
    "intro": "Máte zájem o koučink nebo máte jakékoliv dotazy? Neváhejte mě kontaktovat. Rád vám odpovím a společně zjistíme, jak vám mohu pomoci.",
    "name": "Mgr. Bc. Ondřej Zeman",
    "address": "Lanškroun, PSČ: 563 01",
    "email": "Zeman.o82@gmail.com",
    "phone": "",
    "photo_url": ""
  }'::jsonb
);

-- Create storage bucket for contact photos
INSERT INTO storage.buckets (id, name, public) VALUES ('contact-photos', 'contact-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contact photos
CREATE POLICY "Contact photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contact-photos');

CREATE POLICY "Admins can upload contact photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contact-photos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update contact photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contact-photos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'contact-photos' AND is_admin(auth.uid()));