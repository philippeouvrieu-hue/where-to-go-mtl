import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { EventCardRow } from "@/components/EventCard";
import { EventRow } from "@/lib/events";
import { Heart } from "lucide-react";

const MONO = "'Space Mono', monospace";
const EDIT = "'Playfair Display', Georgia, serif";
const ORANGE = "#E8500A";

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("saved_events")
      .select("event_id, events(*)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setEvents((data ?? []).map((r: any) => r.events).filter(Boolean));
        setLoading(false);
      });
  }, [user]);

  if (authLoading) return (
    <Layout>
      <div className="px-5 py-12" style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
        Chargement…
      </div>
    </Layout>
  );

  if (!user) return (
    <Layout>
      <div className="px-5 py-16 flex flex-col items-center text-center gap-6">
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(232,80,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart style={{ width: 24, height: 24, color: ORANGE }} />
        </div>
        <div>
          <h1 style={{ fontFamily: EDIT, fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 8 }}>Vos favoris</h1>
          <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Connecte-toi pour sauvegarder<br />tes soirées préférées.
          </p>
        </div>
        <Link
          to="/auth"
          style={{
            fontFamily: EDIT, fontSize: 15, fontWeight: 500, color: "#fff",
            background: "linear-gradient(90deg, #C0392B, #E8500A)",
            borderRadius: 14, padding: "14px 32px", textDecoration: "none",
            boxShadow: "0 4px 20px rgba(232,80,10,0.3)",
          }}
        >
          Se connecter
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="px-5 py-8 space-y-6">
        {/* Header */}
        <div>
          <p style={{ fontFamily: MONO, fontSize: 10, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
            Mes soirées
          </p>
          <h1 style={{ fontFamily: EDIT, fontSize: 32, fontWeight: 400, color: "#fff" }}>Favoris</h1>
          {!loading && events.length > 0 && (
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6, display: "block" }}>
              {events.length} événement{events.length > 1 ? "s" : ""} sauvegardé{events.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-xl animate-pulse" style={{ height: 70, background: "#0f0f0f" }} />)}
          </div>
        ) : events.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 16, padding: 48, textAlign: "center" }}>
            <Heart style={{ width: 32, height: 32, color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
            <p style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
              Aucun favori pour l'instant.<br />Explore et sauvegarde des événements.
            </p>
            <Link to="/search" style={{ fontFamily: MONO, fontSize: 11, color: ORANGE, textDecoration: "none", marginTop: 16, display: "inline-block" }}>
              Explorer →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(e => <EventCardRow key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Saved;
