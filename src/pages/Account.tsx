import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Shield, FileText, HelpCircle, Info, LogOut, ChevronRight, User, Flag, Share2, Star, Mail, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

const APP_VERSION = "1.0.0";
const MONO = "'Space Mono', monospace";
const EDIT = "'Playfair Display', Georgia, serif";
const ORANGE = "#E8500A";
const CARD_BG = "#0f0f0f";
const BORDER = "rgba(255,255,255,0.07)";

type RowProps = {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  value?: string;
  iconColor?: string;
};

const Row = ({ icon, label, sub, to, onClick, danger, value, iconColor }: RowProps) => {
  const content = (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 transition-opacity active:opacity-60"
      style={{ background: CARD_BG }}
      onClick={onClick}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: danger ? "rgba(192,57,43,0.12)" : "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: danger ? "#C0392B" : (iconColor ?? "rgba(255,255,255,0.5)"),
      }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: danger ? "#C0392B" : "#fff" }}>{label}</div>
        {sub && <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</div>}
      </div>
      {value && <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>{value}</span>}
      {(to || onClick) && !danger && <ChevronRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.18)", flexShrink: 0 }} />}
    </div>
  );
  if (to) return <Link to={to} style={{ textDecoration: "none" }}>{content}</Link>;
  return <button className="w-full text-left">{content}</button>;
};

const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ padding: "24px 20px 8px" }}>
    <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)" }}>{label}</span>
  </div>
);

const Divider = () => <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginLeft: 20 }} />;

const Account = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => { await signOut(); toast.success("Déconnecté"); };
  const handleShare = async () => {
    const url = "https://where-to-go-mtl.vercel.app";
    if (navigator.share) {
      await navigator.share({ title: "What's the Move — Montréal", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };
  const handleNotAvailable = () => toast.info("Disponible prochainement");

  return (
    <Layout>
      <div className="pb-10">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <p style={{ fontFamily: MONO, fontSize: 10, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
            Mon compte
          </p>
          <h1 style={{ fontFamily: EDIT, fontSize: 32, fontWeight: 400, color: "#fff" }}>Paramètres</h1>
        </div>

        {/* Avatar / user card */}
        {user ? (
          <div className="mx-5 mb-2 rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-4 p-4">
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #C0392B, #E8500A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: EDIT, fontSize: 20, fontWeight: 700, color: "#fff",
              }}>
                {user.email?.[0].toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#fff" }} className="truncate">{user.email}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Compte connecté</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-5 mb-2 rounded-2xl overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="p-4 space-y-3">
              <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Connecte-toi pour sauvegarder tes soirées préférées.</p>
              <Link
                to="/auth"
                style={{
                  display: "block", textAlign: "center", fontFamily: EDIT, fontSize: 15, fontWeight: 500,
                  padding: "12px", borderRadius: 12, textDecoration: "none", color: "#fff",
                  background: "linear-gradient(90deg, #C0392B, #E8500A)",
                }}
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
            <div className="mx-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
              <Row icon={<User style={{ width: 16, height: 16 }} />} label="Modifier le profil" iconColor={ORANGE} onClick={handleNotAvailable} />
              <Divider />
              <Row icon={<Lock style={{ width: 16, height: 16 }} />} label="Changer le mot de passe" onClick={handleNotAvailable} />
              <Divider />
              <Row icon={<Mail style={{ width: 16, height: 16 }} />} label="Adresse e-mail" value={user.email?.split("@")[0] + "…"} onClick={handleNotAvailable} />
            </div>
          </>
        )}

        {/* Préférences */}
        <SectionLabel label="Préférences" />
        <div className="mx-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <Row icon={<Bell style={{ width: 16, height: 16 }} />} label="Notifications" sub="Alertes ce soir, nouveaux événements" iconColor="#D4832A" onClick={handleNotAvailable} />
          <Divider />
          <Row icon={<Star style={{ width: 16, height: 16 }} />} label="Mes styles musicaux" sub="Techno, house, rap…" iconColor="#9B4BA8" onClick={handleNotAvailable} />
        </div>

        {/* À propos */}
        <SectionLabel label="À propos" />
        <div className="mx-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <Row icon={<Shield style={{ width: 16, height: 16 }} />} label="Politique de confidentialité" onClick={() => window.open("/privacy-policy.html", "_blank")} />
          <Divider />
          <Row icon={<FileText style={{ width: 16, height: 16 }} />} label="Conditions d'utilisation" onClick={() => window.open("/terms.html", "_blank")} />
          <Divider />
          <Row icon={<Info style={{ width: 16, height: 16 }} />} label="Version de l'app" value={APP_VERSION} onClick={() => {}} />
        </div>

        {/* Support */}
        <SectionLabel label="Support" />
        <div className="mx-5 rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <Row icon={<HelpCircle style={{ width: 16, height: 16 }} />} label="Aide & FAQ" iconColor="#10b981" onClick={handleNotAvailable} />
          <Divider />
          <Row icon={<Flag style={{ width: 16, height: 16 }} />} label="Signaler un problème" sub="Un event incorrect, un bug…" onClick={handleNotAvailable} />
          <Divider />
          <Row icon={<Share2 style={{ width: 16, height: 16 }} />} label="Partager l'app" sub="Faire découvrir What's the Move" iconColor={ORANGE} onClick={handleShare} />
        </div>

        {/* Déconnexion */}
        {user && (
          <>
            <SectionLabel label="Compte" />
            <div className="mx-5 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(192,57,43,0.2)" }}>
              <Row icon={<LogOut style={{ width: 16, height: 16 }} />} label="Se déconnecter" danger onClick={handleSignOut} />
              <Divider />
              <Row icon={<Trash2 style={{ width: 16, height: 16 }} />} label="Supprimer mon compte" danger onClick={handleNotAvailable} />
            </div>
          </>
        )}

        <p style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.12)", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
          What's the Move · Montréal · v{APP_VERSION}
        </p>
      </div>
    </Layout>
  );
};

export default Account;
