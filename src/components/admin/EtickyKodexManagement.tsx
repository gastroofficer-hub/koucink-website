import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";
import { motion } from "framer-motion";

interface EtickyKodexSection {
  title: string;
  text?: string;
  items?: string[];
}

interface EtickyKodexContent {
  intro: string;
  sections: EtickyKodexSection[];
}

interface EtickyKodexManagementProps {
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const defaultContent: EtickyKodexContent = {
  intro: "Jako kouč se řídím následujícími etickými principy, které zajišťují kvalitu a bezpečnost koučovacího procesu.",
  sections: [
    {
      title: "Důvěrnost",
      text: "Veškeré informace sdílené během koučování jsou přísně důvěrné. Bez výslovného souhlasu klienta nesdílím žádné osobní informace třetím stranám."
    },
    {
      title: "Respekt a integrita",
      text: "Přistupuji ke každému klientovi s respektem a uznávám jeho jedinečnost. Jednám čestně a transparentně ve všech aspektech koučovacího vztahu."
    },
    {
      title: "Profesionalita",
      text: "Neustále se vzdělávám a rozvíjím své koučovací dovednosti. Pracuji pouze v oblastech, kde mám odpovídající kompetence."
    },
    {
      title: "Hranice a odpovědnost",
      text: "Jasně vymezuji hranice koučovacího vztahu. Koučink není terapie ani poradenství – v případě potřeby doporučím vhodného odborníka."
    }
  ]
};

const EtickyKodexManagement = ({ onLogChange }: EtickyKodexManagementProps) => {
  const [content, setContent] = useState<EtickyKodexContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "eticky_kodex")
      .maybeSingle();

    if (data?.content) {
      const loadedContent = data.content as unknown as EtickyKodexContent;
      if (loadedContent.sections && loadedContent.sections.length > 0) {
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
        .eq("key", "eticky_kodex")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("site_content")
          .update({ 
            content: JSON.parse(JSON.stringify(content)), 
            updated_at: new Date().toISOString() 
          })
          .eq("key", "eticky_kodex");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ 
            key: "eticky_kodex",
            content: JSON.parse(JSON.stringify(content))
          });

        if (error) throw error;
      }
      
      await onLogChange("Etický kodex", "Aktualizace", { sectionsCount: content.sections.length });
      toast.success("Etický kodex byl uložen!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, { title: "", text: "" }]
    }));
  };

  const removeSection = (index: number) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: keyof EtickyKodexSection, value: string | string[]) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
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
        Upravit Etický kodex
      </h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground">Úvodní text</Label>
          <Textarea
            value={content.intro}
            onChange={(e) => setContent(prev => ({ ...prev, intro: e.target.value }))}
            className="bg-white/50 border-primary/20 focus:border-primary min-h-[100px]"
            placeholder="Úvodní text dokumentu..."
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground text-lg">Sekce</Label>
          <Button
            type="button"
            onClick={addSection}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Přidat sekci
          </Button>
        </div>

        {content.sections.map((section, index) => (
          <div key={index} className="bg-white/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Sekce {index + 1}</Label>
              <Button
                type="button"
                onClick={() => removeSection(index)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                disabled={content.sections.length <= 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Název sekce</Label>
              <Input
                value={section.title}
                onChange={(e) => updateSection(index, "title", e.target.value)}
                placeholder="Název sekce"
                className="bg-white/50 border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Text sekce</Label>
              <Textarea
                value={section.text || ""}
                onChange={(e) => updateSection(index, "text", e.target.value)}
                placeholder="Text sekce..."
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Odrážky (každá na novém řádku, volitelné)
              </Label>
              <Textarea
                value={section.items?.join("\n") || ""}
                onChange={(e) => updateSection(index, "items", e.target.value.split("\n").filter(Boolean))}
                placeholder="Položka 1&#10;Položka 2&#10;Položka 3"
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
              />
            </div>
          </div>
        ))}

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

export default EtickyKodexManagement;
