import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, formatDate } from "@/lib/events";
import { EventCardScroll, EventCardRow } from "@/components/EventCard";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ── Scroll reveal ── */
const useReveal = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

/* ── Skeleton ── */
const SkeletonScroll = () => (
  <div className="flex gap-3 overflow-hidden">
    {[1,2,3,4].map(i => <div key={i} className="flex-shrink-0 w-[115px] h-[100px] rounded-xl animate-pulse" style={{ background: "#13131f" }} />)}
  </div>
);
const SkeletonList = () => (
  <div className="space-y-2">
    {[1,2,3,4].map(i => <div key={i} className="h-[60px] rounded-xl animate-pulse" style={{ background: "#13131f" }} />)}
  </div>
);

/* ── Section scroll horizontal ── */
const ScrollSection = ({ title, subtitle, events, loading, to }: {
  title: string; subtitle?: string; events: EventRow[]; loading: boolean; to?: string;
}) => {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`space-y-4 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="container flex items-end justify-between">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {to && (
          <Link to={to} className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition flex items-center gap-1">
            Tout <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="pl-5 md:pl-0 md:container">
        {loading ? <SkeletonScroll /> : events.length === 0 ? (
          <p className="text-sm text-white/30 pl-0 md:pl-0">Aucun événement pour le moment.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-proximity md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
            {events.map(e => (
              <div key={e.id} className="snap-start flex-shrink-0 md:flex-shrink md:min-w-0">
                <EventCardScroll e={e} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Section liste verticale ── */
const ListSection = ({ title, subtitle, events, loading, to }: {
  title: string; subtitle?: string; events: EventRow[]; loading: boolean; to?: string;
}) => {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`container space-y-4 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {to && (
          <Link to={to} className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition flex items-center gap-1">
            Tout <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {loading ? <SkeletonList /> : events.length === 0 ? (
        <p className="text-sm text-white/30">Aucun événement pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {events.map(e => <EventCardRow key={e.id} e={e} />)}
        </div>
      )}
    </section>
  );
};

/* ── Tabs de date ── */
type DateTab = "soir" | "demain" | "weekend" | "semaine";
const TABS: { id: DateTab; label: string }[] = [
  { id: "soir", label: "Ce soir" },
  { id: "demain", label: "Demain" },
  { id: "weekend", label: "Week-end" },
  { id: "semaine", label: "Semaine" },
];

/* ── Main ── */
const Index = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DateTab>("soir");

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).then(({ data }) => {
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const friday = (() => {
    const d = new Date(); const day = d.getDay();
    const diff = day <= 5 ? 5 - day : 6;
    return new Date(d.getTime() + diff * 86400000).toISOString().slice(0, 10);
  })();
  const sunday = new Date(new Date(friday).getTime() + 2 * 86400000).toISOString().slice(0, 10);

  const active = events.filter(e => e.status !== "terminé" && e.status !== "annulé");
  const tonight = active.filter(e => e.event_date === today);
  const tomorrowEvents = active.filter(e => e.event_date === tomorrow);
  const weekendEvents = active.filter(e => e.event_date >= friday && e.event_date <= sunday);
  const weekEvents = active.filter(e => e.event_date >= today && e.event_date <= in7);
  const free = active.filter(e => e.is_free);
  const popular = [...active].sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)).slice(0, 8);
  const underground = active.filter(e => e.event_type === "underground" || e.event_type === "rave");

  const tabEvents: Record<DateTab, EventRow[]> = {
    soir: tonight, demain: tomorrowEvents, weekend: weekendEvents, semaine: weekEvents,
  };
  const featured = tabEvents[tab];

  // Today's display
  const todayDisplay = new Date().toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Layout>
      {/* ── Bokeh background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {[
          { cx: "15%", cy: "25%", r: 120, color: "rgba(240,20,107,0.07)" },
          { cx: "80%", cy: "15%", r: 90,  color: "rgba(124,58,237,0.07)" },
          { cx: "60%", cy: "55%", r: 70,  color: "rgba(77,166,255,0.06)" },
          { cx: "30%", cy: "70%", r: 100, color: "rgba(240,20,107,0.05)" },
          { cx: "90%", cy: "75%", r: 80,  color: "rgba(124,58,237,0.05)" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", left: b.cx, top: b.cy,
            width: b.r * 2, height: b.r * 2,
            transform: "translate(-50%,-50%)", borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          }} />
        ))}
        {[
          { x: "25%", y: "30%", c: "#f0146b", s: 5 },
          { x: "72%", y: "18%", c: "#a855f7", s: 4 },
          { x: "85%", y: "48%", c: "#4da6ff", s: 6 },
          { x: "12%", y: "62%", c: "#f0146b", s: 3 },
          { x: "55%", y: "20%", c: "#7c3aed", s: 4 },
          { x: "40%", y: "80%", c: "#4da6ff", s: 5 },
          { x: "92%", y: "35%", c: "#f0146b", s: 3 },
        ].map((d, i) => (
          <div key={i} style={{
            position: "absolute", left: d.x, top: d.y,
            width: d.s, height: d.s, borderRadius: "50%",
            background: d.c, opacity: 0.55,
            boxShadow: `0 0 ${d.s * 4}px ${d.s * 2}px ${d.c}55`,
          }} />
        ))}
      </div>

      {/* ── Header hero ── */}
      <section className="container pt-8 pb-6 space-y-6">
        <div className="space-y-2 animate-fade-up">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#f0146b" }} />
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/35 font-medium">Montréal</span>
          </div>
          <h1 className="font-display font-black tracking-tighter leading-none text-white"
            style={{ fontSize: "clamp(2.4rem, 9vw, 4.5rem)" }}>
            What's the Move
          </h1>
        </div>

        {/* Stats pills */}
        {!loading && (
          <div className="flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white/70" style={{ background: "#13131f", border: "1px solid #1e1e2e" }}>
              {active.length} événements
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-emerald-400" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              {free.length} gratuits
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "rgba(240,20,107,0.1)", border: "1px solid rgba(240,20,107,0.2)", color: "#f0146b" }}>
              {tonight.length} ce soir
            </span>
          </div>
        )}

        {/* Date tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200"
              style={tab === t.id
                ? { background: "#f0146b", color: "white" }
                : { background: "#13131f", color: "rgba(255,255,255,0.4)", border: "1px solid #1e1e2e" }
              }
            >
              {t.label}
              {!loading && tabEvents[t.id].length > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">{tabEvents[t.id].length}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Tab content ── */}
      <div className="space-y-12 pb-12">
        {/* Featured scroll for selected tab */}
        <ScrollSection
          title={TABS.find(t => t.id === tab)?.label ?? ""}
          subtitle={tab === "soir" ? "Sortir maintenant" : tab === "demain" ? formatDate(tomorrow) : undefined}
          events={featured}
          loading={loading}
          to="/search"
        />

        <div className="container"><div style={{ height: "1px", background: "#1e1e2e" }} /></div>

        {/* Populaires en liste */}
        <ListSection title="Populaires" subtitle="Ce que tout le monde regarde" events={popular} loading={loading} to="/search?sort=popularity" />

        {/* Underground en scroll */}
        {(loading || underground.length > 0) && (
          <ScrollSection title="Underground" subtitle="Lieux secrets · collectifs" events={underground} loading={loading} />
        )}

        {/* Gratuit en liste */}
        <ListSection title="Gratuit" subtitle="Sans billet requis" events={free} loading={loading} to="/search?free=1" />
      </div>
    </Layout>
  );
};

export default Index;
