import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ChevronLeft } from "lucide-react";

const MONO = "'Space Mono', monospace";
const EDIT = "'Playfair Display', Georgia, serif";
const ORANGE = "#E8500A";
const MUTED = "rgba(255,255,255,0.55)";
const FAINT = "rgba(255,255,255,0.28)";
const BORDER = "rgba(255,255,255,0.07)";

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

const Terms = () => {
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
            <h1 style={{ fontFamily: EDIT, fontSize: 28, fontWeight: 400, color: "#fff" }}>Conditions d'utilisation</h1>
          </div>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, paddingLeft: 52, marginBottom: 8 }}>Mise à jour : 19 juin 2026</p>

        <div className="px-5">

          <Section title="1. Acceptation">
            <P>En utilisant <strong style={{ color: "#fff" }}>What's the Move</strong>, tu acceptes ces conditions. Accord entre toi et Philippe Ouvrieu (<span style={{ color: ORANGE }}>philippe.ouvrieu@gmail.com</span>).</P>
          </Section>

          <Section title="2. Le service">
            <P>What's the Move recense et recommande des événements nocturnes à Montréal. Le service est gratuit. Certaines fonctionnalités (favoris, recommandations) nécessitent un compte.</P>
          </Section>

          <Section title="3. Éligibilité">
            <div style={{ background: "rgba(232,80,10,0.08)", border: "1px solid rgba(232,80,10,0.18)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <P>L'app s'adresse exclusivement aux personnes de <strong style={{ color: "#fff" }}>18 ans et plus</strong>. Les événements présentés se déroulent dans des établissements pour adultes.</P>
            </div>
          </Section>

          <Section title="4. Compte utilisateur">
            <P>Tu peux utiliser l'app sans compte pour consulter les événements. Un compte est nécessaire pour :</P>
            <Li>Sauvegarder des événements en favoris</Li>
            <Li>Accéder à tes favoris sur plusieurs appareils</Li>
            <Li>Recevoir des recommandations personnalisées</Li>
            <P style={{ marginTop: 8 }}>Tu es responsable de la confidentialité de ton mot de passe et de toute activité effectuée depuis ton compte.</P>
          </Section>

          <Section title="5. Utilisation acceptable">
            <P>Tu t'engages à ne pas :</P>
            <Li>Utiliser l'app à des fins illégales ou frauduleuses</Li>
            <Li>Tenter d'accéder à des données non autorisées</Li>
            <Li>Reproduire le contenu de l'app sans autorisation</Li>
            <Li>Tenter de perturber le fonctionnement du service</Li>
          </Section>

          <Section title="6. Exactitude des informations">
            <div style={{ background: "rgba(232,80,10,0.08)", border: "1px solid rgba(232,80,10,0.18)", borderRadius: 10, padding: 16 }}>
              <P>⚠️ Les informations sur les événements (dates, artistes, prix) proviennent de sources tierces et peuvent évoluer. <strong style={{ color: "#fff" }}>Vérifie toujours auprès de l'organisateur avant de te déplacer.</strong></P>
            </div>
          </Section>

          <Section title="7. Propriété intellectuelle">
            <P>L'app, son design, son code et ses fonctionnalités sont la propriété de Philippe Ouvrieu. Tous droits réservés.</P>
          </Section>

          <Section title="8. Limitation de responsabilité">
            <P>What's the Move est fourni "tel quel". Nous ne garantissons pas une disponibilité permanente ni l'exactitude de toutes les informations. Nous ne sommes pas responsables des dommages liés à l'utilisation de l'app ou à la fréquentation d'un événement référencé.</P>
          </Section>

          <Section title="9. Résiliation">
            <P>Tu peux supprimer ton compte à tout moment : <strong style={{ color: "#fff" }}>Compte → Supprimer mon compte</strong>.</P>
          </Section>

          <Section title="10. Droit applicable">
            <P>Ces conditions sont régies par les lois du Québec et du Canada. Tout litige sera soumis aux tribunaux de Montréal.</P>
          </Section>

          <Section title="11. Contact">
            <P>📧 <span style={{ color: ORANGE }}>philippe.ouvrieu@gmail.com</span></P>
          </Section>

        </div>
      </div>
    </Layout>
  );
};

export default Terms;
