import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRow } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

/* ── Scroll-reveal hook ── */
const useReveal = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

/* ── Skeleton card ── */
const Skeleton = () => <div className="aspect-[16/10] rounded-xl bg-card animate-pulse" />;

/* ── Horizontal scroll section ── */
const HScroll = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
);

/* ── Section component ── */
const Section = ({
  title, subtitle, events, loading, searchLink, hscroll = false,
}: {
  title: string; subtitle?: string; events: EventRow[]; loading: boolean; searchLink?: string; hscroll?: boolean;
}) => {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`container space-y-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <Link
          to={searchLink ?? "/search"}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-primary-glow hover:text-primary transition"
        >
          Tout voir <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          Aucun événement dans cette catégorie pour le moment.
        </div>
      ) : hscroll ? (
        <HScroll>
          {events.map(e => (
            <div key={e.id} className="snap-start min-w-[280px] md:min-w-0 flex-shrink-0 md:flex-shrink">
              <EventCard e={e} />
            </div>
          ))}
        </HScroll>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map(e => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </section>
  );
};

/* ── Featured event (top popular) ── */
const Featured = ({ e }: { e: EventRow }) => (
  <Link
    to={`/event/${e.id}`}
    className="group relative block overflow-hidden rounded-2xl border border-primary/30 hover:border-primary/60 transition-all duration-300 shadow-glow"
    style={{ minHeight: 280 }}
  >
    {e.image_url
      ? <img src={e.image_url} alt={e.event_name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      : <div className="absolute inset-0 bg-gradient-primary opacity-40" />}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at 50% 100%, hsl(322 95% 56% / 0.15), transparent 70%)" }} />
    <div className="relative h-full flex flex-col justify-end p-6 md:p-8 space-y-3">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary-glow font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        À la une
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight group-hover:text-primary-glow transition-colors">
        {e.event_name}
      </h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {e.venue_name && <span>{e.venue_name}</span>}
        {e.main_style && <><span className="text-border">·</span><span>{e.main_style}</span></>}
        {e.is_free && <span className="text-success font-medium">Gratuit</span>}
      </div>
      <span className="inline-flex items-center gap-1.5 self-start text-xs font-display font-semibold uppercase tracking-wider text-primary-glow group-hover:gap-2.5 transition-all">
        Voir l'événement <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </div>
  </Link>
);

/* ── Stats bar ── */
const StatsBar = ({ total, tonight, free }: { total: number; tonight: number; free: number }) => (
  <div className="container">
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-gradient-card overflow-hidden">
      {[
        { label: "Événements", value: total },
        { label: "Ce soir", value: tonight },
        { label: "Gratuits", value: free },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center py-5 px-4">
          <span className="font-display text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{value}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main component ── */
const Index = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).then(({ data }) => {
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const tonight = events.filter(e => e.event_date === today && e.status !== "terminé");
  const weekend = events.filter(e => e.event_date >= today && e.event_date <= in7 && e.status !== "terminé");
  const free = events.filter(e => e.is_free && e.status !== "terminé");
  const popular = [...events].filter(e => e.status !== "terminé").sort((a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)).slice(0, 8);
  const underground = events.filter(e => (e.event_type === "underground" || e.event_type === "rave") && e.status !== "terminé");
  const afterhours = events.filter(e => e.event_type === "afterhours" && e.status !== "terminé");
  const featured = popular[0];

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden noise">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, hsl(322 95% 56%), transparent 70%)", animation: "pulse-glow 4s ease-in-out infinite" }} />
          <div className="absolute -bottom-48 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, hsl(280 80% 55%), transparent 70%)", animation: "pulse-glow 5s ease-in-out infinite reverse" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

        <div className="container relative py-16 md:py-28">
          <div className="max-w-3xl space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary-glow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              Agenda nightlife · Montréal
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tighter text-balance">
              La nuit de <span className="bg-gradient-primary bg-clip-text text-transparent">Montréal</span>,<br />sans détour.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Techno, house, rap, afro, latino, concerts, afterhours et raves underground — tout ce qui se passe ce soir et ce week-end.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-primary font-display font-semibold shadow-glow hover:opacity-90 transition">
                Explorer <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/search?free=1" className="inline-flex items-center px-6 py-3 rounded-md border border-border hover:border-primary/50 font-display font-medium transition">
                Soirées gratuites
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-16 py-12">
        {/* Stats bar */}
        {!loading && <StatsBar total={events.length} tonight={tonight.length} free={free.length} />}

        {/* Featured event */}
        {!loading && featured && (
          <section className="container animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <Featured e={featured} />
          </section>
        )}

        <Section title="Ce soir" subtitle="Sortir tout de suite" events={tonight} loading={loading} searchLink="/search" hscroll />
        <Section title="Ce week-end" subtitle="Les 7 prochains jours" events={weekend} loading={loading} hscroll />
        <Section title="Populaires" subtitle="Ce que tout le monde regarde" events={popular} loading={loading} />
        <Section title="Afterhours" subtitle="Quand les clubs ferment" events={afterhours} loading={loading} />
        <Section title="Underground & raves" subtitle="Lieux secrets, collectifs locaux" events={underground} loading={loading} />
        <Section title="Gratuit" subtitle="Aucun billet requis" events={free} loading={loading} searchLink="/search?free=1" hscroll />
      </div>
    </Layout>
  );
};

export default Index;
