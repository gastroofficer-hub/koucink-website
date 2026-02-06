import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2, LogOut, ArrowLeft, UserPlus, Users, Shield, FileText, Phone, Plus, X, Save, User, History, Clock, ListOrdered, BookOpen, Coins, Scale, Quote } from "lucide-react";
import { motion } from "framer-motion";
import backgroundImage from "@/assets/background.jpg";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogManagement from "@/components/admin/BlogManagement";
import CenikManagement from "@/components/admin/CenikManagement";
import EtickyKodexManagement from "@/components/admin/EtickyKodexManagement";
import TestimonialsManagement from "@/components/admin/TestimonialsManagement";

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

interface Section {
  title: string;
  items?: string[];
  text?: string;
}

interface InformacniSouhlasContent {
  intro: string;
  sections: Section[];
}

interface KontaktContent {
  intro: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  photo_url: string;
}

interface OMneContent {
  kdoJsem: string;
  procSeMnou: string;
}

interface CoachingStep {
  title: string;
  text: string;
  tags?: string[];
}

interface JakProbihaContent {
  steps: CoachingStep[];
}

interface ChangeHistoryItem {
  id: string;
  user_email: string;
  section: string;
  action: string;
  details: unknown;
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
  
  // Content states
  const [informacniSouhlas, setInformacniSouhlas] = useState<InformacniSouhlasContent>({
    intro: "",
    sections: []
  });
  const [kontakt, setKontakt] = useState<KontaktContent>({
    intro: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    photo_url: ""
  });
  const [oMne, setOMne] = useState<OMneContent>({
    kdoJsem: "",
    procSeMnou: ""
  });
  const [savingContent, setSavingContent] = useState(false);
  const [contactPhotoFile, setContactPhotoFile] = useState<File | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [jakProbiha, setJakProbiha] = useState<JakProbihaContent>({
    steps: [
      { title: "Kontakt & objednávka", text: "Napiš mi email nebo vyplň formulář na webu. Popiš, s čím potřebuješ pomoct (stres, kariéra, vztahy...). Zaručeně odpovídám do 24 hodin s návrhem volných termínů." },
      { title: "Předchozí volný rozhovor", text: "15 minutová zdarma telefonická volba. Zjistíme, jestli si sedíme, probereme tvé cíle a domluvíme první sezení." },
      { title: "Sjednání termínu & platba", text: "Vybereme si první sezení (online/osobně). Pošlu ti fakturu a informovaný souhlas k podpisu. Zaplatíš zálohu a podepíšeš." },
      { title: "Příprava na sezení", text: "Pošlu ti krátký přehled: co očekávat, jak se připravit (co si přinést, na co se zamyslet). Dostaneš i link na Zoom (online) nebo adresu (osobní schůzka)." },
      { title: "První sezení", text: "60 minut intenzivní práce. Zaměříme se na tvůj hlavní cíl, najdeme první akční kroky. Po sezení dostaneš shrnutí + \"domácí úkol\".", tags: ["Online: Zoom, Skype", "Osobně: Lanškroun", "Délka: 60 minut", "Frekvence: 1–2× měsíčně"] }
    ]
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initForSession = async (session: { user: { id: string; email?: string | null } }) => {
      setLoading(true);
      setCurrentUserEmail(session.user.email || "");

      // If an admin row was created ahead of time (by email), pair it with this account.
      if (session.user.email) {
        await supabase
          .from("admin_users")
          .update({ user_id: session.user.id })
          .eq("email", session.user.email);
      }

      await checkAdminStatus(session.user.id);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }

      // Avoid running extra backend calls inside the auth callback directly.
      setTimeout(() => {
        void initForSession(session);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        void initForSession(session);
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
      fetchSiteContent();
      fetchChangeHistory();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchChangeHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("change_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching change history:", error);
    } else {
      setChangeHistory(data || []);
    }
    setLoadingHistory(false);
  };

  const logChange = async (section: string, action: string, details?: Record<string, unknown>) => {
    await supabase.from("change_history").insert([{
      user_email: currentUserEmail,
      section,
      action,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    }]);
    fetchChangeHistory();
  };

  const fetchSiteContent = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("*");

    if (data) {
      data.forEach((item: { key: string; content: unknown }) => {
        if (item.key === "informacni_souhlas") {
          setInformacniSouhlas(item.content as InformacniSouhlasContent);
        } else if (item.key === "kontakt") {
          setKontakt(item.content as KontaktContent);
        } else if (item.key === "o_mne") {
          setOMne(item.content as OMneContent);
        } else if (item.key === "jak_probiha") {
          const content = item.content as JakProbihaContent;
          if (content.steps && content.steps.length > 0) {
            setJakProbiha(content);
          }
        }
      });
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při nahrávání: " + err.message);
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při mazání: " + err.message);
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
      const { error } = await supabase.from("admin_users").insert({
        user_id: crypto.randomUUID(),
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba: " + err.message);
    }
  };

  const handleSaveInformacniSouhlas = async () => {
    setSavingContent(true);
    try {
      const { error } = await supabase
        .from("site_content")
        .update({ content: JSON.parse(JSON.stringify(informacniSouhlas)), updated_at: new Date().toISOString() })
        .eq("key", "informacni_souhlas");

      if (error) throw error;
      await logChange("Informovaný souhlas", "Aktualizace", { sectionsCount: informacniSouhlas.sections.length });
      toast.success("Informovaný souhlas byl uložen!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveKontakt = async () => {
    setSavingContent(true);
    try {
      let photoUrl = kontakt.photo_url;

      // Upload new photo if selected
      if (contactPhotoFile) {
        const fileExt = contactPhotoFile.name.split(".").pop();
        const fileName = `coach-photo-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("contact-photos")
          .upload(fileName, contactPhotoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("contact-photos")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      // Check if kontakt exists, if not create it
      const { data: existingData } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", "kontakt")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("site_content")
          .update({ 
            content: JSON.parse(JSON.stringify({ ...kontakt, photo_url: photoUrl })), 
            updated_at: new Date().toISOString() 
          })
          .eq("key", "kontakt");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ 
            key: "kontakt",
            content: JSON.parse(JSON.stringify({ ...kontakt, photo_url: photoUrl }))
          });

        if (error) throw error;
      }
      
      setKontakt(prev => ({ ...prev, photo_url: photoUrl }));
      setContactPhotoFile(null);
      await logChange("Kontakt", "Aktualizace", { name: kontakt.name, email: kontakt.email });
      toast.success("Kontakt byl uložen!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveOMne = async () => {
    setSavingContent(true);
    try {
      // Check if o_mne exists, if not create it
      const { data: existingData } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", "o_mne")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("site_content")
          .update({ 
            content: JSON.parse(JSON.stringify(oMne)), 
            updated_at: new Date().toISOString() 
          })
          .eq("key", "o_mne");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ 
            key: "o_mne",
            content: JSON.parse(JSON.stringify(oMne))
          });

        if (error) throw error;
      }
      
      await logChange("O mně", "Aktualizace", { kdoJsemLength: oMne.kdoJsem.length, procSeMnouLength: oMne.procSeMnou.length });
      toast.success("Sekce 'O mně' byla uložena!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveJakProbiha = async () => {
    setSavingContent(true);
    try {
      const { data: existingData } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", "jak_probiha")
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from("site_content")
          .update({ 
            content: JSON.parse(JSON.stringify(jakProbiha)), 
            updated_at: new Date().toISOString() 
          })
          .eq("key", "jak_probiha");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ 
            key: "jak_probiha",
            content: JSON.parse(JSON.stringify(jakProbiha))
          });

        if (error) throw error;
      }
      
      await logChange("Jak probíhá koučink", "Aktualizace", { stepsCount: jakProbiha.steps.length });
      toast.success("Sekce 'Jak probíhá koučink' byla uložena!");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při ukládání: " + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const addCoachingStep = () => {
    setJakProbiha(prev => ({
      ...prev,
      steps: [...prev.steps, { title: "", text: "" }]
    }));
  };

  const removeCoachingStep = (index: number) => {
    setJakProbiha(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateCoachingStep = (index: number, field: keyof CoachingStep, value: string | string[]) => {
    setJakProbiha(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const addSection = () => {
    setInformacniSouhlas(prev => ({
      ...prev,
      sections: [...prev.sections, { title: "", text: "" }]
    }));
  };

  const removeSection = (index: number) => {
    setInformacniSouhlas(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: keyof Section, value: string | string[]) => {
    setInformacniSouhlas(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
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
            <TabsList className="glass-card p-1 flex-wrap h-auto">
              <TabsTrigger value="diplomas" className="gap-2">
                <Upload className="w-4 h-4" />
                Diplomy
              </TabsTrigger>
              <TabsTrigger value="informacni-souhlas" className="gap-2">
                <FileText className="w-4 h-4" />
                Informovaný souhlas
              </TabsTrigger>
              <TabsTrigger value="kontakt" className="gap-2">
                <Phone className="w-4 h-4" />
                Kontakt
              </TabsTrigger>
              <TabsTrigger value="o-mne" className="gap-2">
                <User className="w-4 h-4" />
                O mně
              </TabsTrigger>
              <TabsTrigger value="jak-probiha" className="gap-2">
                <ListOrdered className="w-4 h-4" />
                Jak probíhá
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="cenik" className="gap-2">
                <Coins className="w-4 h-4" />
                Ceník
              </TabsTrigger>
              <TabsTrigger value="eticky-kodex" className="gap-2">
                <Scale className="w-4 h-4" />
                Etický kodex
              </TabsTrigger>
              <TabsTrigger value="reference" className="gap-2">
                <Quote className="w-4 h-4" />
                Reference
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Users className="w-4 h-4" />
                Správa adminů
              </TabsTrigger>
              <TabsTrigger value="historie" className="gap-2">
                <History className="w-4 h-4" />
                Historie změn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blog">
              <BlogManagement currentUserEmail={currentUserEmail} onLogChange={logChange} />
            </TabsContent>

            <TabsContent value="cenik">
              <CenikManagement onLogChange={logChange} />
            </TabsContent>

            <TabsContent value="eticky-kodex">
              <EtickyKodexManagement onLogChange={logChange} />
            </TabsContent>

            <TabsContent value="reference">
              <TestimonialsManagement onLogChange={logChange} />
            </TabsContent>

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

            <TabsContent value="informacni-souhlas" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Upravit Informovaný souhlas
                </h1>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Úvodní text</Label>
                    <Textarea
                      value={informacniSouhlas.intro}
                      onChange={(e) => setInformacniSouhlas(prev => ({ ...prev, intro: e.target.value }))}
                      className="bg-white/50 border-primary/20 focus:border-primary min-h-[100px]"
                      placeholder="Úvodní text dokumentu..."
                    />
                  </div>

                  <div className="space-y-4">
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

                    {informacniSouhlas.sections.map((section, index) => (
                      <div key={index} className="bg-white/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground font-medium">Sekce {index + 1}</Label>
                          <Button
                            type="button"
                            onClick={() => removeSection(index)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(index, "title", e.target.value)}
                          placeholder="Název sekce"
                          className="bg-white/50 border-primary/20 focus:border-primary"
                        />
                        
                        <Textarea
                          value={section.text || ""}
                          onChange={(e) => updateSection(index, "text", e.target.value)}
                          placeholder="Text sekce..."
                          className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
                        />

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
                  </div>

                  <Button
                    onClick={handleSaveInformacniSouhlas}
                    disabled={savingContent}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4" />
                    {savingContent ? "Ukládání..." : "Uložit změny"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="kontakt" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Upravit Kontakt
                </h1>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">Úvodní text</Label>
                    <Textarea
                      value={kontakt.intro}
                      onChange={(e) => setKontakt(prev => ({ ...prev, intro: e.target.value }))}
                      className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Jméno</Label>
                      <Input
                        value={kontakt.name}
                        onChange={(e) => setKontakt(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/50 border-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">E-mail</Label>
                      <Input
                        type="email"
                        value={kontakt.email}
                        onChange={(e) => setKontakt(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/50 border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Adresa</Label>
                      <Input
                        value={kontakt.address}
                        onChange={(e) => setKontakt(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-white/50 border-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Telefon (volitelné)</Label>
                      <Input
                        type="tel"
                        value={kontakt.phone}
                        onChange={(e) => setKontakt(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+420 123 456 789"
                        className="bg-white/50 border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Fotografie</Label>
                    <div className="flex items-center gap-4">
                      {(kontakt.photo_url || contactPhotoFile) && (
                        <img
                          src={contactPhotoFile ? URL.createObjectURL(contactPhotoFile) : kontakt.photo_url}
                          alt="Náhled"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setContactPhotoFile(e.target.files?.[0] || null)}
                        className="bg-white/50 border-primary/20 focus:border-primary flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pokud nevyberete novou fotku, zůstane původní.
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveKontakt}
                    disabled={savingContent}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4" />
                    {savingContent ? "Ukládání..." : "Uložit změny"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="o-mne" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Upravit sekci "O mně"
                </h1>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Kdo jsem?</Label>
                    <Textarea
                      value={oMne.kdoJsem}
                      onChange={(e) => setOMne(prev => ({ ...prev, kdoJsem: e.target.value }))}
                      className="bg-white/50 border-primary/20 focus:border-primary min-h-[200px]"
                      placeholder="Text pro sekci 'Kdo jsem?'..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Proč se mnou?</Label>
                    <Textarea
                      value={oMne.procSeMnou}
                      onChange={(e) => setOMne(prev => ({ ...prev, procSeMnou: e.target.value }))}
                      className="bg-white/50 border-primary/20 focus:border-primary min-h-[200px]"
                      placeholder="Text pro sekci 'Proč se mnou?'..."
                    />
                  </div>

                  <Button
                    onClick={handleSaveOMne}
                    disabled={savingContent}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4" />
                    {savingContent ? "Ukládání..." : "Uložit změny"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="jak-probiha" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Upravit sekci "Jak probíhá koučink"
                </h1>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground text-lg">Kroky procesu</Label>
                    <Button
                      type="button"
                      onClick={addCoachingStep}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Přidat krok
                    </Button>
                  </div>

                  {jakProbiha.steps.map((step, index) => (
                    <div key={index} className="bg-white/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground font-medium flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                            {index + 1}
                          </span>
                          Krok {index + 1}
                        </Label>
                        <Button
                          type="button"
                          onClick={() => removeCoachingStep(index)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={jakProbiha.steps.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Název kroku</Label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateCoachingStep(index, "title", e.target.value)}
                          placeholder="Název kroku"
                          className="bg-white/50 border-primary/20 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Popis kroku</Label>
                        <Textarea
                          value={step.text}
                          onChange={(e) => updateCoachingStep(index, "text", e.target.value)}
                          placeholder="Popis kroku..."
                          className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Štítky (každý na novém řádku, volitelné)
                        </Label>
                        <Textarea
                          value={step.tags?.join("\n") || ""}
                          onChange={(e) => updateCoachingStep(index, "tags", e.target.value.split("\n").filter(Boolean))}
                          placeholder="Online: Zoom, Skype&#10;Osobně: Lanškroun&#10;Délka: 60 minut"
                          className="bg-white/50 border-primary/20 focus:border-primary min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleSaveJakProbiha}
                    disabled={savingContent}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="w-4 h-4" />
                    {savingContent ? "Ukládání..." : "Uložit změny"}
                  </Button>
                </div>
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

            <TabsContent value="historie" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-8"
              >
                <h1 className="text-2xl font-display font-semibold text-primary mb-6">
                  Historie změn
                </h1>

                {loadingHistory ? (
                  <p className="text-muted-foreground">Načítání historie...</p>
                ) : changeHistory.length === 0 ? (
                  <p className="text-muted-foreground">Zatím nebyly zaznamenány žádné změny.</p>
                ) : (
                  <div className="space-y-3">
                    {changeHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 bg-white/30 rounded-lg p-4"
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">{item.section}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-primary">{item.action}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.user_email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString('cs-CZ', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
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