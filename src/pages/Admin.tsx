import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import backgroundImage from "@/assets/background.jpg";
import { Link } from "react-router-dom";

interface Diploma {
  id: string;
  title: string;
  file_url: string;
  file_path: string;
  created_at: string;
}

const Admin = () => {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        fetchDiplomas();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDiplomas = async () => {
    const { data, error } = await supabase
      .from("diplomas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching diplomas:", error);
    } else {
      setDiplomas(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Vyplňte název a vyberte soubor.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("diplomas")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("diplomas")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("diplomas").insert({
        title: title.trim(),
        file_path: filePath,
        file_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      toast.success("Diplom byl úspěšně nahrán!");
      setTitle("");
      setFile(null);
      fetchDiplomas();
    } catch (error: any) {
      toast.error("Chyba při nahrávání: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (diploma: Diploma) => {
    if (!confirm(`Opravdu chcete smazat "${diploma.title}"?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("diplomas")
        .remove([diploma.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("diplomas")
        .delete()
        .eq("id", diploma.id);

      if (dbError) throw dbError;

      toast.success("Diplom byl smazán.");
      fetchDiplomas();
    } catch (error: any) {
      toast.error("Chyba při mazání: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen bg-background/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Zpět na web</span>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-8 mb-8"
          >
            <h1 className="text-2xl font-display font-semibold text-primary mb-6">
              Nahrát nový diplom
            </h1>

            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Název diplomu</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="např. Certifikát ICF ACC"
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-foreground">Soubor (obrázek nebo PDF)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Nahrávání..." : "Nahrát diplom"}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-xl font-display font-semibold text-primary mb-6">
              Nahrané diplomy ({diplomas.length})
            </h2>

            {loading ? (
              <p className="text-muted-foreground">Načítání...</p>
            ) : diplomas.length === 0 ? (
              <p className="text-muted-foreground">Zatím nebyly nahrány žádné diplomy.</p>
            ) : (
              <div className="space-y-4">
                {diplomas.map((diploma) => (
                  <div
                    key={diploma.id}
                    className="flex items-center justify-between bg-white/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={diploma.file_url}
                        alt={diploma.title}
                        className="w-16 h-16 object-cover rounded-lg bg-soft-green/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{diploma.title}</p>
                        <a
                          href={diploma.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-accent"
                        >
                          Zobrazit soubor
                        </a>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(diploma)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
