import { EventRow, formatDate, formatPrice, display, N_I } from "@/lib/events";
import { Link } from "react-router-dom";
import { MapPin, Clock, Flame } from "lucide-react";

const statusBadge = (s: string) => {
  switch (s) {
    case "sold out": return "bg-destructive/20 text-destructive border-destructive/40";
    case "annulé": return "bg-muted text-muted-foreground border-border line-through";
    case "à vérifier": return "bg-warning/20 text-warning border-warning/40";
    case "terminé": return "bg-muted text-muted-foreground border-border";
    default: return "bg-success/15 text-success border-success/30";
  }
};

export const EventCard = ({ e, variant = "default" }: { e: EventRow; variant?: "default" | "compact" }) => {
  const artists = (e.artists ?? []).slice(0, 3);
  const isHot = (e.popularity_score ?? 0) >= 80;

  if (variant === "compact") {
    return (
      <Link
        to={`/event/${e.id}`}
        className="group flex gap-3 p-3 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-all duration-200 shadow-card hover:shadow-glow"
      >
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {e.image_url ? (
            <img src={e.image_url} alt={e.event_name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="h-full w-full bg-gradient-primary opacity-40" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1 py-0.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary-glow font-medium">
            {e.main_style ?? N_I}
            {isHot && <Flame className="h-3 w-3 text-warning" />}
          </div>
          <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary-glow transition-colors">
            {e.event_name}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{display(e.venue_name)}</span>
            {e.start_time && <><span>·</span><span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{e.start_time.slice(0,5)}</span></>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{formatDate(e.event_date)}</span>
            <span className="font-display font-semibold text-xs">{formatPrice(e)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/event/${e.id}`}
      className="group relative block overflow-hidden rounded-xl bg-gradient-card border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow hover:-translate-y-0.5"
    >
      {/* Glow shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(322 95% 56% / 0.08), transparent 70%)" }} />

      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {e.image_url ? (
          <img src={e.image_url} alt={e.event_name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-primary opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border backdrop-blur-sm ${statusBadge(e.status)}`}>{e.status}</span>
          {e.is_free && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/20 text-primary-glow border border-primary/40 backdrop-blur-sm">Gratuit</span>}
        </div>

        {/* Hot badge */}
        {isHot && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-warning/20 text-warning border border-warning/40 backdrop-blur-sm font-medium">
            <Flame className="h-2.5 w-2.5" />Populaire
          </div>
        )}

        {/* Date overlay bottom-right when not hot */}
        {!isHot && (
          <div className="absolute bottom-3 right-3">
            <div className="text-xs uppercase tracking-wider text-foreground/90 font-display font-medium px-2 py-1 rounded-md bg-background/60 backdrop-blur">
              {formatDate(e.event_date)}
            </div>
          </div>
        )}
        {isHot && (
          <div className="absolute bottom-3 right-3">
            <div className="text-xs uppercase tracking-wider text-foreground/90 font-display font-medium px-2 py-1 rounded-md bg-background/60 backdrop-blur">
              {formatDate(e.event_date)}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-primary-glow font-medium min-w-0">
            <span className="truncate">{e.main_style ?? N_I}</span>
            {e.event_type && <><span className="text-border flex-shrink-0">·</span><span className="text-muted-foreground truncate">{e.event_type}</span></>}
          </div>
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary-glow transition-colors duration-200">
          {e.event_name}
        </h3>

        {/* Artists preview */}
        {artists.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artists.map(a => (
              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{a}</span>
            ))}
            {(e.artists?.length ?? 0) > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">+{(e.artists?.length ?? 0) - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{display(e.venue_name)}</span></span>
          {e.start_time && <span className="inline-flex items-center gap-1 flex-shrink-0"><Clock className="h-3 w-3" />{e.start_time.slice(0,5)}</span>}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
          <span className="text-xs text-muted-foreground truncate">{display(e.neighborhood)}</span>
          <span className={`font-display font-bold text-sm flex-shrink-0 ml-2 ${e.is_free ? "text-success" : "text-foreground"}`}>
            {formatPrice(e)}
          </span>
        </div>
      </div>
    </Link>
  );
};
