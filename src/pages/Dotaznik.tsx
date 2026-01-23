import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Dotaznik = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    coachingTopic: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Děkujeme za vyplnění dotazníku!");
    console.log(formData);
  };

  return (
    <PageLayout title="Dotazník">
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
        >
          Odeslat dotazník
        </Button>
      </form>
    </PageLayout>
  );
};

export default Dotaznik;
