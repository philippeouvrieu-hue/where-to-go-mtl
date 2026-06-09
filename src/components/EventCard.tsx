import { EventRow, formatDate, formatPrice, display, N_I, styleColor } from "@/lib/events";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

/* ── Carte horizontale scroll style B (Ce soir) ── */
export const EventCardScroll = ({ e }: { e: EventRow }) => {
  const color = styleColor(e.main_style);
  const initials = (e.main_style ?? "?").slice(0, 2).toUpperCase();
  const price = e.is_free ? "Gratuit" : formatPrice(e);
  const dayLabel = e.event_date
    ? new Date(e.event_date + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "short" })
    : "";

  return (
    <Link
      to={`/event/${e.id}`}
      className="group flex-shrink-0 w-[115px] rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ border: "1px solid #1e1e2e", background: "#13131f" }}
    >
      {/* Bloc couleur / image */}
      <div className="relative h-[55px] overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)` }}>
        {e.image_url ? (
          <img src={e.image_url} alt={e.event_name} loading="lazy"
            className="h-full w-full object-cover" />
        ) : (
          <span className="font-display font-black text-lg opacity-40" style={{ color }}>
            {initials}
          </span>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}33, transparent)` }} />
      </div>

      {/* Info */}
      <div style={{ padding: "7px 8px" }}>
        <h3 className="font-display font-bold text-white leading-tight line-clamp-2 group-hover:opacity-80 transition-opacity"
          style={{ fontSize: 11 }}>
          {e.event_name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {dayLabel}{e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ""}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: e.is_free ? "#34d399" : "rgba(255,255,255,0.7)" }}>
            {price}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ── Ligne liste (Cette semaine / sections) ── */
export const EventCardRow = ({ e }: { e: EventRow }) => {
  const color = styleColor(e.main_style);
  return (
    <Link
      to={`/event/${e.id}`}
      className="group relative flex items-center gap-4 px-4 py-3.5 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5"
      style={{ border: "1px solid #1e1e2e", minHeight: 68 }}
    >
      {/* Background image */}
      {e.image_url && (
        <img
          src={e.image_url} alt="" aria-hidden loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{
        background: e.image_url
          ? "linear-gradient(90deg, rgba(10,6,24,0.92) 0%, rgba(10,6,24,0.75) 60%, rgba(10,6,24,0.5) 100%)"
          : "#13131f"
      }} />

      {/* Color dot / genre indicator */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase"
        style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
        {(e.main_style ?? "?").slice(0, 2).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="relative flex-1 min-w-0">
        <div className="font-display font-semibold text-sm text-white leading-tight truncate group-hover:opacity-75 transition-opacity">
          {e.event_name}
        </div>
        <div className="text-[11px] text-white/55 mt-0.5 flex items-center gap-1.5">
          <span className="truncate">{display(e.venue_name)}</span>
          {e.neighborhood && <><span>·</span><span className="truncate">{e.neighborhood}</span></>}
        </div>
      </div>

      {/* Date + price */}
      <div className="relative flex-shrink-0 text-right space-y-0.5">
        <div className="text-[11px] text-white/60">{formatDate(e.event_date)}</div>
        <div className={`text-xs font-bold ${e.is_free ? "text-emerald-400" : "text-white"}`}>
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
        {e.image_url ? (
          <img src={e.image_url} alt={e.event_name} loading="lazy"
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
