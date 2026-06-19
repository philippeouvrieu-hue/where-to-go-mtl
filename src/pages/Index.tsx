import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, formatDate, formatPrice, styleColor } from "@/lib/events";
import { Layout } from "@/components/Layout";
import { SplashScreen } from "@/components/SplashScreen";

// ── Venue photo fallback ──────────────────────────────────────────────────────
const VENUE_PHOTOS: Record<string, string> = {
  "Le Mal Nécessaire":     "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "Le Red Room":           "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  "New City Gas":          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "Newspeak":              "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  "Soubois":               "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "MAYBE":                 "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Café Campus":           "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  "Foufounes Electriques": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "MTELUS":                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "BEACHCLUB":             "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800&q=80",
  "Flyjin":                "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "Muzique":               "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "La Sala Rossa":         "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "Bar le Ritz PDB":       "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "Parc Jean-Drapeau":     "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  "Festival International de Jazz de Montréal": "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
  "Quartier des Spectacles": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "Tiradito Lounge":       "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Le Balcon":             "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
};

const venuePhoto = (e: EventRow): string | null =>
  e.image_url || VENUE_PHOTOS[e.venue_name ?? ""] || null;

// ── Orb background ──────────────────────────────────────────────────────────
const OrbBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
    <div style={{
      position: "absolute", left: "15%", top: "18%",
      width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%)",
    }} />
    <div style={{
      position: "absolute", right: "-5%", top: "8%",
      width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(232,80,10,0.1) 0%, transparent 70%)",
    }} />
    <div style={{
      position: "absolute", left: "40%", bottom: "20%",
      width: 180, height: 180, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(212,131,42,0.08) 0%, transparent 70%)",
    }} />
  </div>
);

// ── Highlights du moment ─────────────────────────────────────────────────────
const HighlightCard = ({ e }: { e: EventRow }) => {
  const photo = venuePhoto(e);
  const color = styleColor(e.main_style);
  return (
    <Link
      to={`/event/${e.id}`}
      className="flex-shrink-0 relative overflow-hidden rounded-2xl group"
      style={{ width: 160, height: 210 }}
    >
      {photo ? (
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}40, #080808)` }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.55) 55%, rgba(8,8,8,0.1) 100%)"
      }} />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>
          {e.main_style}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 500, color: "#fff", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {e.event_name}
        </h3>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 7 }}>
          {e.start_time ? e.start_time.slice(0, 5) : ""}
          {e.venue_name ? ` · ${e.venue_name}` : ""}
        </div>
      </div>
    </Link>
  );
};

const HighlightsSection = ({ events }: { events: EventRow[] }) => {
  if (events.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between px-5 mb-4">
        <div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
            ⚡ À la une
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#fff" }}>
            Highlights du moment
          </h2>
        </div>
      </div>
      <div className="pl-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {events.slice(0, 5).map(e => <HighlightCard key={e.id} e={e} />)}
        <div className="flex-shrink-0 w-4" />
      </div>
    </section>
  );
};

// ── Hero Carousel (Ce soir) ───────────────────────────────────────────────────
const HeroCarousel = ({ events }: { events: EventRow[] }) => {
  const [idx, setIdx] = useState(0);
  const total = Math.min(events.length, 8);

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5500);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;
  const e = events[idx];
  const photo = venuePhoto(e);
  const next = () => setIdx(i => (i + 1) % total);

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between px-5 mb-4">
        <div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
            CE SOIR
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#fff" }}>
            Sortir maintenant
          </h2>
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.28)" }}>
          — {idx + 1}/{total} —
        </span>
      </div>

      {/* Card */}
      <div className="px-5" onClick={next} style={{ cursor: "pointer" }}>
        <Link to={`/event/${e.id}`} onClick={ev => ev.preventDefault()}>
          <div className="relative overflow-hidden rounded-2xl" style={{ height: 250 }}>
            {photo ? (
              <img src={photo} alt={e.event_name} className="absolute inset-0 w-full h-full object-cover" style={{ transition: "opacity 0.4s ease" }} />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #3a0800, #C0392B 50%, #E8500A)" }} />
            )}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.45) 55%, rgba(8,8,8,0.08) 100%)"
            }} />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {e.main_style && (
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", background: "rgba(8,8,8,0.72)", border: "1px solid rgba(232,80,10,0.35)", borderRadius: 20, padding: "3px 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {e.main_style}
                </span>
              )}
              {e.is_free && (
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: "#34d399", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                  Gratuit
                </span>
              )}
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 500, color: "#fff", lineHeight: 1.1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {e.event_name}
              </h3>
              <div className="flex items-center gap-3 mt-3">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {e.start_time ? e.start_time.slice(0, 5) : ""}
                  {e.venue_name ? ` · ${e.venue_name}` : ""}
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "#E8500A" }}>
                  {formatPrice(e)}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Pagination bar */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {events.slice(0, total).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 5,
                height: 3,
                background: i === idx ? "#E8500A" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Genre rows (Spotify-style) ────────────────────────────────────────────────
const GENRE_COLORS: Record<string, string> = {
  house: "#E8500A",
  techno: "#C0392B",
  afrobeat: "#D4832A",
  afro: "#D4832A",
  amapiano: "#D4832A",
  rap: "#9B4BA8",
  "hip-hop": "#9B4BA8",
  "r&b": "#D4AA6A",
  jazz: "#10b981",
  electronic: "#E8500A",
  electro: "#E8500A",
  afterhours: "#8b5cf6",
  rock: "#ef4444",
  reggaeton: "#22d3ee",
};

const MAIN_GENRES = ["House", "Techno", "Afrobeat", "Rap", "R&B", "Jazz", "Electronic", "Afterhours", "Rock", "Reggaeton"];

const EventSquare = ({ e, color }: { e: EventRow; color: string }) => {
  const photo = venuePhoto(e);
  return (
    <Link
      to={`/event/${e.id}`}
      className="group relative overflow-hidden rounded-xl block"
      style={{ aspectRatio: "1/1" }}
    >
      {photo ? (
        <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0" style={{ background: `${color}20` }} />
      )}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.35) 60%, transparent 100%)"
      }} />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 11, fontWeight: 500, color: "#fff", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {e.event_name}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 4 }}>
          {e.start_time ? e.start_time.slice(0, 5) : "—"}
        </div>
      </div>
    </Link>
  );
};

const GenreRow = ({ genre, events }: { genre: string; events: EventRow[] }) => {
  const [page, setPage] = useState(0);
  const PER_PAGE = 3;
  const totalPages = Math.ceil(events.length / PER_PAGE);
  const visible = events.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const color = GENRE_COLORS[genre.toLowerCase()] ?? "#E8500A";

  return (
    <section className="mb-9">
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full" style={{ width: 3, height: 18, background: color }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {genre}
          </span>
        </div>
        {totalPages > 1 && (
          <button
            onClick={() => setPage(p => (p + 1) % totalPages)}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.32)", display: "flex", alignItems: "center", gap: 4 }}
          >
            {page + 1}/{totalPages} →
          </button>
        )}
      </div>
      <div className="px-5 grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {visible.map(e => <EventSquare key={e.id} e={e} color={color} />)}
        {visible.length < 3 && Array(3 - visible.length).fill(null).map((_, i) => (
          <div key={`ph-${i}`} />
        ))}
      </div>
    </section>
  );
};

const GenreSection = ({ events }: { events: EventRow[] }) => {
  const byGenre = MAIN_GENRES.map(genre => ({
    genre,
    events: events.filter(e => {
      const main = (e.main_style ?? "").toLowerCase();
      const secondary = (e.secondary_styles ?? []).map(s => s.toLowerCase());
      const g = genre.toLowerCase();
      return main.includes(g) || secondary.some(s => s.includes(g));
    }),
  })).filter(({ events }) => events.length >= 1);

  if (byGenre.length === 0) return null;

  return (
    <div>
      <div className="px-5 mb-7">
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
          🎵 Populaires
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#fff" }}>
          Par style musical
        </h2>
      </div>
      {byGenre.map(({ genre, events }) => (
        <GenreRow key={genre} genre={genre} events={events} />
      ))}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCards = () => (
  <div className="pl-5 flex gap-4 overflow-hidden">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex-shrink-0 rounded-2xl animate-pulse" style={{ width: 160, height: 210, background: "#111" }} />
    ))}
  </div>
);

const SkeletonHero = () => (
  <div className="px-5">
    <div className="rounded-2xl animate-pulse" style={{ height: 250, background: "#111" }} />
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Index = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).then(({ data }) => {
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const active = events.filter(e => e.status !== "terminé" && e.status !== "annulé");
  const tonight = active.filter(e => e.event_date === today);
  const popular = [...active].sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)).slice(0, 12);
  // Highlights = most popular tonight, or upcoming popular if no tonight events
  const highlights = tonight.length > 0 ? tonight.slice(0, 5) : popular.slice(0, 5);

  return (
    <>
      {showSplash && (
        <SplashScreen onDone={() => {
          sessionStorage.setItem("splashShown", "1");
          setShowSplash(false);
        }} />
      )}

      <Layout>
        <OrbBackground />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Top header */}
          <div className="px-5 pt-8 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#E8500A" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                Montréal
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.2rem, 9vw, 3.8rem)", fontWeight: 400, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.05 }}>
              What's the Move
            </h1>
            {!loading && (
              <div className="flex gap-2 mt-3">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.38)", background: "#111", border: "1px solid #1a1a1a", borderRadius: 20, padding: "4px 10px" }}>
                  {active.length} événements
                </span>
                {tonight.length > 0 && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: "#E8500A", background: "rgba(232,80,10,0.1)", border: "1px solid rgba(232,80,10,0.25)", borderRadius: 20, padding: "4px 10px" }}>
                    {tonight.length} ce soir
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Highlights du moment ── */}
          {loading ? (
            <div className="mb-10">
              <div className="px-5 mb-4">
                <div className="h-3 w-16 rounded animate-pulse mb-2" style={{ background: "#1a1a1a" }} />
                <div className="h-6 w-48 rounded animate-pulse" style={{ background: "#111" }} />
              </div>
              <SkeletonCards />
            </div>
          ) : (
            <HighlightsSection events={highlights} />
          )}

          {/* Divider */}
          <div className="px-5 mb-10"><div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} /></div>

          {/* ── Ce soir hero carousel ── */}
          {loading ? (
            <div className="mb-10">
              <div className="px-5 mb-4">
                <div className="h-3 w-16 rounded animate-pulse mb-2" style={{ background: "#1a1a1a" }} />
                <div className="h-6 w-40 rounded animate-pulse" style={{ background: "#111" }} />
              </div>
              <SkeletonHero />
            </div>
          ) : tonight.length > 0 ? (
            <HeroCarousel events={tonight} />
          ) : (
            <HeroCarousel events={popular.slice(0, 8)} />
          )}

          {/* Divider */}
          <div className="px-5 mb-10"><div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} /></div>

          {/* ── Par style musical ── */}
          {loading ? (
            <div className="px-5 mb-10">
              <div className="h-3 w-20 rounded animate-pulse mb-2" style={{ background: "#1a1a1a" }} />
              <div className="h-6 w-48 rounded animate-pulse mb-6" style={{ background: "#111" }} />
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="rounded-xl animate-pulse" style={{ aspectRatio: "1/1", background: "#111" }} />
                ))}
              </div>
            </div>
          ) : (
            <GenreSection events={active} />
          )}

          <div className="h-6" />
        </div>
      </Layout>
    </>
  );
};

export default Index;
