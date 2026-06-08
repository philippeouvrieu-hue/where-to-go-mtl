import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventRow } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { Layout } from "@/components/Layout";
import { Search as SearchIcon, LayoutGrid, List, X, SlidersHorizontal } from "lucide-react";

const STYLES = ["techno","house","EDM","rap","hip-hop","R&B","afrobeat","amapiano","dancehall","reggaeton","latino","pop","disco","funk","jazz","rock","open format"];
const TYPES = ["club","concert","festival","afterhours","underground","rave","bar","outdoor"];
const SORTS = [
  { value: "date-asc", label: "Date ↑" },
  { value: "date-desc", label: "Date ↓" },
  { value: "popularity", label: "Popularité" },
  { value: "price-asc", label: "Prix ↑" },
];

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get("q") ?? "";
  const style = params.get("style") ?? "";
  const type = params.get("type") ?? "";
  const free = params.get("free") === "1";
  const neighborhood = params.get("neighborhood") ?? "";
  const dateFrom = params.get("dateFrom") ?? "";
  const dateTo = params.get("dateTo") ?? "";
  const sort = params.get("sort") ?? "date-asc";

  useEffect(() => {
    supabase.from("events").select("*").order("event_date").then(({ data }) => {
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const neighborhoods = useMemo(() => Array.from(new Set(events.map(e => e.neighborhood).filter(Boolean))) as string[], [events]);

  const filtered = useMemo(() => {
    let result = events.filter(e => {
      if (q) {
        const hay = `${e.event_name} ${e.venue_name ?? ""} ${(e.artists ?? []).join(" ")} ${e.main_style ?? ""} ${e.event_type ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (style && e.main_style !== style && !(e.secondary_styles ?? []).includes(style)) return false;
      if (type && e.event_type !== type) return false;
      if (free && !e.is_free) return false;
      if (neighborhood && e.neighborhood !== neighborhood) return false;
      if (dateFrom && e.event_date < dateFrom) return false;
      if (dateTo && e.event_date > dateTo) return false;
      return true;
    });

    switch (sort) {
      case "date-desc": result = [...result].sort((a, b) => b.event_date.localeCompare(a.event_date)); break;
      case "popularity": result = [...result].sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)); break;
      case "price-asc": result = [...result].sort((a, b) => {
        const pa = a.is_free ? 0 : (a.price_min ?? 999);
        const pb = b.is_free ? 0 : (b.price_min ?? 999);
        return pa - pb;
      }); break;
      default: result = [...result].sort((a, b) => a.event_date.localeCompare(b.event_date));
    }
    return result;
  }, [events, q, style, type, free, neighborhood, dateFrom, dateTo, sort]);

  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  // Active filters for pills
  const activeFilters: { label: string; key: string; value?: string }[] = [
    ...(free ? [{ label: "Gratuit", key: "free" }] : []),
    ...(style ? [{ label: style, key: "style" }] : []),
    ...(type ? [{ label: type, key: "type" }] : []),
    ...(neighborhood ? [{ label: neighborhood, key: "neighborhood" }] : []),
    ...(dateFrom ? [{ label: `Depuis ${dateFrom}`, key: "dateFrom" }] : []),
    ...(dateTo ? [{ label: `Jusqu'au ${dateTo}`, key: "dateTo" }] : []),
  ];

  const clearAll = () => setParams(q ? new URLSearchParams({ q }) : new URLSearchParams(), { replace: true });

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Recherche</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition ${showFilters ? "bg-primary/20 border-primary text-primary-glow" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />Filtres
              {activeFilters.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilters.length}</span>
              )}
            </button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2 transition ${view === "grid" ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 transition ${view === "list" ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => update("q", e.target.value || null)}
            placeholder="Événement, lieu, DJ, style…"
            className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
          />
          {q && (
            <button onClick={() => update("q", null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expandable filters panel */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-gradient-card border border-border space-y-4 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Style musical</label>
                <select value={style} onChange={e => update("style", e.target.value || null)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60">
                  <option value="">Tous</option>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Type d'événement</label>
                <select value={type} onChange={e => update("type", e.target.value || null)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60">
                  <option value="">Tous</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Quartier</label>
                <select value={neighborhood} onChange={e => update("neighborhood", e.target.value || null)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60">
                  <option value="">Tous</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Trier par</label>
                <select value={sort} onChange={e => update("sort", e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60">
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Date début</label>
                <input type="date" value={dateFrom} onChange={e => update("dateFrom", e.target.value || null)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Date fin</label>
                <input type="date" value={dateTo} onChange={e => update("dateTo", e.target.value || null)}
                  className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/60" />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => update("free", free ? null : "1")}
                  className={`w-full text-xs px-3 py-2 rounded-lg border transition ${free ? "bg-primary/20 border-primary text-primary-glow" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  Gratuit seulement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Filtres actifs :</span>
            {activeFilters.map(f => (
              <button
                key={f.key}
                onClick={() => update(f.key, null)}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30 hover:bg-primary/25 transition"
              >
                {f.label} <X className="h-3 w-3" />
              </button>
            ))}
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition">
              Tout effacer
            </button>
          </div>
        )}

        {/* Result count + sort shortcut */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {loading ? "Chargement…" : <><span className="font-semibold text-foreground">{filtered.length}</span> événement{filtered.length !== 1 ? "s" : ""}</>}
          </div>
          {!showFilters && (
            <select value={sort} onChange={e => update("sort", e.target.value)}
              className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className={view === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={view === "list" ? "h-24 rounded-xl bg-card animate-pulse" : "aspect-[16/10] rounded-xl bg-card animate-pulse"} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-muted-foreground">Aucun résultat.</p>
            {activeFilters.length > 0 && (
              <button onClick={clearAll} className="text-xs text-primary-glow hover:underline">Effacer les filtres</button>
            )}
          </div>
        ) : view === "list" ? (
          <div className="space-y-3">
            {filtered.map(e => <EventCard key={e.id} e={e} variant="compact" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(e => <EventCard key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
