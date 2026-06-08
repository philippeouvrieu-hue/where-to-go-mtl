import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` }
        });
        if (error) throw error;
        toast.success("Compte créé !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="container max-w-md py-16">
        <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-card space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold">{mode === "signin" ? "Connexion" : "Créer un compte"}</h1>
            <p className="text-sm text-muted-foreground">Sauvegardez vos événements et ne ratez aucune soirée.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Mot de passe</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
            </div>
            <button disabled={loading} className="w-full py-3 rounded-md bg-gradient-primary font-display font-semibold shadow-glow disabled:opacity-50">
              {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
            {mode === "signin" ? "Pas encore de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </Layout>
  );
};
export default Auth;
