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
    name: "",
    email: "",
    goal: "",
    experience: "",
    expectations: "",
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
            <Label htmlFor="name" className="text-foreground font-medium">Jméno a příjmení</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/50 border-primary/20 focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-foreground font-medium">Máte předchozí zkušenosti s koučinkem?</Label>
          <RadioGroup
            value={formData.experience}
            onValueChange={(value) => setFormData({ ...formData, experience: value })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="exp-yes" />
              <Label htmlFor="exp-yes" className="font-normal text-foreground/80">Ano, již jsem byl/a na koučinku</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="exp-no" />
              <Label htmlFor="exp-no" className="font-normal text-foreground/80">Ne, bude to moje první zkušenost</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal" className="text-foreground font-medium">Jaký je váš hlavní cíl?</Label>
          <Textarea
            id="goal"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="bg-white/50 border-primary/20 focus:border-primary min-h-[120px]"
            placeholder="Popište, čeho byste chtěli dosáhnout..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectations" className="text-foreground font-medium">Jaká jsou vaše očekávání od koučinku?</Label>
          <Textarea
            id="expectations"
            value={formData.expectations}
            onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
            className="bg-white/50 border-primary/20 focus:border-primary min-h-[120px]"
            placeholder="Sdělte nám vaše očekávání..."
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
