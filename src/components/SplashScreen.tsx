import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // orb rises
      setTimeout(() => setPhase(2), 1000),  // title appears
      setTimeout(() => setPhase(3), 1700),  // tagline appears
      setTimeout(() => setPhase(4), 2400),  // micro phrase + arrow
      setTimeout(() => setExiting(true), 3200), // fade out
      setTimeout(() => onDone(), 3900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#080808",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Orb */}
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "50%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 38%, #E8500A 0%, #C0392B 40%, #3a0800 72%, transparent 100%)",
          filter: "blur(64px)",
          opacity: phase >= 1 ? 0.9 : 0,
          transform: phase >= 1
            ? "translateX(-50%) translateY(0%)"
            : "translateX(-50%) translateY(28%)",
          transition: "opacity 1.2s ease, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
          animation: phase >= 1 ? "orb-breathe 4s ease-in-out infinite" : undefined,
        }}
      />

      {/* Small secondary orb */}
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "10%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, #D4832A 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: phase >= 1 ? 0.5 : 0,
          transition: "opacity 1.5s ease 0.3s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* App name */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 42,
            fontWeight: 400,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            color: "#ffffff",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.85s ease, transform 0.85s ease",
            textShadow: "0 0 60px rgba(232,80,10,0.4)",
          }}
        >
          What's the Move
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: "#E8DCC8",
            letterSpacing: "0.06em",
            marginTop: 18,
            opacity: phase >= 3 ? 0.7 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          The night doesn't wait. Neither should you.
        </p>

        {/* Micro phrase */}
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: "#E8500A",
            fontStyle: "italic",
            marginTop: 12,
            opacity: phase >= 4 ? 0.8 : 0,
            transition: "opacity 0.6s ease 0.1s",
          }}
        >
          Somewhere in this city, the night just started.
        </p>
      </div>

      {/* Scroll arrow */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          opacity: phase >= 4 ? 1 : 0,
          transition: "opacity 0.5s ease 0.3s",
          animation: phase >= 4 ? "pulse-arrow 1.6s ease-in-out infinite" : undefined,
        }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <path
            d="M10 2L10 20M10 20L4 13M10 20L16 13"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
