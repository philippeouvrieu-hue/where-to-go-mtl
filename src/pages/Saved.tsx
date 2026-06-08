import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { EventRow } from "@/lib/events";

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from("saved_events").select("event_id, events(*)").eq("user_id", user.id).then(({ data }) => {
      setEvents((data ?? []).map((r: any) => r.events).filter(Boolean));
      setLoading(false);
    });
  }, [user]);

  if (authLoading) return <Layout><div className="container py-12 text-muted-foreground">Chargement…</div></Layout>;

  if (!user) return (
    <Layout>
      <div className="container py-16 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Vos favoris</h1>
        <p className="text-muted-foreground">Connectez-vous pour sauvegarder des événements.</p>
        <Link to="/auth" className="inline-block px-6 py-3 rounded-md bg-gradient-primary font-display font-semibold">Se connecter</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Vos favoris</h1>
        {loading ? <div className="text-muted-foreground">Chargement…</div>
          : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Aucun favori pour l'instant. Explorez et sauvegardez les événements qui vous intéressent.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {events.map(e => <EventCard key={e.id} e={e} />)}
            </div>
          )}
      </div>
    </Layout>
  );
};
export default Saved;
