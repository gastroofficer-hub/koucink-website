import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Save, Eye, EyeOff, ArrowUp, ArrowDown, Star, User } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  text: string;
  author_name: string;
  author_role: string | null;
  photo_url: string | null;
  photo_path: string | null;
  rating: number | null;
  is_visible: boolean;
  order_index: number;
  created_at: string;
}

interface TestimonialsManagementProps {
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const TestimonialsManagement = ({ onLogChange }: TestimonialsManagementProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    author_name: "",
    author_role: "",
    rating: 5,
    is_visible: true
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching testimonials:", error);
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ text: "", author_name: "", author_role: "", rating: 5, is_visible: true });
    setPhotoFile(null);
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim() || !formData.author_name.trim()) {
      toast.error("Vyplňte text reference a jméno autora.");
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = editingTestimonial?.photo_url || null;
      let photoPath = editingTestimonial?.photo_path || null;

      // Upload new photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `testimonial-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("contact-photos")
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("contact-photos")
          .getPublicUrl(fileName);

        // Delete old photo if exists
        if (editingTestimonial?.photo_path) {
          await supabase.storage
            .from("contact-photos")
            .remove([editingTestimonial.photo_path]);
        }

        photoUrl = urlData.publicUrl;
        photoPath = fileName;
      }

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            text: formData.text.trim(),
            author_name: formData.author_name.trim(),
            author_role: formData.author_role.trim() || null,
            rating: formData.rating,
            photo_url: photoUrl,
            photo_path: photoPath,
            is_visible: formData.is_visible
          })
          .eq("id", editingTestimonial.id);

        if (error) throw error;

        await onLogChange("Reference", "Aktualizace reference", { author: formData.author_name });
        toast.success("Reference byla aktualizována!");
      } else {
        const maxOrder = testimonials.length > 0 
          ? Math.max(...testimonials.map(t => t.order_index)) + 1 
          : 0;

        const { error } = await supabase.from("testimonials").insert({
          text: formData.text.trim(),
          author_name: formData.author_name.trim(),
          author_role: formData.author_role.trim() || null,
          rating: formData.rating,
          photo_url: photoUrl,
          photo_path: photoPath,
          is_visible: formData.is_visible,
          order_index: maxOrder
        });

        if (error) throw error;

        await onLogChange("Reference", "Nová reference", { author: formData.author_name });
        toast.success("Reference byla vytvořena!");
      }

      resetForm();
      fetchTestimonials();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      text: testimonial.text,
      author_name: testimonial.author_name,
      author_role: testimonial.author_role || "",
      rating: testimonial.rating || 5,
      is_visible: testimonial.is_visible
    });
    setPhotoFile(null);
    setShowForm(true);
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (!confirm(`Opravdu chcete smazat referenci od "${testimonial.author_name}"?`)) return;

    try {
      // Delete photo if exists
      if (testimonial.photo_path) {
        await supabase.storage.from("contact-photos").remove([testimonial.photo_path]);
      }

      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonial.id);

      if (error) throw error;

      await onLogChange("Reference", "Smazání reference", { author: testimonial.author_name });
      toast.success("Reference byla smazána.");
      fetchTestimonials();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při mazání: " + err.message);
    }
  };

  const handleToggleVisibility = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_visible: !testimonial.is_visible })
        .eq("id", testimonial.id);

      if (error) throw error;

      await onLogChange("Reference", testimonial.is_visible ? "Skrytí reference" : "Zobrazení reference", { author: testimonial.author_name });
      fetchTestimonials();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    try {
      const current = testimonials[index];
      const previous = testimonials[index - 1];

      await supabase.from("testimonials").update({ order_index: previous.order_index }).eq("id", current.id);
      await supabase.from("testimonials").update({ order_index: current.order_index }).eq("id", previous.id);

      fetchTestimonials();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === testimonials.length - 1) return;

    try {
      const current = testimonials[index];
      const next = testimonials[index + 1];

      await supabase.from("testimonials").update({ order_index: next.order_index }).eq("id", current.id);
      await supabase.from("testimonials").update({ order_index: current.order_index }).eq("id", next.id);

      fetchTestimonials();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const renderStarSelector = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`w-6 h-6 ${
              star <= formData.rating
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? "fill-accent text-accent" : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <p className="text-muted-foreground">Načítání referencí...</p>;
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
              {editingTestimonial ? "Upravit referenci" : "Nová reference"}
            </h2>
            <Button onClick={resetForm} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="text" className="text-foreground">Text reference</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[150px]"
                placeholder="Napište text reference..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name" className="text-foreground">Jméno autora</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  placeholder="např. Jana K."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author_role" className="text-foreground">Role/Profese (volitelné)</Label>
                <Input
                  id="author_role"
                  value={formData.author_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_role: e.target.value }))}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  placeholder="např. Podnikatelka"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Fotografie autora (volitelné)</Label>
              <div className="flex items-center gap-4">
                {(editingTestimonial?.photo_url || photoFile) && (
                  <img
                    src={photoFile ? URL.createObjectURL(photoFile) : editingTestimonial?.photo_url || ""}
                    alt="Náhled"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="bg-white/50 border-primary/20 focus:border-primary flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Hodnocení</Label>
              {renderStarSelector()}
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
                {submitting ? "Ukládání..." : editingTestimonial ? "Uložit změny" : "Vytvořit referenci"}
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
            Nová reference
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
          Reference ({testimonials.length})
        </h2>

        {testimonials.length === 0 ? (
          <p className="text-muted-foreground">Zatím nebyly vytvořeny žádné reference.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`flex items-start gap-4 bg-white/30 rounded-lg p-4 ${!testimonial.is_visible ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  <Button onClick={() => handleMoveUp(index)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleMoveDown(index)} variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={index === testimonials.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                {testimonial.photo_url ? (
                  <img
                    src={testimonial.photo_url}
                    alt={testimonial.author_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary/50" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-primary">{testimonial.author_name}</p>
                    {renderStars(testimonial.rating)}
                  </div>
                  {testimonial.author_role && (
                    <p className="text-xs text-muted-foreground mb-1">{testimonial.author_role}</p>
                  )}
                  <p className="text-sm text-foreground/90 italic line-clamp-2">"{testimonial.text}"</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={() => handleToggleVisibility(testimonial)} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title={testimonial.is_visible ? "Skrýt" : "Zobrazit"}>
                    {testimonial.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button onClick={() => handleEdit(testimonial)} variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(testimonial)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
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

export default TestimonialsManagement;
