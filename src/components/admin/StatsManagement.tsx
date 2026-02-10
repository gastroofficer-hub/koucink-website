import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X, Save, BarChart3 } from "lucide-react";
import type { StatItemData, StatsContent } from "@/components/StatsSection";

const ICON_OPTIONS = ["Clock", "Users", "Award", "Trophy", "Heart", "Star", "Target", "Briefcase"];

interface StatsManagementProps {
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const StatsManagement = ({ onLogChange }: StatsManagementProps) => {
  const [items, setItems] = useState<StatItemData[]>([
    { icon: "Clock", value: 500, suffix: "+", label: "Hodin koučinku" },
    { icon: "Award", value: 5, suffix: "+", label: "Let praxe" },
    { icon: "Users", value: 100, suffix: "+", label: "Spokojených klientů" },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "statistiky")
        .maybeSingle();

      if (data?.content) {
        const content = data.content as unknown as StatsContent;
        if (content.items && content.items.length > 0) {
          setItems(content.items);
        }
      }
    };
    fetchStats();
  }, []);

  const updateItem = (index: number, field: keyof StatItemData, value: string | number) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { icon: "Award", value: 0, suffix: "+", label: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const content: StatsContent = { items };

      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", "statistiky")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_content")
          .update({ content: JSON.parse(JSON.stringify(content)), updated_at: new Date().toISOString() })
          .eq("key", "statistiky");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ key: "statistiky", content: JSON.parse(JSON.stringify(content)) });
        if (error) throw error;
      }

      await onLogChange("Statistiky", "Aktualizace", { itemsCount: items.length });
      toast.success("Statistiky byly uloženy!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-display font-semibold text-primary">Statistiky</h2>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-card/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Položka {index + 1}</span>
              <Button
                onClick={() => removeItem(index)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground text-sm">Ikona</Label>
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(index, "icon", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-primary/20 bg-card/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-sm">Přípona (např. +, %)</Label>
                <Input
                  value={item.suffix}
                  onChange={(e) => updateItem(index, "suffix", e.target.value)}
                  className="bg-card/50 border-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground text-sm">Hodnota (číslo)</Label>
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) => updateItem(index, "value", parseInt(e.target.value) || 0)}
                  className="bg-card/50 border-primary/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground text-sm">Popisek</Label>
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(index, "label", e.target.value)}
                  className="bg-card/50 border-primary/20"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addItem} variant="outline" className="gap-2 w-full border-dashed">
          <Plus className="w-4 h-4" />
          Přidat statistiku
        </Button>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Ukládání..." : "Uložit statistiky"}
        </Button>
      </div>
    </div>
  );
};

export default StatsManagement;
