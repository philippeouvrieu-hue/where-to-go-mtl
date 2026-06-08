import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell, Shield, FileText, HelpCircle, Info, LogOut, ChevronRight,
  User, Flag, Share2, Star, Mail, Lock, Trash2
} from "lucide-react";
import { toast } from "sonner";

const APP_VERSION = "1.0.0";

type RowProps = {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  value?: string;
  iconBg?: string;
};

const Row = ({ icon, label, sub, to, onClick, danger, value, iconBg }: RowProps) => {
  const content = (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:opacity-70"
      style={{ background: "#13131f" }}
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg ?? "rgba(255,255,255,0.06)" }}
      >
        <span className={danger ? "text-red-400" : "text-white/60"} style={{ display: "flex" }}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>{label}</div>
        {sub && <div className="text-xs text-white/35 mt-0.5">{sub}</div>}
      </div>
      {value && <span className="text-xs text-white/30 flex-shrink-0">{value}</span>}
      {(to || onClick) && !danger && <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />}
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return <button className="w-full text-left">{content}</button>;
};

const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-4 pt-6 pb-2">
    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">{label}</span>
  </div>
);

const Divider = () => <div className="mx-4" style={{ height: "1px", background: "#1e1e2e" }} />;

const Account = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnecté");
  };

  const handleShare = async () => {
    const url = "https://where-to-go-mtl.vercel.app";
    if (navigator.share) {
      await navigator.share({ title: "Where To Go Montréal", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  const handleNotAvailable = () => toast.info("Disponible prochainement");

  return (
    <Layout>
      <div className="pb-8">
        {/* Header */}
        <div className="container pt-8 pb-4">
          <h1 className="font-display font-black text-3xl tracking-tight text-white">Paramètres</h1>
        </div>

        {/* Account info */}
        {user && (
          <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ background: "#13131f", border: "1px solid #1e1e2e" }}>
            <div className="flex items-center gap-3.5 p-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f0146b, #7c3aed)" }}
              >
                {user.email?.[0].toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user.email}</div>
                <div className="text-[11px] text-white/35 mt-0.5">Compte connecté</div>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ background: "#13131f", border: "1px solid #1e1e2e" }}>
            <div className="p-4 space-y-3">
              <p className="text-sm text-white/50">Connecte-toi pour sauvegarder tes soirées préférées.</p>
              <Link
                to="/auth"
                className="block text-center text-sm font-bold py-2.5 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #f0146b, #7c3aed)", color: "white" }}
              >
                Connexion / Inscription
              </Link>
            </div>
          </div>
        )}

        {/* Mon compte */}
        {user && (
          <>
            <SectionLabel label="Mon compte" />
            <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e2e" }}>
              <Row icon={<User className="h-4 w-4" />} label="Modifier le profil" iconBg="rgba(240,20,107,0.15)" onClick={handleNotAvailable} />
              <Divider />
              <Row icon={<Lock className="h-4 w-4" />} label="Changer le mot de passe" onClick={handleNotAvailable} />
              <Divider />
              <Row icon={<Mail className="h-4 w-4" />} label="Adresse e-mail" value={user.email?.split("@")[0] + "…"} onClick={handleNotAvailable} />
            </div>
          </>
        )}

        {/* Préférences */}
        <SectionLabel label="Préférences" />
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e2e" }}>
          <Row
            icon={<Bell className="h-4 w-4" />}
            label="Notifications"
            sub="Alertes ce soir, nouveaux événements"
            iconBg="rgba(245,158,11,0.15)"
            onClick={handleNotAvailable}
          />
          <Divider />
          <Row
            icon={<Star className="h-4 w-4" />}
            label="Mes styles musicaux"
            sub="Techno, house, rap…"
            iconBg="rgba(99,102,241,0.15)"
            onClick={handleNotAvailable}
          />
        </div>

        {/* À propos & aide */}
        <SectionLabel label="À propos" />
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e2e" }}>
          <Row
            icon={<Shield className="h-4 w-4" />}
            label="Politique de confidentialité"
            iconBg="rgba(77,166,255,0.15)"
            onClick={handleNotAvailable}
          />
          <Divider />
          <Row
            icon={<FileText className="h-4 w-4" />}
            label="Conditions d'utilisation"
            onClick={handleNotAvailable}
          />
          <Divider />
          <Row
            icon={<Info className="h-4 w-4" />}
            label="Version de l'app"
            value={APP_VERSION}
            iconBg="rgba(255,255,255,0.05)"
            onClick={() => {}}
          />
        </div>

        {/* Support */}
        <SectionLabel label="Support" />
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1e2e" }}>
          <Row
            icon={<HelpCircle className="h-4 w-4" />}
            label="Aide & FAQ"
            iconBg="rgba(52,211,153,0.15)"
            onClick={handleNotAvailable}
          />
          <Divider />
          <Row
            icon={<Flag className="h-4 w-4" />}
            label="Signaler un problème"
            sub="Un event incorrect, un bug…"
            onClick={handleNotAvailable}
          />
          <Divider />
          <Row
            icon={<Share2 className="h-4 w-4" />}
            label="Partager l'app"
            sub="Faire découvrir Where To Go"
            iconBg="rgba(240,20,107,0.1)"
            onClick={handleShare}
          />
        </div>

        {/* Danger zone */}
        {user && (
          <>
            <SectionLabel label="Compte" />
            <div className="mx-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
              <Row
                icon={<LogOut className="h-4 w-4" />}
                label="Se déconnecter"
                danger
                onClick={handleSignOut}
              />
              <Divider />
              <Row
                icon={<Trash2 className="h-4 w-4" />}
                label="Supprimer mon compte"
                danger
                onClick={handleNotAvailable}
              />
            </div>
          </>
        )}

        <p className="text-center text-[11px] text-white/15 mt-8 px-4">
          Where To Go Montréal · v{APP_VERSION}<br />
          Fait à Montréal 🇨🇦
        </p>
      </div>
    </Layout>
  );
};

export default Account;
