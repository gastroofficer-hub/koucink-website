import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import backgroundImage from "@/assets/background.jpg";
import { motion } from "framer-motion";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Update admin_users with correct user_id if email matches
          setTimeout(() => {
            updateAdminUserId(session.user.id, session.user.email || "");
          }, 0);
          navigate("/admin");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const updateAdminUserId = async (userId: string, email: string) => {
    // Try to update admin_users with actual user_id based on email
    await supabase
      .from("admin_users")
      .update({ user_id: userId })
      .eq("email", email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
        
        // If this is the first user, make them admin
        const { count } = await supabase
          .from("admin_users")
          .select("*", { count: "exact", head: true });
        
        if (count === 0 && data.user) {
          await supabase.from("admin_users").insert({
            user_id: data.user.id,
            email: email,
          });
        }
        
        toast.success("Registrace úspěšná!");
        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Přihlášení úspěšné!");
        navigate("/admin");
      }
    } catch (error: any) {
      if (error.message === "User already registered") {
        toast.error("Tento e-mail je již registrován.");
      } else if (error.message === "Invalid login credentials") {
        toast.error("Nesprávný e-mail nebo heslo.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      
      if (error) throw error;
      
      toast.success("E-mail s odkazem pro reset hesla byl odeslán!");
      setIsResetPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se odeslat e-mail pro reset hesla.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-display font-semibold text-primary text-center mb-6">
          {isResetPassword 
            ? "Obnovení hesla" 
            : isSignUp 
              ? "Registrace" 
              : "Přihlášení do administrace"}
        </h1>

        {isResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/50 border-primary/20 focus:border-primary"
                placeholder="Zadejte váš e-mail"
                required
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Na váš e-mail bude zaslán odkaz pro obnovení hesla.
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Odesílám..." : "Odeslat odkaz pro reset"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Zpět na přihlášení
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-primary/20 focus:border-primary"
                  minLength={6}
                  required
                />
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-sm text-gold hover:text-primary transition-colors"
                  >
                    Zapomenuté heslo?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Načítání..." : isSignUp ? "Registrovat" : "Přihlásit se"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? "Již máte účet? Přihlaste se"
                  : "Nemáte účet? Zaregistrujte se"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
