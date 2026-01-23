import PageLayout from "@/components/PageLayout";
import { Mail, MapPin, User } from "lucide-react";

const Kontakt = () => {
  return (
    <PageLayout title="Kontakt">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <p className="text-lg text-foreground/90 leading-relaxed">
            Máte zájem o koučink nebo máte jakékoliv dotazy? Neváhejte mě kontaktovat. 
            Rád vám odpovím a společně zjistíme, jak vám mohu pomoci.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jméno</p>
                <p className="font-medium text-foreground">Mgr. Bc. Ondřej Zeman</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresa</p>
                <p className="font-medium text-foreground">Lanškroun, PSČ: 563 01</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-soft-green rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium text-foreground">Zeman.o82@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Photo Placeholder */}
        <div className="flex justify-center">
          <div className="w-64 h-80 md:w-72 md:h-96 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              Zde bude fotka kouče
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Kontakt;
