import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, formatDate, formatPrice } from "@/lib/events";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Instagram, Globe, MapPin, Clock, Users, Star, ChevronUp, ExternalLink } from "lucide-react";

// ── Music genre → palette ────────────────────────────────────────────────────
const stylePalette = (styles: string[]) => {
  const s = (styles ?? []).join(" ").toLowerCase();
  if (s.includes("techno"))  return { a: "#C0392B", b: "#7a0000" };
  if (s.includes("house"))   return { a: "#E8500A", b: "#C0392B" };
  if (s.includes("afro"))    return { a: "#D4832A", b: "#E8500A" };
  if (s.includes("hip"))     return { a: "#9B4BA8", b: "#6d28d9" };
  if (s.includes("jazz"))    return { a: "#10b981", b: "#059669" };
  if (s.includes("latin"))   return { a: "#22d3ee", b: "#E8500A" };
  return { a: "#E8500A", b: "#C0392B" };
};

interface VenueRow {
  id: string;
  name: string;
  type?: string;
  address?: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
  website?: string;
  instagram?: string;
  hours?: string;
  capacity?: number;
  vibe?: string;
  music_styles?: string[];
  crowd_type?: string;
  cover_typical?: string;
  cover_notes?: string;
  drink_price_beer?: string;
  drink_price_cocktail?: string;
  entry_difficulty?: string;
  dress_code?: string;
  guestlist_recommended?: boolean;
  face_control?: boolean;
  wait_time_typical?: string;
  notes?: string;
  photo_main?: string;
  photos?: string[];
  tags?: string[];
  rating?: number;
}

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  // Swipe detection
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
    Promise.all([
      supabase.from("venues").select("*").eq("id", id).maybeSingle(),
      supabase.from("events")
        .select("*")
        .ilike("venue_name", `%${id.replace(/-/g, " ")}%`)
        .neq("status", "terminé")
        .order("event_date")
        .limit(8),
    ]).then(([{ data: v }, { data: ev }]) => {
      setVenue(v as VenueRow | null);
      setEvents((ev as EventRow[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
        Chargement…
      </span>
    </div>
  );

  if (!venue) return (
    <Layout>
      <div style={{ padding: "48px 20px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
        Venue introuvable.
      </div>
    </Layout>
  );

  const pal = stylePalette(venue.music_styles ?? []);
  const photos = [venue.photo_main, ...(venue.photos ?? [])].filter(Boolean) as string[];
  const mapsUrl = venue.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
    : null;

  return (
    <div
      style={{ minHeight: "100dvh", background: "#080808", position: "relative" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── HERO PHOTO / GRADIENT ─────────────────────────────────────────── */}
      <div style={{ position: "relative", height: "65dvh", overflow: "hidden" }}>
        {/* Gradient background (always visible, behind photo) */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse at -10% 50%, ${pal.a}60 0%, transparent 55%),
            radial-gradient(ellipse at 110% 30%, ${pal.b}40 0%, transparent 50%),
            #080808
          `,
        }} />

        {/* Photo */}
        {photos.length > 0 && (
          <img
            key={photos[activePhoto]}
            src={photos[activePhoto]}
            alt={venue.name}
            onLoad={() => setPhotoLoaded(true)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: photoLoaded ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />
        )}

        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.25) 0%, rgba(8,8,8,0.1) 40%, rgba(8,8,8,0.85) 85%, #080808 100%)" }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 52, left: 20, zIndex: 10, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.8)" }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.08em" }}>Retour</span>
        </button>

        {/* Photo counter dots */}
        {photos.length > 1 && (
          <div style={{ position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
            {photos.map((_, i) => (
              <button key={i} onClick={() => setActivePhoto(i)} style={{ width: i === activePhoto ? 20 : 6, height: 6, borderRadius: 3, background: i === activePhoto ? pal.a : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
            ))}
          </div>
        )}

        {/* Venue name — bottom of hero */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px", zIndex: 5 }}>
          {venue.type && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: pal.a, textTransform: "uppercase", letterSpacing: "0.22em", display: "block", marginBottom: 8 }}>
              {venue.type}
            </span>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.8rem, 8vw, 3rem)", fontWeight: 400, color: "#fff", lineHeight: 1.05, marginBottom: 8, textShadow: `0 2px 40px ${pal.a}40` }}>
            {venue.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {venue.neighborhood && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin style={{ width: 10, height: 10 }} /> {venue.neighborhood}
              </span>
            )}
            {venue.rating && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#D4832A", display: "flex", alignItems: "center", gap: 3 }}>
                <Star style={{ width: 10, height: 10, fill: "#D4832A" }} /> {venue.rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ padding: "0 20px", paddingBottom: 120 }}>

        {/* Music styles */}
        {(venue.music_styles ?? []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {venue.music_styles!.map(s => (
              <span key={s} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: pal.a, background: `${pal.a}18`, border: `1px solid ${pal.a}35`, borderRadius: 20, padding: "5px 12px" }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Vibe description */}
        {venue.vibe && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 28 }}>
            {venue.vibe}
          </p>
        )}

        {/* Quick info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            venue.hours     ? ["HORAIRES", venue.hours, <Clock style={{width:12,height:12}}/>]    : null,
            venue.capacity  ? ["CAPACITÉ", `~${venue.capacity} pers.`, <Users style={{width:12,height:12}}/>] : null,
            venue.cover_typical ? ["ENTRÉE", venue.cover_typical, null] : null,
            venue.dress_code    ? ["DRESS CODE", venue.dress_code, null]  : null,
            venue.entry_difficulty ? ["SÉLECTION", venue.entry_difficulty, null] : null,
            venue.wait_time_typical ? ["ATTENTE", venue.wait_time_typical, null] : null,
          ].filter(Boolean).map(([label, value, icon]) => (
            <div key={label as string} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                {icon as React.ReactNode} {label as string}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{value as string}</div>
            </div>
          ))}
        </div>

        {/* Drinks pricing */}
        {(venue.drink_price_beer || venue.drink_price_cocktail) && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {venue.drink_price_beer && (
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 5 }}>🍺 BIÈRE</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{venue.drink_price_beer}</div>
              </div>
            )}
            {venue.drink_price_cocktail && (
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", marginBottom: 5 }}>🍸 COCKTAIL</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{venue.drink_price_cocktail}</div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {venue.notes && (
          <div style={{ background: `${pal.a}08`, border: `1px solid ${pal.a}20`, borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: pal.a, letterSpacing: "0.16em", marginBottom: 6 }}>💡 TIPS</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{venue.notes}</p>
          </div>
        )}

        {/* Tags */}
        {(venue.tags ?? []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {venue.tags!.map(t => (
              <span key={t} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 10px" }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Upcoming events */}
        {events.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: pal.a, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>
              Prochains événements
            </div>
            {events.map(ev => (
              <Link key={ev.id} to={`/event/${ev.id}`} style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#fff", marginBottom: 4 }}>{ev.event_name}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{formatDate(ev.event_date)}</div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: ev.is_free ? "#10b981" : pal.a }}>
                    {formatPrice(ev)}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>

      {/* ── SWIPE UP INDICATOR ───────────────────────────────────────────── */}
      {!sheetOpen && (
        <div
          style={{ position: "fixed", bottom: 90, left: 0, right: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
          onClick={() => setSheetOpen(true)}
        >
          <div style={{ animation: "pulse-arrow 1.8s ease-in-out infinite" }}>
            <ChevronUp style={{ width: 18, height: 18, color: "rgba(255,255,255,0.4)" }} />
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Contact & itinéraire
          </span>
        </div>
      )}

      {/* ── BOTTOM SHEET ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
          background: "rgba(8,8,8,0.98)",
          backdropFilter: "blur(24px)",
          borderTop: `1px solid ${pal.a}30`,
          borderRadius: "24px 24px 0 0",
          padding: "0 24px 100px",
          transform: sheetOpen ? "translateY(0)" : "translateY(calc(100% - 72px))",
          transition: "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: "60dvh",
          overflowY: sheetOpen ? "auto" : "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 22px", cursor: "pointer" }} onClick={() => setSheetOpen(!sheetOpen)}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          {!sheetOpen && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: `${pal.a}90`, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 10 }}>
              Contact & itinéraire
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Website */}
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", textDecoration: "none", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Globe style={{ width: 18, height: 18, color: pal.a }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 3 }}>SITE WEB</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Ouvrir le site</div>
                </div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
            </a>
          )}

          {/* Instagram */}
          {venue.instagram && (
            <a href={`https://instagram.com/${venue.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", textDecoration: "none", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Instagram style={{ width: 18, height: 18, color: "#E8500A" }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 3 }}>INSTAGRAM</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>{venue.instagram}</div>
                </div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
            </a>
          )}

          {/* Maps */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${pal.b} 0%, ${pal.a} 100%)`, borderRadius: 14, padding: "16px 20px", textDecoration: "none", color: "#fff", boxShadow: `0 8px 24px ${pal.a}35` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MapPin style={{ width: 18, height: 18 }} />
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.65)", letterSpacing: "0.14em", marginBottom: 3 }}>ADRESSE</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15 }}>Ouvrir dans Maps</div>
                </div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, opacity: 0.7 }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
