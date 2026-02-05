import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Chyba při přihlášení přes Google: " + error.message);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Chyba při přihlášení přes Google: " + err.message);
    } finally {
      setLoading(false);
    }
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/70 text-muted-foreground">nebo</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border-primary/30 hover:bg-primary/10 gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Přihlásit se přes Google
            </Button>

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
