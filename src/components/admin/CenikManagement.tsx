import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";
import { motion } from "framer-motion";

interface CenikItem {
  title: string;
  description: string;
  price: string;
  note?: string;
  isFree?: boolean;
}

interface CenikContent {
  items: CenikItem[];
  footer: string;
}

interface CenikManagementProps {
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const defaultContent: CenikContent = {
  items: [
    {
      title: "Individuální koučink",
      description: "60 minut intenzivní práce na vašem rozvoji.",
      price: "1 500 Kč"
    },
    {
      title: "Úvodní konzultace",
      description: "15 minut telefonického rozhovoru pro vzájemné seznámení.",
      price: "Zdarma",
      isFree: true
    },
    {
      title: "Balíček 5 sezení",
      description: "Zvýhodněný balíček pro dlouhodobější spolupráci.",
      price: "6 500 Kč",
      note: "(úspora 1 000 Kč)"
    }
  ],
  footer: "Ceny jsou uvedeny včetně DPH. Platba je možná převodem na účet nebo v hotovosti. Pro více informací mě neváhejte kontaktovat."
};

const CenikManagement = ({ onLogChange }: CenikManagementProps) => {
  const [content, setContent] = useState<CenikContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "cenik")
      .maybeSingle();

    if (data?.content) {
      const loadedContent = data.content as unknown as CenikContent;
      if (loadedContent.items && loadedContent.items.length > 0) {
        setContent(loadedContent);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existingData } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", "cenik")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("site_content")
          .update({ 
            content: JSON.parse(JSON.stringify(content)), 
            updated_at: new Date().toISOString() 
          })
          .eq("key", "cenik");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ 
            key: "cenik",
            content: JSON.parse(JSON.stringify(content))
          });

        if (error) throw error;
      }
      
      await onLogChange("Ceník", "Aktualizace", { itemsCount: content.items.length });
      toast.success("Ceník byl uložen!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setContent(prev => ({
      ...prev,
      items: [...prev.items, { title: "", description: "", price: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setContent(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof CenikItem, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return <p className="text-muted-foreground">Načítání...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-8"
    >
      <h1 className="text-2xl font-display font-semibold text-primary mb-6">
        Upravit Ceník
      </h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-foreground text-lg">Položky ceníku</Label>
          <Button
            type="button"
            onClick={addItem}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Přidat položku
          </Button>
        </div>

        {content.items.map((item, index) => (
          <div key={index} className="bg-white/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Položka {index + 1}</Label>
              <Button
                type="button"
                onClick={() => removeItem(index)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                disabled={content.items.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Název</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="Název služby"
                  className="bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Cena</Label>
                <Input
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="1 500 Kč"
                  className="bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Popis</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Popis služby..."
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Poznámka (volitelné)</Label>
              <Input
                value={item.note || ""}
                onChange={(e) => updateItem(index, "note", e.target.value)}
                placeholder="např. (úspora 1 000 Kč)"
                className="bg-white/50 border-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id={`free-${index}`}
                checked={item.isFree || false}
                onCheckedChange={(checked) => updateItem(index, "isFree", checked as boolean)}
              />
              <Label htmlFor={`free-${index}`} className="text-sm text-muted-foreground cursor-pointer">
                Zdarma (zvýrazní cenu zeleně)
              </Label>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <Label className="text-foreground">Patička (informace o platbě)</Label>
          <Textarea
            value={content.footer}
            onChange={(e) => setContent(prev => ({ ...prev, footer: e.target.value }))}
            className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
            placeholder="Informace o platbě..."
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save className="w-4 h-4" />
          {saving ? "Ukládání..." : "Uložit změny"}
        </Button>
      </div>
    </motion.div>
  );
};

export default CenikManagement;
