import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { EventRow, display, formatPrice, formatDate, N_I } from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ExternalLink, MapPin, Clock, Calendar, Users, ShieldCheck, ArrowLeft, Share2, Navigation } from "lucide-react";
import { toast } from "sonner";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
    <div className="text-sm">{value}</div>
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
      // Fetch related events (same style, not same event)
      if (ev?.main_style) {
        supabase.from("events")
          .select("*")
          .eq("main_style", ev.main_style)
          .neq("id", ev.id)
          .neq("status", "terminé")
          .order("event_date")
          .limit(4)
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
      setSaved(true); toast.success("Ajouté aux favoris");
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

  const mapsUrl = e ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue_name ?? ""} ${e.address ?? ""} Montréal`)}` : "#";

  if (loading) return <Layout><div className="container py-12 text-muted-foreground">Chargement…</div></Layout>;
  if (!e) return <Layout><div className="container py-12">Événement introuvable.</div></Layout>;

  const sources = Array.isArray(e.sources) ? e.sources : [];

  return (
    <Layout>
      <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        {e.image_url ? <img src={e.image_url} alt={e.event_name} className="absolute inset-0 h-full w-full object-cover" />
          : <div className="absolute inset-0 bg-gradient-primary opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="container relative h-full flex items-end pb-8">
          <div className="space-y-3 max-w-3xl">
            <Link to="/" className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" />Retour</Link>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/20 text-primary-glow border border-primary/40">{e.status}</span>
              {e.main_style && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-background/60 border border-border">{e.main_style}</span>}
              {e.is_free && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-success/20 text-success border border-success/40">Gratuit</span>}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-balance">{e.event_name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(e.event_date)}</span>
              {e.start_time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{e.start_time.slice(0,5)}{e.end_time ? `–${e.end_time.slice(0,5)}` : ""}</span>}
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{display(e.venue_name)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div className="flex flex-wrap gap-3">
            {e.ticket_url ? (
              <a href={e.ticket_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-primary font-display font-semibold shadow-glow hover:opacity-90 transition">
                Voir les billets <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex items-center px-6 py-3 rounded-md border border-border text-muted-foreground">Billetterie {N_I}</span>
            )}
            <button onClick={toggleSave} className={`inline-flex items-center gap-2 px-5 py-3 rounded-md border transition ${saved ? "bg-primary/20 border-primary text-primary-glow" : "border-border hover:border-primary/40"}`}>
              <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />{saved ? "Sauvegardé" : "Sauvegarder"}
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border hover:border-primary/40 transition">
              <Share2 className="h-4 w-4" />Partager
            </button>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{display(e.description)}</p>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 rounded-xl bg-gradient-card border border-border">
            <Field label="Prix" value={formatPrice(e)} />
            <Field label="Âge minimum" value={display(e.min_age)} />
            <Field label="Dress code" value={display(e.dress_code)} />
            <Field label="Facilité d'entrée" value={display(e.entry_difficulty)} />
            <Field label="Type" value={display(e.event_type)} />
            <Field label="Billet requis" value={e.ticket_required == null ? N_I : e.ticket_required ? "Oui" : "Non"} />
          </section>

          {e.entry_difficulty_reason && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm">
              <strong className="text-warning">À savoir : </strong>{e.entry_difficulty_reason}
            </div>
          )}

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Artistes / DJs</h2>
            <div className="flex flex-wrap gap-2">
              {(e.artists ?? []).length === 0 ? <span className="text-muted-foreground text-sm">{N_I}</span>
                : (e.artists ?? []).map(a => <span key={a} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{a}</span>)}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Styles</h2>
            <div className="flex flex-wrap gap-2">
              {e.main_style && <span className="px-3 py-1.5 rounded-full bg-primary/20 text-primary-glow border border-primary/40 text-sm">{e.main_style}</span>}
              {(e.secondary_styles ?? []).map(s => <span key={s} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{s}</span>)}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-card border border-border space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-glow" />Lieu</h3>
            <div className="space-y-1 text-sm">
              <div className="font-medium">{display(e.venue_name)}</div>
              <div className="text-muted-foreground">{display(e.address)}</div>
              <div className="text-muted-foreground">{display(e.neighborhood)}, {e.city ?? "Montréal"}</div>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border hover:border-primary/40 text-muted-foreground hover:text-foreground transition w-full justify-center"
              style={{ borderColor: "rgba(240,20,107,0.3)", color: "#f0146b" }}
            >
              <Navigation className="h-3.5 w-3.5" />Voir sur la carte
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-gradient-card border border-border space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary-glow" />Popularité</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: `${e.popularity_score ?? 0}%` }} />
              </div>
              <span className="text-sm font-display font-semibold">{e.popularity_score ?? N_I}</span>
            </div>
            <h3 className="font-display font-semibold flex items-center gap-2 pt-2"><ShieldCheck className="h-4 w-4 text-primary-glow" />Fiabilité info</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-success" style={{ width: `${e.info_reliability_score ?? 0}%` }} />
              </div>
              <span className="text-sm font-display font-semibold">{e.info_reliability_score ?? N_I}</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-card border border-border space-y-3">
            <h3 className="font-display font-semibold">Sources</h3>
            {sources.length === 0 ? <p className="text-sm text-muted-foreground">{N_I}</p> : (
              <ul className="space-y-2 text-sm">
                {sources.map((s: any, i: number) => (
                  <li key={i}>
                    {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="text-primary-glow hover:underline inline-flex items-center gap-1">{s.name ?? s.url}<ExternalLink className="h-3 w-3" /></a>
                      : <span>{s.name ?? "—"}</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-muted-foreground pt-2">Dernière mise à jour : {new Date(e.last_updated).toLocaleString("fr-CA")}</p>
          </div>
        </aside>
      </div>

      {/* Related events */}
      {related.length > 0 && (
        <section className="container py-10 space-y-6 border-t border-border/50">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Événements similaires</h2>
              <p className="text-sm text-muted-foreground mt-1">Même style · {e.main_style}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(r => <EventCard key={r.id} e={r} />)}
          </div>
        </section>
      )}
    </Layout>
  );
};
export default EventDetail;
