import { useEffect, useRef, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const dismissed = useRef(false);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setExiting(true);
    setTimeout(() => onDone(), 650);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1700);
    const t4 = setTimeout(() => setPhase(4), 2400);
    // Fallback auto-dismiss after 10s
    const t5 = setTimeout(() => dismiss(), 10000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60) dismiss(); // swipe down ≥ 60px
    touchStartY.current = null;
  };

  // Mouse drag fallback for desktop
  const mouseStartY = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => { mouseStartY.current = e.clientY; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStartY.current === null) return;
    if (e.clientY - mouseStartY.current > 60) dismiss();
    mouseStartY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: "#080808",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.65s ease",
        pointerEvents: exiting ? "none" : "all",
        cursor: "grab",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Orbe principal */}
      <div style={{
        position: "absolute",
        bottom: "-8%",
        left: "50%",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background: "radial-gradient(circle at 38% 38%, #E8500A 0%, #C0392B 40%, #3a0800 72%, transparent 100%)",
        filter: "blur(64px)",
        opacity: phase >= 1 ? 0.9 : 0,
        transform: phase >= 1 ? "translateX(-50%) translateY(0%)" : "translateX(-50%) translateY(28%)",
        transition: "opacity 1.2s ease, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: phase >= 1 ? "orb-breathe 4s ease-in-out infinite" : undefined,
        pointerEvents: "none",
      }} />

      {/* Orbe secondaire */}
      <div style={{
        position: "absolute", bottom: "14%", right: "8%",
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, #D4832A 0%, transparent 70%)",
        filter: "blur(40px)",
        opacity: phase >= 1 ? 0.45 : 0,
        transition: "opacity 1.5s ease 0.3s",
        pointerEvents: "none",
      }} />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 42, fontWeight: 400,
          letterSpacing: "-0.5px", lineHeight: 1.15, color: "#ffffff",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.85s ease, transform 0.85s ease",
          textShadow: "0 0 60px rgba(232,80,10,0.4)",
        }}>
          What's the Move
        </h1>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11, color: "#E8DCC8", letterSpacing: "0.06em", marginTop: 18,
          opacity: phase >= 3 ? 0.7 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          The night doesn't wait. Neither should you.
        </p>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: "#E8500A", fontStyle: "italic", marginTop: 12,
          opacity: phase >= 4 ? 0.8 : 0,
          transition: "opacity 0.6s ease 0.1s",
        }}>
          Somewhere in this city, the night just started.
        </p>
      </div>

      {/* Swipe indicator */}
      <div style={{
        position: "absolute", bottom: 44,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: phase >= 4 ? 1 : 0,
        transition: "opacity 0.6s ease 0.4s",
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase", letterSpacing: "0.14em",
        }}>
          Glisse vers le bas
        </span>
        <div style={{ animation: phase >= 4 ? "pulse-arrow 1.6s ease-in-out infinite" : undefined }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M9 2L9 18M9 18L3 11M9 18L15 11"
              stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
