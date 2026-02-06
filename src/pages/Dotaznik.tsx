import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Dotaznik = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    maritalStatus: "",
    maritalStatusOther: "",
    sessionType: "",
    coachingTopic: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-questionnaire", {
        body: formData,
      });

      if (error) {
        throw error;
      }

      toast.success("Děkujeme za vyplnění dotazníku! E-mail byl odeslán.");
      setFormData({ firstName: "", lastName: "", email: "", phone: "", maritalStatus: "", maritalStatusOther: "", sessionType: "", coachingTopic: "" });
    } catch (error) {
      console.error("Error sending questionnaire:", error);
      toast.error("Nepodařilo se odeslat dotazník. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout 
      title="Rezervace"
      headerRight={<img src={logo} alt="Zeman - koučink" className="w-28 h-auto opacity-70" />}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground font-medium">Jméno</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground font-medium">Příjmení</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              placeholder="vas@email.cz"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium">Telefon *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              placeholder="+420 xxx xxx xxx"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus" className="text-foreground font-medium">Rodinný stav</Label>
          <select
            id="maritalStatus"
            value={formData.maritalStatus}
            onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value, maritalStatusOther: e.target.value === "jiné" ? formData.maritalStatusOther : "" })}
            className="flex h-10 w-full rounded-md border border-primary/20 bg-white/50 px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
          >
            <option value="">Vyberte...</option>
            <option value="svobodný/á">Svobodný/á</option>
            <option value="ženatý/vdaná">Ženatý/Vdaná</option>
            <option value="rozvedený/á">Rozvedený/á</option>
            <option value="vdovec/vdova">Vdovec/Vdova</option>
            <option value="partner/partnerka">Ve vztahu</option>
            <option value="jiné">Jiné (napište)</option>
          </select>
          {formData.maritalStatus === "jiné" && (
            <Input
              id="maritalStatusOther"
              value={formData.maritalStatusOther}
              onChange={(e) => setFormData({ ...formData, maritalStatusOther: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary mt-2"
              placeholder="Upřesněte váš rodinný stav..."
            />
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-foreground font-medium">Preferovaná forma sezení *</Label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sessionType"
                value="osobní"
                checked={formData.sessionType === "osobní"}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-4 h-4 text-primary border-primary/30 focus:ring-primary"
                required
              />
              <span className="text-foreground">Osobní sezení</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sessionType"
                value="online"
                checked={formData.sessionType === "online"}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-4 h-4 text-primary border-primary/30 focus:ring-primary"
              />
              <span className="text-foreground">Online sezení (TEAMS, WhatsApp, Skype)</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coachingTopic" className="text-foreground font-medium">Čeho se bude koučink týkat?</Label>
          <Textarea
            id="coachingTopic"
            value={formData.coachingTopic}
            onChange={(e) => setFormData({ ...formData, coachingTopic: e.target.value })}
            className="bg-white/50 border-primary/20 focus:border-primary min-h-[120px]"
            placeholder="Popište téma, které byste chtěli řešit..."
            required
          />
        </div>

        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
        >
          {isSubmitting ? "Odesílám..." : "Odeslat dotazník"}
        </Button>
      </form>
    </PageLayout>
  );
};

export default Dotaznik;
