import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { EventRow, formatDate, EventStatus } from "@/lib/events";
import { toast } from "sonner";
import { Pencil, Plus, AlertTriangle } from "lucide-react";

const STATUSES: EventStatus[] = ["actif", "annulé", "sold out", "terminé", "à vérifier"];

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Admin = () => {
  const { user, isAdmin, loading: aLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<"events" | "sources" | "logs" | "queue">("events");
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("events").select("*").order("event_date").then(({ data }) => setEvents((data as EventRow[]) ?? []));
    supabase.from("sources").select("*").then(({ data }) => setSources(data ?? []));
    supabase.from("ingestion_logs").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setLogs(data ?? []));
  }, [isAdmin]);

  if (aLoading) return <Layout><div className="container py-12">Chargement…</div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Layout><div className="container py-16 text-center space-y-3">
    <h1 className="font-display text-2xl font-bold">Accès refusé</h1>
    <p className="text-muted-foreground text-sm">Votre compte n'a pas le rôle admin. Demandez à un administrateur de l'attribuer via :</p>
    <code className="block text-xs bg-card border border-border rounded p-3 text-left max-w-xl mx-auto">
      INSERT INTO public.user_roles (user_id, role) VALUES ('{user.id}', 'admin');
    </code>
  </div></Layout>;

  const refresh = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date");
    setEvents((data as EventRow[]) ?? []);
  };

  const updateStatus = async (id: string, status: EventStatus) => {
    await supabase.from("events").update({ status }).eq("id", id);
    toast.success("Statut mis à jour");
    refresh();
  };

  const save = async () => {
    if (!editing) return;
    const payload: any = { ...editing };
    if (payload.event_name && payload.event_date && payload.venue_name && !payload.unique_key) {
      payload.unique_key = `${normalize(payload.event_name)}-${payload.event_date}-${normalize(payload.venue_name)}-montreal`;
    }
    if (editing.id) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Enregistré"); setEditing(null); refresh();
  };

  // Duplicate detection
  const dupMap = new Map<string, EventRow[]>();
  events.forEach(e => {
    const key = `${normalize(e.event_name)}|${e.event_date}|${normalize(e.venue_name ?? "")}`;
    if (!dupMap.has(key)) dupMap.set(key, []);
    dupMap.get(key)!.push(e);
  });
  const dupes = [...dupMap.values()].filter(a => a.length > 1);
  const queue = events.filter(e => e.status === "à vérifier");

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
            <p className="text-sm text-muted-foreground mt-1">{events.length} événements · {queue.length} à vérifier · {dupes.length} doublons potentiels</p>
          </div>
          <button onClick={() => setEditing({ event_name: "", event_date: new Date().toISOString().slice(0,10), status: "actif", is_free: false, is_paid: true })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-primary font-display font-semibold shadow-glow">
            <Plus className="h-4 w-4" />Ajouter
          </button>
        </div>

        <div className="flex gap-1 border-b border-border">
          {(["events","queue","sources","logs"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-display font-medium border-b-2 -mb-px transition ${tab === t ? "border-primary text-primary-glow" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "events" ? "Événements" : t === "queue" ? `À vérifier (${queue.length})` : t === "sources" ? "Sources" : "Journaux"}
            </button>
          ))}
        </div>

        {tab === "events" && (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Lieu</th>
                  <th className="text-left p-3">Style</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} className="border-t border-border hover:bg-card/50">
                    <td className="p-3 font-medium">{e.event_name}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(e.event_date)}</td>
                    <td className="p-3 text-muted-foreground">{e.venue_name}</td>
                    <td className="p-3 text-muted-foreground">{e.main_style}</td>
                    <td className="p-3">
                      <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value as EventStatus)}
                        className="bg-background border border-border rounded px-2 py-1 text-xs">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditing(e)} className="p-2 hover:text-primary-glow"><Pencil className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "queue" && (
          <div className="space-y-3">
            {dupes.length > 0 && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div className="text-sm">
                  <strong>{dupes.length} groupe(s) de doublons potentiels détectés</strong> (même nom + date + lieu).
                  Ouvrez chaque fiche pour fusionner manuellement les informations et conserver les sources multiples.
                </div>
              </div>
            )}
            {queue.length === 0 ? <p className="text-muted-foreground text-sm">File vide.</p> : (
              <div className="space-y-2">
                {queue.map(e => (
                  <div key={e.id} className="p-4 rounded-lg bg-gradient-card border border-border flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.event_name}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(e.event_date)} · {e.venue_name}</div>
                    </div>
                    <button onClick={() => setEditing(e)} className="text-xs text-primary-glow hover:underline">Vérifier →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "sources" && (
          <div className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground mb-3">Évaluation des sources d'ingestion (lecture seule v1). L'ingestion automatique sera ajoutée en v2.</p>
            {sources.map(s => (
              <div key={s.id} className="p-4 rounded-lg bg-gradient-card border border-border grid md:grid-cols-5 gap-3">
                <div><div className="font-display font-semibold">{s.source_name}</div><div className="text-xs text-muted-foreground">{s.source_type}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Risque légal</div><div>{s.legal_risk ?? "—"}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Difficulté</div><div>{s.technical_difficulty ?? "—"}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Fréquence</div><div>{s.update_frequency ?? "—"}</div></div>
                <div><div className="text-[10px] uppercase text-muted-foreground">Méthode</div><div className="text-xs">{s.alternative_method ?? "—"}</div></div>
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div className="rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            {logs.length === 0 ? "Aucun journal d'ingestion. Les exécutions automatiques apparaîtront ici en v2." :
              <ul>{logs.map(l => <li key={l.id}>{l.source_name} · {l.status} · {l.events_created} créés</li>)}</ul>}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold">{editing.id ? "Modifier" : "Nouvel"} événement</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Inp label="Nom *" value={editing.event_name ?? ""} onChange={v => setEditing({ ...editing, event_name: v })} full />
              <Inp label="Date *" type="date" value={editing.event_date ?? ""} onChange={v => setEditing({ ...editing, event_date: v })} />
              <Inp label="Heure début" type="time" value={editing.start_time ?? ""} onChange={v => setEditing({ ...editing, start_time: v })} />
              <Inp label="Lieu *" value={editing.venue_name ?? ""} onChange={v => setEditing({ ...editing, venue_name: v })} />
              <Inp label="Quartier" value={editing.neighborhood ?? ""} onChange={v => setEditing({ ...editing, neighborhood: v })} />
              <Inp label="Style principal" value={editing.main_style ?? ""} onChange={v => setEditing({ ...editing, main_style: v })} />
              <Inp label="Type" value={editing.event_type ?? ""} onChange={v => setEditing({ ...editing, event_type: v })} />
              <Inp label="Prix min" type="number" value={String(editing.price_min ?? "")} onChange={v => setEditing({ ...editing, price_min: v ? Number(v) : null })} />
              <Inp label="Prix max" type="number" value={String(editing.price_max ?? "")} onChange={v => setEditing({ ...editing, price_max: v ? Number(v) : null })} />
              <Inp label="URL billet" value={editing.ticket_url ?? ""} onChange={v => setEditing({ ...editing, ticket_url: v })} full />
              <Inp label="URL image" value={editing.image_url ?? ""} onChange={v => setEditing({ ...editing, image_url: v })} full />
              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm min-h-[80px]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Statut</label>
                <select value={editing.status ?? "actif"} onChange={e => setEditing({ ...editing, status: e.target.value as EventStatus })}
                  className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm pt-5">
                <input type="checkbox" checked={!!editing.is_free} onChange={e => setEditing({ ...editing, is_free: e.target.checked, is_paid: !e.target.checked })} />
                Gratuit
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-border text-sm">Annuler</button>
              <button onClick={save} className="px-4 py-2 rounded-md bg-gradient-primary font-display font-semibold text-sm">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const Inp = ({ label, value, onChange, type = "text", full }: { label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean }) => (
  <div className={full ? "col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
  </div>
);

export default Admin;
