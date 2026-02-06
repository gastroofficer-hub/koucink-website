import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Mail, MapPin, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import coachPhotoDefault from "@/assets/coach-photo.jpg";
import logo from "@/assets/logo.png";

interface KontaktContent {
  intro: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
  photo_url?: string;
}

const Kontakt = () => {
  const [content, setContent] = useState<KontaktContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "kontakt")
      .maybeSingle();

    if (data) {
      setContent(data.content as unknown as KontaktContent);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <PageLayout 
        title="Kontakt"
        headerRight={<img src={logo} alt="Zeman - koučink" className="w-28 h-auto opacity-70" />}
      >
        <p className="text-muted-foreground">Načítání...</p>
      </PageLayout>
    );
  }

  // Fallback content
  const defaultContent: KontaktContent = {
    intro: "Máte zájem o koučink nebo máte jakékoliv dotazy? Neváhejte mě kontaktovat. Rád vám odpovím a společně zjistíme, jak vám mohu pomoci.",
    name: "Mgr. Bc. Ondřej Zeman",
    address: "Lanškroun, PSČ: 563 01",
    email: "Zeman.o82@gmail.com",
    phone: "",
    photo_url: ""
  };

  const displayContent = content || defaultContent;
  const photoUrl = displayContent.photo_url || coachPhotoDefault;

  return (
    <PageLayout 
      title="Kontakt"
      headerRight={<img src={logo} alt="Zeman - koučink" className="w-28 h-auto opacity-70" />}
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <p className="text-lg text-foreground/90 leading-relaxed">
            {displayContent.intro}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jméno</p>
                <p className="font-medium text-foreground">{displayContent.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresa</p>
                <p className="font-medium text-foreground">{displayContent.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium text-foreground">{displayContent.email}</p>
              </div>
            </div>

            {displayContent.phone && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium text-foreground">{displayContent.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coach Photo */}
        <div className="flex justify-center">
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden shadow-lg border-4 border-primary/20">
            <img 
              src={photoUrl} 
              alt={`${displayContent.name} - Kouč`} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Kontakt;