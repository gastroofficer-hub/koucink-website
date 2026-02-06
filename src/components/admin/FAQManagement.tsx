import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Save, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  is_visible: boolean;
  order_index: number;
  created_at: string;
}

interface FAQManagementProps {
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const FAQManagement = ({ onLogChange }: FAQManagementProps) => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    is_visible: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching FAQ:", error);
    } else {
      setFaqItems(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "", is_visible: true });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Vyplňte otázku i odpověď.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("faq")
          .update({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            is_visible: formData.is_visible
          })
          .eq("id", editingItem.id);

        if (error) throw error;

        await onLogChange("FAQ", "Aktualizace otázky", { question: formData.question });
        toast.success("FAQ bylo aktualizováno!");
      } else {
        const maxOrder = faqItems.length > 0 
          ? Math.max(...faqItems.map(t => t.order_index)) + 1 
          : 0;

        const { error } = await supabase.from("faq").insert({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          is_visible: formData.is_visible,
          order_index: maxOrder
        });

        if (error) throw error;

        await onLogChange("FAQ", "Nová otázka", { question: formData.question });
        toast.success("FAQ bylo vytvořeno!");
      }

      resetForm();
      fetchFAQ();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      is_visible: item.is_visible
    });
    setShowForm(true);
  };

  const handleDelete = async (item: FAQItem) => {
    if (!confirm(`Opravdu chcete smazat otázku "${item.question}"?`)) return;

    try {
      const { error } = await supabase
        .from("faq")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      await onLogChange("FAQ", "Smazání otázky", { question: item.question });
      toast.success("FAQ bylo smazáno.");
      fetchFAQ();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při mazání: " + err.message);
    }
  };

  const handleToggleVisibility = async (item: FAQItem) => {
    try {
      const { error } = await supabase
        .from("faq")
        .update({ is_visible: !item.is_visible })
        .eq("id", item.id);

      if (error) throw error;

      await onLogChange("FAQ", item.is_visible ? "Skrytí otázky" : "Zobrazení otázky", { question: item.question });
      fetchFAQ();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    try {
      const current = faqItems[index];
      const previous = faqItems[index - 1];

      await supabase.from("faq").update({ order_index: previous.order_index }).eq("id", current.id);
      await supabase.from("faq").update({ order_index: current.order_index }).eq("id", previous.id);

      fetchFAQ();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqItems.length - 1) return;

    try {
      const current = faqItems[index];
      const next = faqItems[index + 1];

      await supabase.from("faq").update({ order_index: next.order_index }).eq("id", current.id);
      await supabase.from("faq").update({ order_index: current.order_index }).eq("id", next.id);

      fetchFAQ();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Načítání FAQ...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-primary">
              {editingItem ? "Upravit otázku" : "Nová otázka"}
            </h2>
            <Button onClick={resetForm} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-foreground">Otázka</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="bg-white/50 border-primary/20 focus:border-primary"
                placeholder="Napište otázku..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer" className="text-foreground">Odpověď</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[150px]"
                placeholder="Napište odpověď..."
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
              <Label htmlFor="is_visible" className="text-foreground cursor-pointer">
                Zobrazit na webu
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4" />
                {submitting ? "Ukládání..." : editingItem ? "Uložit změny" : "Vytvořit"}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="border-primary/30">
                Zrušit
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
            Nová otázka
          </Button>
        </motion.div>
      )}

      {/* List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        <h2 className="text-xl font-display font-semibold text-primary mb-6">
          Otázky a odpovědi ({faqItems.length})
        </h2>

        {faqItems.length === 0 ? (
          <p className="text-muted-foreground">Zatím nebyly vytvořeny žádné FAQ.</p>
        ) : (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 bg-white/30 rounded-lg p-4 ${!item.is_visible ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  <Button onClick={() => handleMoveUp(index)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleMoveDown(index)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={index === faqItems.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.answer}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={() => handleToggleVisibility(item)} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title={item.is_visible ? "Skrýt" : "Zobrazit"}>
                    {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(item)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FAQManagement;
