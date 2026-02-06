import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Save, Image } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_path: string | null;
  author_email: string;
  created_at: string;
}

interface BlogManagementProps {
  currentUserEmail: string;
  onLogChange: (section: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

const BlogManagement = ({ currentUserEmail, onLogChange }: BlogManagementProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setImageFile(null);
    setEditingPost(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vyplňte název a obsah příspěvku.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = editingPost?.image_url || null;
      let imagePath = editingPost?.image_path || null;

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        // Delete old image if exists
        if (editingPost?.image_path) {
          await supabase.storage
            .from("blog-images")
            .remove([editingPost.image_path]);
        }

        imageUrl = urlData.publicUrl;
        imagePath = fileName;
      }

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            image_url: imageUrl,
            image_path: imagePath
          })
          .eq("id", editingPost.id);

        if (error) throw error;

        await onLogChange("Blog", "Aktualizace příspěvku", { title: formData.title });
        toast.success("Příspěvek byl aktualizován!");
      } else {
        // Create new post
        const { error } = await supabase.from("blog_posts").insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          image_url: imageUrl,
          image_path: imagePath,
          author_email: currentUserEmail
        });

        if (error) throw error;

        await onLogChange("Blog", "Nový příspěvek", { title: formData.title });
        toast.success("Příspěvek byl vytvořen!");
      }

      resetForm();
      fetchPosts();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Opravdu chcete smazat příspěvek "${post.title}"?`)) return;

    try {
      // Delete image from storage if exists
      if (post.image_path) {
        await supabase.storage
          .from("blog-images")
          .remove([post.image_path]);
      }

      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      await onLogChange("Blog", "Smazání příspěvku", { title: post.title });
      toast.success("Příspěvek byl smazán.");
      fetchPosts();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při mazání: " + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Načítání příspěvků...</p>;
  }

  return (
    <div className="space-y-6">
      {/* New/Edit Post Form */}
      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-primary">
              {editingPost ? "Upravit příspěvek" : "Nový příspěvek"}
            </h2>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Název příspěvku</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/50 border-primary/20 focus:border-primary"
                placeholder="Název příspěvku..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground">Obsah</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="bg-white/50 border-primary/20 focus:border-primary min-h-[300px]"
                placeholder="Napište obsah příspěvku..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-foreground">Obrázek (volitelné)</Label>
              <div className="flex items-center gap-4">
                {(editingPost?.image_url || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : editingPost?.image_url || ""}
                    alt="Náhled"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="bg-white/50 border-primary/20 focus:border-primary flex-1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="w-4 h-4" />
                {submitting ? "Ukládání..." : editingPost ? "Uložit změny" : "Vytvořit příspěvek"}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="border-primary/30"
              >
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
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Nový příspěvek
          </Button>
        </motion.div>
      )}

      {/* Posts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        <h2 className="text-xl font-display font-semibold text-primary mb-6">
          Příspěvky ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">Zatím nebyly vytvořeny žádné příspěvky.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-4 bg-white/30 rounded-lg p-4"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image className="w-8 h-8 text-primary/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {post.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(post.created_at)} • {post.author_email}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(post)}
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(post)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                  >
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

export default BlogManagement;
