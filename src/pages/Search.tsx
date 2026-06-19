import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventRow } from "@/lib/events";
import { EventCard, EventCardRow } from "@/components/EventCard";
import { Layout } from "@/components/Layout";
import { Search as SearchIcon, LayoutGrid, List, X, SlidersHorizontal } from "lucide-react";

const STYLES = ["techno","house","EDM","rap","hip-hop","R&B","afrobeat","amapiano","dancehall","reggaeton","latino","pop","disco","funk","jazz","rock","open format"];
const TYPES  = ["club","concert","festival","afterhours","underground","rave","bar","outdoor"];
const SORTS  = [
  { value: "date-asc",   label: "Date ↑" },
  { value: "date-desc",  label: "Date ↓" },
  { value: "popularity", label: "Popularité" },
  { value: "price-asc",  label: "Prix ↑" },
];

// ── Shared style tokens ──
const MONO = "'Space Mono', monospace";
const EDIT = "'Playfair Display', Georgia, serif";
const ORANGE = "#E8500A";
const CARD_BG = "#0f0f0f";
const BORDER = "rgba(255,255,255,0.07)";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);

  const q            = params.get("q") ?? "";
  const style        = params.get("style") ?? "";
  const type         = params.get("type") ?? "";
  const free         = params.get("free") === "1";
  const neighborhood = params.get("neighborhood") ?? "";
  const dateFrom     = params.get("dateFrom") ?? "";
  const dateTo       = params.get("dateTo") ?? "";
  const sort         = params.get("sort") ?? "date-asc";

  useEffect(() => {
    supabase.from("events").select("*").order("event_date").then(({ data }) => {
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const neighborhoods = useMemo(() =>
    Array.from(new Set(events.map(e => e.neighborhood).filter(Boolean))) as string[], [events]);

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
      if (dateTo   && e.event_date > dateTo)   return false;
      return true;
    });
    switch (sort) {
      case "date-desc":  result = [...result].sort((a, b) => b.event_date.localeCompare(a.event_date)); break;
      case "popularity": result = [...result].sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)); break;
      case "price-asc":  result = [...result].sort((a, b) => {
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

  const activeFilters = [
    ...(free        ? [{ label: "Gratuit",            key: "free" }] : []),
    ...(style       ? [{ label: style,                key: "style" }] : []),
    ...(type        ? [{ label: type,                 key: "type" }] : []),
    ...(neighborhood ? [{ label: neighborhood,         key: "neighborhood" }] : []),
    ...(dateFrom    ? [{ label: `Depuis ${dateFrom}`, key: "dateFrom" }] : []),
    ...(dateTo      ? [{ label: `Jusqu'au ${dateTo}`, key: "dateTo" }] : []),
  ];

  const clearAll = () => setParams(q ? new URLSearchParams({ q }) : new URLSearchParams(), { replace: true });

  const selectStyle: React.CSSProperties = {
    background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, color: "rgba(255,255,255,0.7)",
    fontFamily: MONO, fontSize: 11, padding: "8px 12px", width: "100%", outline: "none",
  };

  return (
    <Layout>
      <div className="px-5 py-8 space-y-6">
        {/* Header */}
        <div>
          <p style={{ fontFamily: MONO, fontSize: 10, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
            Montréal
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 style={{ fontFamily: EDIT, fontSize: 32, fontWeight: 400, color: "#fff" }}>Recherche</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: MONO, fontSize: 10, padding: "8px 14px", borderRadius: 20,
                  background: showFilters ? "rgba(232,80,10,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${showFilters ? "rgba(232,80,10,0.4)" : BORDER}`,
                  color: showFilters ? ORANGE : "rgba(255,255,255,0.5)",
                }}
              >
                <SlidersHorizontal style={{ width: 13, height: 13 }} />
                Filtres
                {activeFilters.length > 0 && (
                  <span style={{ background: ORANGE, color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                    {activeFilters.length}
                  </span>
                )}
              </button>
              <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setView("list")} style={{ padding: "8px 10px", background: view === "list" ? "rgba(232,80,10,0.15)" : "transparent", color: view === "list" ? ORANGE : "rgba(255,255,255,0.3)" }}>
                  <List style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={() => setView("grid")} style={{ padding: "8px 10px", background: view === "grid" ? "rgba(232,80,10,0.15)" : "transparent", color: view === "grid" ? ORANGE : "rgba(255,255,255,0.3)" }}>
                  <LayoutGrid style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <SearchIcon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.28)" }} />
          <input
            value={q}
            onChange={e => update("q", e.target.value || null)}
            placeholder="Événement, lieu, DJ, style…"
            style={{
              width: "100%", background: CARD_BG, border: `1px solid ${BORDER}`,
              borderRadius: 14, paddingLeft: 44, paddingRight: 40, paddingTop: 14, paddingBottom: 14,
              fontFamily: MONO, fontSize: 12, color: "#fff", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(232,80,10,0.5)")}
            onBlur={e => (e.target.style.borderColor = BORDER)}
          />
          {q && (
            <button onClick={() => update("q", null)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Style musical</label>
                <select value={style} onChange={e => update("style", e.target.value || null)} style={selectStyle}>
                  <option value="">Tous</option>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Type</label>
                <select value={type} onChange={e => update("type", e.target.value || null)} style={selectStyle}>
                  <option value="">Tous</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Quartier</label>
                <select value={neighborhood} onChange={e => update("neighborhood", e.target.value || null)} style={selectStyle}>
                  <option value="">Tous</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Trier par</label>
                <select value={sort} onChange={e => update("sort", e.target.value)} style={selectStyle}>
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Date début</label>
                <input type="date" value={dateFrom} onChange={e => update("dateFrom", e.target.value || null)} style={selectStyle} />
              </div>
              <div>
                <label style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>Date fin</label>
                <input type="date" value={dateTo} onChange={e => update("dateTo", e.target.value || null)} style={selectStyle} />
              </div>
            </div>
            <button
              onClick={() => update("free", free ? null : "1")}
              style={{
                fontFamily: MONO, fontSize: 11, padding: "10px 16px", borderRadius: 20, width: "100%",
                background: free ? "rgba(232,80,10,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${free ? "rgba(232,80,10,0.4)" : BORDER}`,
                color: free ? ORANGE : "rgba(255,255,255,0.45)",
              }}
            >
              Gratuit seulement
            </button>
          </div>
        )}

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map(f => (
              <button key={f.key} onClick={() => update(f.key, null)} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 10, padding: "5px 12px", borderRadius: 20, background: "rgba(232,80,10,0.12)", border: "1px solid rgba(232,80,10,0.3)", color: ORANGE }}>
                {f.label} <X style={{ width: 11, height: 11 }} />
              </button>
            ))}
            <button onClick={clearAll} style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>
              Tout effacer
            </button>
          </div>
        )}

        {/* Count + sort */}
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {loading ? "Chargement…" : <><span style={{ color: "#fff", fontWeight: 700 }}>{filtered.length}</span> événement{filtered.length !== 1 ? "s" : ""}</>}
          </span>
          {!showFilters && (
            <select value={sort} onChange={e => update("sort", e.target.value)} style={{ ...selectStyle, width: "auto", padding: "6px 12px" }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl animate-pulse" style={{ height: 70, background: "#0f0f0f" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Aucun résultat.</p>
            {activeFilters.length > 0 && (
              <button onClick={clearAll} style={{ fontFamily: MONO, fontSize: 11, color: ORANGE, marginTop: 12, textDecoration: "underline" }}>
                Effacer les filtres
              </button>
            )}
          </div>
        ) : view === "list" ? (
          <div className="space-y-2">
            {filtered.map(e => <EventCardRow key={e.id} e={e} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(e => <EventCard key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
