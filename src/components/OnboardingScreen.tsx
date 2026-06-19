import { useNavigate } from "react-router-dom";

interface OnboardingScreenProps {
  onSkip: () => void;
}

export const OnboardingScreen = ({ onSkip }: OnboardingScreenProps) => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    localStorage.setItem("wtm_onboarded", "1");
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/auth");
  };

  const handleSkip = () => {
    localStorage.setItem("wtm_onboarded", "1");
    window.scrollTo({ top: 0, behavior: "instant" });
    onSkip();
  };

  return (
    <div
      className="fixed inset-0 z-[9997] flex flex-col items-center justify-between overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* Orb background */}
      <div style={{
        position: "absolute",
        bottom: "-10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(232,80,10,0.25) 0%, rgba(192,57,43,0.12) 50%, transparent 75%)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        top: "5%",
        right: "-5%",
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,80,10,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      {/* Top spacer */}
      <div />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 gap-6">
        {/* Label */}
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8500A" }} />
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
          }}>
            Montréal
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2.4rem, 10vw, 3.6rem)",
          fontWeight: 400,
          color: "#ffffff",
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
          marginTop: -4,
        }}>
          What's the Move
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
          maxWidth: 260,
        }}>
          La nuit appartient à ceux qui savent où aller.
        </p>

        {/* Divider */}
        <div style={{
          width: 32,
          height: 1,
          background: "rgba(232,80,10,0.4)",
          marginTop: 4,
        }} />

        {/* Value props */}
        <div className="flex flex-col gap-3 text-left w-full max-w-xs">
          {[
            ["🎵", "Découvre les meilleurs events techno, house, afro…"],
            ["🗺️", "Vois ce qui se passe ce soir près de toi"],
            ["❤️", "Sauvegarde tes soirées préférées"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-start gap-3">
              <span style={{ fontSize: 16, lineHeight: 1.5 }}>{icon}</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.5,
              }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 flex flex-col items-center gap-4 w-full px-8 pb-14">
        {/* Create account button */}
        <button
          onClick={handleCreateAccount}
          style={{
            width: "100%",
            maxWidth: 320,
            padding: "16px 24px",
            background: "linear-gradient(135deg, #E8500A 0%, #C0392B 100%)",
            border: "none",
            borderRadius: 12,
            color: "#ffffff",
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(232,80,10,0.35)",
          }}
        >
          Créer mon compte
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.06em",
            cursor: "pointer",
            padding: "8px 16px",
          }}
        >
          Continuer sans compte →
        </button>
      </div>
    </div>
  );
};
