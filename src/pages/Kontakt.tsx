import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Kontakt = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Zpráva byla odeslána! Brzy se vám ozvu.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <PageLayout title="Kontakt">
      <div className="grid md:grid-cols-2 gap-12">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-foreground font-medium">Vaše jméno</Label>
            <Input
              id="contact-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-foreground font-medium">Váš e-mail</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-foreground font-medium">Vaše zpráva</Label>
            <Textarea
              id="contact-message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary min-h-[150px]"
              placeholder="Napište mi, co vás zajímá..."
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
          >
            Odeslat zprávu
          </Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default Kontakt;
