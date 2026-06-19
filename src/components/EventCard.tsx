import { EventRow, formatDate, formatPrice, display, N_I, styleColor } from "@/lib/events";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

// ── Photo de fallback par venue ──────────────────────────────────────────────
const VENUE_PHOTOS: Record<string, string> = {
  "Le Mal Nécessaire":            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "Le Red Room":                  "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  "La Porte":                     "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "New City Gas":                 "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "Núcleo (Maybe Montreal)":      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "Tiradito Lounge":              "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "MTELUS":                       "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "Newspeak":                     "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  "Le Studio TD":                 "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "Le Balcon X Terrasse":         "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Le Balcon":                    "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Foufounes Electriques":        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "Bar le Ritz PDB":              "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "La Sala Rossa":                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  "CABARET DU CASINO DE MONTREAL":"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  // Nouveaux venues
  "Soubois":                       "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "MAYBE":                         "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Flyjin":                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "Muzique":                       "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "Café Campus":                   "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80",
  // Festivals
  "Parc Jean-Drapeau (Osheaga)":   "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  "Parc Jean-Drapeau":             "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  "Festival International de Jazz de Montréal": "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
  "SAT / Quartier des Spectacles (MUTEK)":      "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "Quartier des Spectacles":       "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  "BEACHCLUB":                     "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800&q=80",
};

const venuePhoto = (e: EventRow): string | null =>
  e.image_url || VENUE_PHOTOS[e.venue_name ?? ""] || null;

/* ── Carte horizontale scroll (Search / generic use) ── */
export const EventCardScroll = ({ e }: { e: EventRow }) => {
  const color = styleColor(e.main_style);
  const price = e.is_free ? "Gratuit" : formatPrice(e);
  const dayLabel = e.event_date
    ? new Date(e.event_date + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "short" })
    : "";

  return (
    <Link
      to={`/event/${e.id}`}
      className="group flex-shrink-0 w-[120px] rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#0f0f0f" }}
    >
      {/* Image */}
      <div className="relative h-[58px] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}40, #0f0f0f)` }}>
        {venuePhoto(e) && (
          <img src={venuePhoto(e)!} alt={e.event_name} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />
      </div>

      {/* Info */}
      <div style={{ padding: "8px 10px" }}>
        <h3 className="text-white leading-tight line-clamp-2 group-hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 11, fontWeight: 500 }}>
          {e.event_name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.32)" }}>
            {dayLabel}{e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ""}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: e.is_free ? "#34d399" : "#E8500A" }}>
            {price}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ── Ligne liste (Search / Saved / Related) ── */
export const EventCardRow = ({ e }: { e: EventRow }) => {
  const color = styleColor(e.main_style);
  return (
    <Link
      to={`/event/${e.id}`}
      className="group relative flex items-center gap-4 px-4 py-3.5 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5"
      style={{ border: "1px solid rgba(255,255,255,0.06)", minHeight: 68, background: "#0f0f0f" }}
    >
      {/* Background image */}
      {venuePhoto(e) && (
        <img
          src={venuePhoto(e)!} alt="" aria-hidden loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{
        background: venuePhoto(e)
          ? "linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.8) 55%, rgba(8,8,8,0.55) 100%)"
          : "#0f0f0f"
      }} />

      {/* Genre badge */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase"
        style={{ background: `${color}18`, color, border: `1px solid ${color}35`, fontFamily: "'Space Mono', monospace" }}>
        {(e.main_style ?? "?").slice(0, 2).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="relative flex-1 min-w-0">
        <div className="text-sm text-white leading-tight truncate group-hover:opacity-75 transition-opacity"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 500 }}>
          {e.event_name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
          <span className="truncate">{display(e.venue_name)}</span>
          {e.neighborhood && <><span>·</span><span className="truncate">{e.neighborhood}</span></>}
        </div>
      </div>

      {/* Date + price */}
      <div className="relative flex-shrink-0 text-right space-y-0.5">
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {formatDate(e.event_date)}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: e.is_free ? "#34d399" : "#E8500A" }}>
          {formatPrice(e)}
        </div>
      </div>
    </Link>
  );
};

/* ── Ancienne carte grille (garde pour Search/Saved) ── */
export const EventCard = ({ e, variant = "default" }: { e: EventRow; variant?: "default" | "compact" }) => {
  if (variant === "compact") return <EventCardRow e={e} />;

  const color = styleColor(e.main_style);

  return (
    <Link
      to={`/event/${e.id}`}
      className="group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "#13131f", border: "1px solid #1e1e2e" }}
    >
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {venuePhoto(e) ? (
          <img src={venuePhoto(e)!} alt={e.event_name} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full flex items-center justify-center"
            style={{ background: `${color}15` }}>
            <span className="font-display font-black text-4xl opacity-20" style={{ color }}>
              {(e.main_style ?? "?").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13131f] via-[#13131f]/20 to-transparent" />
        <div className="absolute top-3 right-3">
          <div className="text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm text-white/80"
            style={{ background: "rgba(0,0,0,0.5)" }}>
            {formatDate(e.event_date)}
          </div>
        </div>
        {e.is_free && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-emerald-400"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
              Gratuit
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color }}>
          {e.main_style ?? N_I}
          {e.event_type && <span className="text-white/30 ml-2">· {e.event_type}</span>}
        </div>
        <h3 className="font-display font-bold text-base leading-tight line-clamp-2 text-white group-hover:opacity-75 transition-opacity">
          {e.event_name}
        </h3>
        {(e.artists ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(e.artists ?? []).slice(0, 3).map(a => (
              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full text-white/50"
                style={{ background: "#1e1e2e" }}>{a}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-1.5" style={{ borderTop: "1px solid #1e1e2e" }}>
          <div className="text-[11px] text-white/40 flex items-center gap-1">
            <MapPin className="h-3 w-3" />{display(e.venue_name)}
          </div>
          <span className={`text-sm font-bold ${e.is_free ? "text-emerald-400" : "text-white"}`}>
            {formatPrice(e)}
          </span>
        </div>
      </div>
    </Link>
  );
};
