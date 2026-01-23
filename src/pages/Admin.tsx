import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, LogOut, ArrowLeft, UserPlus, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
import backgroundImage from "@/assets/background.jpg";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Diploma {
  id: string;
  title: string;
  file_url: string;
  file_path: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

const Admin = () => {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
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
        setCurrentUserEmail(session.user.email || "");
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchDiplomas();
      fetchAdmins();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

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

  const fetchAdmins = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching admins:", error);
    } else {
      setAdmins(data || []);
    }
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      toast.error("Zadejte e-mail nového admina.");
      return;
    }

    setAddingAdmin(true);

    try {
      // First, check if user exists in auth
      // We'll add them by email - they need to register first
      const { error } = await supabase.from("admin_users").insert({
        user_id: crypto.randomUUID(), // Temporary - will be updated when user registers
        email: newAdminEmail.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Tento admin již existuje.");
        } else {
          throw error;
        }
      } else {
        toast.success(`Admin ${newAdminEmail} byl přidán. Uživatel se musí nejprve zaregistrovat.`);
        setNewAdminEmail("");
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (admin.email === currentUserEmail) {
      toast.error("Nemůžete odebrat sami sebe.");
      return;
    }
    if (!confirm(`Opravdu chcete odebrat admina "${admin.email}"?`)) return;

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", admin.id);

      if (error) throw error;

      toast.success("Admin byl odebrán.");
      fetchAdmins();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Načítání...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 text-center max-w-md"
        >
          <Shield className="w-16 h-16 mx-auto text-primary/50 mb-4" />
          <h1 className="text-2xl font-display font-semibold text-primary mb-4">
            Přístup odepřen
          </h1>
          <p className="text-foreground/80 mb-6">
            Nemáte oprávnění přistupovat k administraci. Kontaktujte hlavního administrátora.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleLogout} variant="outline">
              Odhlásit se
            </Button>
            <Link to="/">
              <Button>Zpět na web</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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

          <Tabs defaultValue="diplomas" className="space-y-6">
            <TabsList className="glass-card p-1">
              <TabsTrigger value="diplomas" className="gap-2">
                <Upload className="w-4 h-4" />
                Diplomy
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Users className="w-4 h-4" />
                Správa adminů
              </TabsTrigger>
            </TabsList>

            <TabsContent value="diplomas" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
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

                {diplomas.length === 0 ? (
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
            </TabsContent>

            <TabsContent value="admins" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Přidat nového admina
                </h1>

                <form onSubmit={handleAddAdmin} className="flex gap-4">
                  <Input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="E-mail nového admina"
                    className="bg-white/50 border-primary/20 focus:border-primary flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={addingAdmin}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <UserPlus className="w-4 h-4" />
                    {addingAdmin ? "Přidávání..." : "Přidat"}
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground mt-3">
                  Nový admin se musí nejprve zaregistrovat na stránce /auth
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-xl font-display font-semibold text-primary mb-6">
                  Aktivní administrátoři ({admins.length})
                </h2>

                {admins.length === 0 ? (
                  <p className="text-muted-foreground">Zatím nejsou žádní administrátoři.</p>
                ) : (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between bg-white/30 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{admin.email}</p>
                            {admin.email === currentUserEmail && (
                              <span className="text-xs text-primary">(vy)</span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRemoveAdmin(admin)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={admin.email === currentUserEmail}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
