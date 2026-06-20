import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ChevronLeft } from "lucide-react";

const MONO = "'Space Mono', monospace";
const EDIT = "'Playfair Display', Georgia, serif";
const ORANGE = "#E8500A";
const MUTED = "rgba(255,255,255,0.55)";
const FAINT = "rgba(255,255,255,0.28)";
const BORDER = "rgba(255,255,255,0.07)";

const Tag = ({ label }: { label: string }) => (
  <div style={{
    display: "inline-block",
    background: "rgba(232,80,10,0.12)",
    color: ORANGE,
    fontFamily: MONO,
    fontSize: 9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    padding: "3px 8px",
    borderRadius: 4,
    marginBottom: 10,
  }}>{label}</div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ paddingTop: 28, paddingBottom: 28, borderBottom: `1px solid ${BORDER}` }}>
    <h2 style={{ fontFamily: EDIT, fontSize: "1.2rem", fontWeight: 400, color: "#fff", marginBottom: 14, letterSpacing: "-0.2px" }}>{title}</h2>
    {children}
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 12 }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, padding: "4px 0" }}>
    <span style={{ color: ORANGE, fontFamily: MONO, flexShrink: 0 }}>—</span>
    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{children}</span>
  </div>
);

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="pb-10">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: FAINT }}>
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 10, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>What's the Move</p>
            <h1 style={{ fontFamily: EDIT, fontSize: 28, fontWeight: 400, color: "#fff" }}>Confidentialité</h1>
          </div>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, paddingLeft: 52, marginBottom: 8 }}>Mise à jour : 19 juin 2026</p>

        <div className="px-5">

          <Section title="1. Qui sommes-nous ?">
            <P><strong style={{ color: "#fff" }}>What's the Move</strong> recense les événements nocturnes à Montréal et propose des recommandations personnalisées.</P>
            <P>Responsable : Philippe Ouvrieu · <span style={{ color: ORANGE }}>philippe.ouvrieu@gmail.com</span></P>
          </Section>

          <Section title="2. Données collectées">
            <Tag label="Compte (optionnel)" />
            <P>Si tu crées un compte : ton <strong style={{ color: "#fff" }}>adresse e-mail</strong> et ton <strong style={{ color: "#fff" }}>mot de passe</strong> (chiffré, jamais en clair).</P>
            <Tag label="Utilisation locale" />
            <P>Un historique léger de tes préférences musicales est stocké sur <em>ton appareil uniquement</em> (localStorage). Ces données ne quittent jamais ton téléphone.</P>
            <Tag label="Favoris" />
            <P>Si tu es connecté·e, tes events sauvegardés sont stockés dans notre base pour être accessibles sur tous tes appareils.</P>
            <div style={{ background: "rgba(232,80,10,0.08)", border: "1px solid rgba(232,80,10,0.18)", borderRadius: 10, padding: 16, marginTop: 12 }}>
              <P>🔒 Nous ne collectons <strong style={{ color: "#fff" }}>pas</strong> ta localisation GPS, pas de cookies publicitaires, pas de données revendues à des tiers.</P>
            </div>
          </Section>

          <Section title="3. Utilisation des données">
            <Li>Créer et gérer ton compte</Li>
            <Li>Te proposer des recommandations de soirées</Li>
            <Li>Sauvegarder tes favoris</Li>
            <Li>Améliorer l'app et corriger les bugs</Li>
          </Section>

          <Section title="4. Stockage et sécurité">
            <Tag label="Infrastructure" />
            <P>Données hébergées chez <strong style={{ color: "#fff" }}>Supabase</strong> (SOC 2 Type 2, chiffrement TLS, serveurs US East).</P>
            <Tag label="Accès" />
            <P>Row Level Security (RLS) activé : chaque utilisateur ne voit que ses propres données.</P>
            <Tag label="Mots de passe" />
            <P>Hachés avec bcrypt. Nous n'avons jamais accès à ton mot de passe en clair.</P>
          </Section>

          <Section title="5. Tes droits (RGPD / Loi 25)">
            <Li>Accéder à tes données</Li>
            <Li>Corriger des informations inexactes</Li>
            <Li>Supprimer ton compte et toutes tes données</Li>
            <Li>Retirer ton consentement à tout moment</Li>
            <P style={{ marginTop: 12 }}>Pour exercer ces droits : <span style={{ color: ORANGE }}>philippe.ouvrieu@gmail.com</span> — réponse sous 30 jours.</P>
            <P>Ou directement dans l'app : <strong style={{ color: "#fff" }}>Compte → Supprimer mon compte</strong>.</P>
          </Section>

          <Section title="6. Services tiers">
            <Li><strong style={{ color: "#fff" }}>Supabase</strong> — base de données et auth</Li>
            <Li><strong style={{ color: "#fff" }}>Vercel</strong> — hébergement</Li>
            <Li><strong style={{ color: "#fff" }}>Google Fonts</strong> — polices</Li>
            <P style={{ marginTop: 8 }}>Pas de Google Analytics, Facebook Pixel ou tracking publicitaire.</P>
          </Section>

          <Section title="7. Contact">
            <P>📧 <span style={{ color: ORANGE }}>philippe.ouvrieu@gmail.com</span></P>
          </Section>

        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
