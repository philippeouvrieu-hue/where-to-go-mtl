import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { EventRow, formatPrice, formatDate, N_I } from "@/lib/events";
import { trackView } from "@/lib/history";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ExternalLink, MapPin, ArrowLeft, Share2, ChevronUp } from "lucide-react";
import { toast } from "sonner";

// Convert venue name → likely slug (matches venues-db.json id format)
const toVenueSlug = (name: string) =>
  name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// ── Genre → gradient palette ─────────────────────────────────────────────────
const genrePalette = (style: string | null) => {
  const s = (style ?? "").toLowerCase();
  if (s.includes("techno") || s.includes("industrial"))
    return { a: "#C0392B", b: "#7a0000", c: "#E8500A20" };
  if (s.includes("house") && !s.includes("afro"))
    return { a: "#E8500A", b: "#C0392B", c: "#D4832A20" };
  if (s.includes("afro") || s.includes("amapiano"))
    return { a: "#D4832A", b: "#E8500A", c: "#D4832A20" };
  if (s.includes("hip") || s.includes("rap"))
    return { a: "#9B4BA8", b: "#6d28d9", c: "#9B4BA820" };
  if (s.includes("r&b") || s.includes("soul"))
    return { a: "#C0392B", b: "#D4AA6A", c: "#C0392B20" };
  if (s.includes("reggaeton") || s.includes("latin"))
    return { a: "#22d3ee", b: "#E8500A", c: "#22d3ee15" };
  if (s.includes("jazz") || s.includes("blues"))
    return { a: "#10b981", b: "#059669", c: "#10b98115" };
  if (s.includes("edm") || s.includes("electro"))
    return { a: "#3b82f6", b: "#8b5cf6", c: "#3b82f620" };
  return { a: "#E8500A", b: "#C0392B", c: "#E8500A20" };
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [e, setE] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Swipe-up detection
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (ev: React.TouchEvent) => { touchStartY.current = ev.touches[0].clientY; };
  const onTouchEnd = (ev: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - ev.changedTouches[0].clientY;
    if (delta > 60) setSheetOpen(true);
    if (delta < -60) setSheetOpen(false);
    touchStartY.current = null;
  };

  useEffect(() => {
    if (!id) return;
    supabase.from("events").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      const ev = data as EventRow | null;
      setE(ev);
      setLoading(false);
      if (ev?.main_style) trackView(ev.main_style);
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("saved_events").select("id").eq("user_id", user.id).eq("event_id", id).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, id]);

  const toggleSave = async () => {
    if (!user) { toast.error("Connectez-vous pour sauvegarder"); return; }
    if (!id) return;
    if (saved) {
      await supabase.from("saved_events").delete().eq("user_id", user.id).eq("event_id", id);
      setSaved(false); toast.success("Retiré des favoris");
    } else {
      await supabase.from("saved_events").insert({ user_id: user.id, event_id: id });
      setSaved(true); toast.success("Sauvegardé ❤️");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: e?.event_name ?? "Événement", url }); } catch { /* */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
        Chargement…
      </span>
    </div>
  );

  if (!e) return (
    <Layout>
      <div style={{ padding: "48px 20px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
        Événement introuvable.
      </div>
    </Layout>
  );

  const pal = genrePalette(e.main_style);
  const artists = (e.artists ?? []).filter(Boolean);

  return (
    <div
      style={{ minHeight: "100dvh", background: "#080808", position: "relative", overflow: "hidden" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── POSTER BACKGROUND ─────────────────────────────────────────────── */}
      {/* Main sweep — Pinterest style */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at -5% 55%, ${pal.a}55 0%, transparent 52%),
          radial-gradient(ellipse at 105% 35%, ${pal.b}35 0%, transparent 48%),
          radial-gradient(ellipse at 50% 90%, ${pal.a}25 0%, transparent 55%)
        `,
      }} />
      {/* Grain texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px", opacity: 0.5,
      }} />

      {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 24px 0" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Retour</span>
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleShare} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <Share2 style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={toggleSave} style={{ background: saved ? `${pal.a}25` : "rgba(255,255,255,0.06)", border: `1px solid ${saved ? pal.a + "60" : "rgba(255,255,255,0.1)"}`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: saved ? pal.a : "rgba(255,255,255,0.5)" }}>
            <Heart style={{ width: 14, height: 14 }} fill={saved ? pal.a : "none"} />
          </button>
        </div>
      </div>

      {/* ── POSTER CONTENT ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "75dvh", padding: "40px 32px 120px", textAlign: "center" }}>

        {/* Genre label */}
        {e.main_style && (
          <div style={{ marginBottom: 20 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: 9,
              color: pal.a, textTransform: "uppercase", letterSpacing: "0.28em",
              display: "inline-block",
              borderBottom: `1px solid ${pal.a}50`, paddingBottom: 4,
            }}>
              {e.main_style}
            </span>
          </div>
        )}

        {/* Event name — huge, Playfair */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2rem, 9vw, 4rem)",
          fontWeight: 400,
          color: "#ffffff",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          maxWidth: 340,
          marginBottom: 28,
          textShadow: `0 0 120px ${pal.a}50`,
        }}>
          {e.event_name}
        </h1>

        {/* Date + venue — Space Mono, block centered */}
        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em" }}>
            {formatDate(e.event_date)}
            {e.start_time && ` — ${e.start_time.slice(0, 5)}`}
          </span>
          {e.venue_name ? (
            <Link to={`/venue/${toVenueSlug(e.venue_name)}`} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 1 }}>
              {e.venue_name}{e.neighborhood && ` · ${e.neighborhood}`}
            </Link>
          ) : (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>
              {N_I}
            </span>
          )}
        </div>

        {/* Artists */}
        {artists.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 300, marginBottom: 28 }}>
            {artists.map((a, i) => (
              <span key={a} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: i === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                letterSpacing: "0.06em",
              }}>
                {a}{i < artists.length - 1 && <span style={{ color: `${pal.a}60`, marginLeft: 6 }}>·</span>}
              </span>
            ))}
          </div>
        )}

        {/* Price badge */}
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
          color: e.is_free ? "#10b981" : "rgba(255,255,255,0.7)",
          background: e.is_free ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${e.is_free ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 20, padding: "6px 16px",
        }}>
          {formatPrice(e)}
        </div>
      </div>

      {/* ── SWIPE UP INDICATOR ───────────────────────────────────────────── */}
      {!sheetOpen && (
        <div
          style={{ position: "fixed", bottom: 90, left: 0, right: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", opacity: 0.7 }}
          onClick={() => setSheetOpen(true)}
        >
          <div style={{ animation: "pulse-arrow 1.8s ease-in-out infinite" }}>
            <ChevronUp style={{ width: 18, height: 18, color: "rgba(255,255,255,0.5)" }} />
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Plus d'infos
          </span>
        </div>
      )}

      {/* ── BOTTOM SHEET ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
          background: "linear-gradient(to bottom, rgba(10,10,10,0.98) 0%, #080808 100%)",
          backdropFilter: "blur(24px)",
          borderTop: `1px solid ${pal.a}30`,
          borderRadius: "24px 24px 0 0",
          padding: "0 0 100px",
          transform: sheetOpen ? "translateY(0)" : "translateY(calc(100% - 72px))",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: "85dvh",
          overflowY: sheetOpen ? "auto" : "hidden",
        }}
      >
        {/* Drag handle */}
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 20px", cursor: "pointer" }}
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", marginBottom: 0 }} />
          {!sheetOpen && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: `${pal.a}90`, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 10 }}>
              Billets & infos
            </span>
          )}
        </div>

        <div style={{ padding: "0 24px" }}>

          {/* Ticket CTA */}
          {e.ticket_url ? (
            <a href={e.ticket_url} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "18px 24px",
              background: `linear-gradient(135deg, ${pal.b} 0%, ${pal.a} 100%)`,
              borderRadius: 14, textDecoration: "none", color: "#fff",
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 500,
              boxShadow: `0 8px 32px ${pal.a}40`,
              marginBottom: 20,
            }}>
              Obtenir des billets <ExternalLink style={{ width: 16, height: 16 }} />
            </a>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "18px 24px", borderRadius: 14, marginBottom: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.25)",
            }}>
              Billetterie non disponible
            </div>
          )}

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              ["DATE", formatDate(e.event_date)],
              ["LIEU", e.venue_name ?? N_I],
              ["HEURE", e.start_time ? `${e.start_time.slice(0,5)}${e.end_time ? ` → ${e.end_time.slice(0,5)}` : ""}` : N_I],
              ["PRIX", formatPrice(e)],
              e.min_age ? ["ÂGE MIN.", `${e.min_age}+`] : null,
              e.dress_code ? ["DRESS CODE", e.dress_code] : null,
            ].filter(Boolean).map(([label, value]) => (
              <div key={label as string} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {e.description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 10, textTransform: "uppercase" }}>À propos</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{e.description}</p>
            </div>
          )}

          {/* Full lineup */}
          {artists.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 10, textTransform: "uppercase" }}>Line-up</div>
              {artists.map((a, i) => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: `${pal.a}80`, width: 16 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 400, color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)" }}>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Entry info */}
          {e.entry_difficulty_reason && (
            <div style={{ background: "rgba(212,131,42,0.07)", border: "1px solid rgba(212,131,42,0.18)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: "#D4832A" }}>⚠️ </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{e.entry_difficulty_reason}</span>
            </div>
          )}

          {/* Map link */}
          <Link to="/map" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "rgba(255,255,255,0.25)", textDecoration: "none", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.06em" }}>
            <MapPin style={{ width: 12, height: 12 }} /> Voir sur la carte
          </Link>

        </div>
      </div>
    </div>
  );
};

export default EventDetail;
