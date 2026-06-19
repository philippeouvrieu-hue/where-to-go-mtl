import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { EventRow, display, formatPrice, formatDate, N_I } from "@/lib/events";
import { trackView } from "@/lib/history";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ExternalLink, MapPin, Clock, Calendar, Users, ShieldCheck, ArrowLeft, Share2, Navigation } from "lucide-react";
import { toast } from "sonner";

// ── Genre → orb colors ──────────────────────────────────────────────────────
const genreOrb = (style: string | null): [string, string, string] => {
  const s = (style ?? "").toLowerCase();
  if (s.includes("techno") || s.includes("industrial"))  return ["#C0392B", "#E8500A", "#3a0800"];
  if (s.includes("house"))                               return ["#E8500A", "#D4832A", "#2a1000"];
  if (s.includes("afro") || s.includes("amapiano"))      return ["#D4832A", "#E8500A", "#2a1200"];
  if (s.includes("jazz") || s.includes("blues"))         return ["#10b981", "#059669", "#001a0e"];
  if (s.includes("rap") || s.includes("hip"))            return ["#9B4BA8", "#7c3aed", "#1a0a22"];
  if (s.includes("r&b") || s.includes("soul"))           return ["#D4AA6A", "#C0392B", "#1a1000"];
  if (s.includes("after"))                               return ["#8b5cf6", "#C0392B", "#0d0018"];
  if (s.includes("reggaeton") || s.includes("latino"))   return ["#22d3ee", "#E8500A", "#001a1e"];
  return ["#E8500A", "#C0392B", "#1a0800"];
};

// ── Info pod ────────────────────────────────────────────────────────────────
const InfoPod = ({ emoji, label, value }: { emoji: string; label: string; value: React.ReactNode }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "14px 16px",
    backdropFilter: "blur(12px)",
  }}>
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
      {emoji} {label}
    </div>
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "#fff" }}>
      {value}
    </div>
  </div>
);

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [e, setE] = useState<EventRow | null>(null);
  const [related, setRelated] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("events").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      const ev = data as EventRow | null;
      setE(ev);
      setLoading(false);
      // Track la consultation pour l'algo de recommandation (style uniquement)
      if (ev?.main_style) trackView(ev.main_style);
      if (ev?.main_style) {
        supabase.from("events")
          .select("*")
          .eq("main_style", ev.main_style)
          .neq("id", ev.id)
          .neq("status", "terminé")
          .order("event_date")
          .limit(3)
          .then(({ data: rel }) => setRelated((rel as EventRow[]) ?? []));
      }
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("saved_events").select("id").eq("user_id", user.id).eq("event_id", id).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, id]);

  const toggleSave = async () => {
    if (!user) { toast.error("Connectez-vous pour sauvegarder"); return; }
    if (!id) return;
    if (saved) {
      await supabase.from("saved_events").delete().eq("user_id", user.id).eq("event_id", id);
      setSaved(false); toast.success("Retiré des favoris");
    } else {
      await supabase.from("saved_events").insert({ user_id: user.id, event_id: id });
      setSaved(true); toast.success("Ajouté aux favoris ❤️");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = e?.event_name ?? "Événement";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  if (loading) return <Layout><div className="container py-12" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Chargement…</div></Layout>;
  if (!e) return <Layout><div className="container py-12" style={{ color: "rgba(255,255,255,0.4)" }}>Événement introuvable.</div></Layout>;

  const [orbColor1, orbColor2, orbDark] = genreOrb(e.main_style);
  const sources = Array.isArray(e.sources) ? e.sources : [];
  const artists = (e.artists ?? []).filter(Boolean);

  return (
    <Layout>
      {/* ── Orb hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: "70vh", background: "#080808" }}>
        {/* Orb */}
        <div style={{
          position: "absolute",
          bottom: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 40%, ${orbColor1} 0%, ${orbColor2} 40%, ${orbDark} 72%, transparent 100%)`,
          filter: "blur(72px)",
          opacity: 0.85,
          animation: "orb-breathe 4s ease-in-out infinite",
        }} />
        {/* Overlay for readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.15) 40%, rgba(8,8,8,0.7) 80%, rgba(8,8,8,1) 100%)" }} />

        {/* Back button */}
        <div className="relative z-10 px-5 pt-6">
          <Link to="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Retour
          </Link>
        </div>

        {/* Center: genre + artist name */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8" style={{ paddingTop: "10vh", paddingBottom: "8vh" }}>
          {e.main_style && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: orbColor1, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16, display: "block", opacity: 0.9 }}>
              {e.main_style}
            </span>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.8rem, 7vw, 3.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.1, textShadow: `0 0 80px ${orbColor1}60`, maxWidth: 560 }}>
            {e.event_name}
          </h1>
          {artists.length > 0 && (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 14, letterSpacing: "0.06em" }}>
              {artists.slice(0, 3).join(" · ")}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-8 flex-wrap justify-center">
            <button
              onClick={toggleSave}
              className="flex items-center gap-2 transition-all"
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                background: saved ? "rgba(232,80,10,0.2)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${saved ? "rgba(232,80,10,0.5)" : "rgba(255,255,255,0.12)"}`,
                color: saved ? "#E8500A" : "rgba(255,255,255,0.6)",
                borderRadius: 24, padding: "10px 18px",
                backdropFilter: "blur(12px)",
              }}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              {saved ? "Sauvegardé" : "Sauvegarder"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 transition-all"
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
                borderRadius: 24, padding: "10px 18px",
                backdropFilter: "blur(12px)",
              }}
            >
              <Share2 className="h-4 w-4" /> Partager
            </button>
          </div>
        </div>
      </div>

      {/* ── Info pods ────────────────────────────────────────────────────── */}
      <div className="px-5 -mt-6 relative z-10 pb-10" style={{ background: "#080808" }}>
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoPod emoji="📅" label="Date" value={formatDate(e.event_date)} />
          <InfoPod emoji="📍" label="Lieu" value={display(e.venue_name)} />
          <InfoPod emoji="🕐" label="Horaire" value={
            e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? ` → ${e.end_time.slice(0, 5)}` : ""}` : N_I
          } />
          <InfoPod emoji="💰" label="Prix" value={
            <span style={{ color: e.is_free ? "#34d399" : "#E8500A" }}>{formatPrice(e)}</span>
          } />
          {e.dress_code && <InfoPod emoji="👔" label="Dress code" value={e.dress_code} />}
          {e.entry_difficulty && <InfoPod emoji="🚪" label="Entrée" value={e.entry_difficulty} />}
          {e.min_age && <InfoPod emoji="🔞" label="Âge min." value={e.min_age} />}
          {e.neighborhood && <InfoPod emoji="📌" label="Quartier" value={e.neighborhood} />}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {e.main_style && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: orbColor1, background: `${orbColor1}18`, border: `1px solid ${orbColor1}40`, borderRadius: 20, padding: "4px 12px", textTransform: "uppercase" }}>
              {e.main_style}
            </span>
          )}
          {(e.secondary_styles ?? []).map(s => (
            <span key={s} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 12px" }}>
              {s}
            </span>
          ))}
          {e.status === "sold out" && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: "#C0392B", background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 20, padding: "4px 12px" }}>
              SOLD OUT
            </span>
          )}
        </div>

        {/* CTA */}
        {e.ticket_url ? (
          <a
            href={e.ticket_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full transition-opacity hover:opacity-90"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16,
              fontWeight: 500,
              color: "#fff",
              background: "linear-gradient(90deg, #C0392B 0%, #E8500A 60%, #D4832A 100%)",
              borderRadius: 14,
              padding: "16px 24px",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(232,80,10,0.35)",
            }}
          >
            Obtenir des billets <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <div className="flex items-center justify-center w-full"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 24px" }}>
            Billetterie {N_I}
          </div>
        )}

        {/* Navigate to map */}
        <Link to="/map" className="flex items-center justify-center gap-2 mt-3 transition-opacity hover:opacity-70"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          <Navigation className="h-3.5 w-3.5" /> Voir sur la carte
        </Link>

        {/* Divider */}
        <div className="my-8" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

        {/* Description */}
        {e.description && (
          <section className="mb-8">
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#fff", marginBottom: 12 }}>
              Description
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              {e.description}
            </p>
          </section>
        )}

        {/* Line-up */}
        {artists.length > 0 && (
          <section className="mb-8">
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#fff", marginBottom: 12 }}>
              Line-up
            </h2>
            <div className="flex flex-wrap gap-2">
              {artists.map(a => (
                <span key={a} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px" }}>
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Entry info */}
        {e.entry_difficulty_reason && (
          <div className="mb-8 p-4 rounded-xl" style={{ background: "rgba(212,131,42,0.08)", border: "1px solid rgba(212,131,42,0.2)" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "#D4832A" }}>⚠️ À savoir : </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{e.entry_difficulty_reason}</span>
          </div>
        )}

        {/* Popularity bars */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              📊 Popularité
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${e.popularity_score ?? 0}%`, background: "linear-gradient(90deg, #C0392B, #E8500A)", borderRadius: 2 }} />
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "#E8500A", marginTop: 8 }}>{e.popularity_score ?? "—"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              ✅ Fiabilité
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${e.info_reliability_score ?? 0}%`, background: "#10b981", borderRadius: 2 }} />
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "#10b981", marginTop: 8 }}>{e.info_reliability_score ?? "—"}</div>
          </div>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mb-8">
            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              Sources
            </h2>
            <div className="space-y-2">
              {sources.map((s: any, i: number) => (
                <div key={i}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#E8500A", textDecoration: "none" }}>
                      {s.name ?? s.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.name ?? "—"}</span>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
              Mis à jour : {new Date(e.last_updated).toLocaleString("fr-CA")}
            </p>
          </section>
        )}

        {/* Related events */}
        {related.length > 0 && (
          <section>
            <div className="mb-5" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
              À proximité ce soir
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#fff", marginBottom: 16 }}>
              Même style · {e.main_style}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {related.slice(0, 3).map(r => <EventCard key={r.id} e={r} variant="compact" />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default EventDetail;
