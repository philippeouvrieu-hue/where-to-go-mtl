import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { EventRow, formatDate, EventStatus } from "@/lib/events";
import { toast } from "sonner";
import { Pencil, Plus, AlertTriangle, Upload, Eye } from "lucide-react";

const STATUSES: EventStatus[] = ["actif", "annulé", "sold out", "terminé", "à vérifier"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type ImportedSource = {
  name: string;
  url: string;
};

type ImportedEvent = {
  event_name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  main_style: string | null;
  secondary_styles: string[];
  event_type: string | null;
  artists: string[];
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  is_free: boolean | null;
  is_paid: boolean | null;
  ticket_required: boolean | null;
  ticket_url: string | null;
  sources: ImportedSource[];
  image_url: string | null;
  min_age: string | null;
  dress_code: string | null;
  entry_difficulty: string | null;
  entry_difficulty_reason: string | null;
  popularity_score: number;
  info_reliability_score: number;
  status: EventStatus;
};

const Admin = () => {
  const { user, isAdmin, loading: aLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<"events" | "sources" | "logs" | "queue" | "import">("events");
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);

  const [jsonInput, setJsonInput] = useState("");
  const [importPreview, setImportPreview] = useState<ImportedEvent[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    supabase
      .from("events")
      .select("*")
      .order("event_date")
      .then(({ data }) => setEvents((data as EventRow[]) ?? []));

    supabase
      .from("sources")
      .select("*")
      .then(({ data }) => setSources(data ?? []));

    supabase
      .from("ingestion_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setLogs(data ?? []));
  }, [isAdmin]);

  if (aLoading) {
    return (
      <Layout>
        <div className="container py-12">Chargement…</div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-16 text-center space-y-3">
          <h1 className="font-display text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground text-sm">
            Votre compte n'a pas le rôle admin. Demandez à un administrateur de l'attribuer via :
          </p>
          <code className="block text-xs bg-card border border-border rounded p-3 text-left max-w-xl mx-auto">
            INSERT INTO public.user_roles (user_id, role) VALUES ('{user.id}', 'admin');
          </code>
        </div>
      </Layout>
    );
  }

  const refresh = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date");
    setEvents((data as EventRow[]) ?? []);
  };

  const updateStatus = async (id: string, status: EventStatus) => {
    await supabase.from("events").update({ status }).eq("id", id);
    toast.success("Statut mis à jour");
    refresh();
  };

  const getImportKey = (
    event: Pick<ImportedEvent | EventRow, "event_name" | "event_date" | "venue_name">
  ) => {
    return `${normalize(event.event_name)}|${event.event_date}|${normalize(event.venue_name ?? "")}`;
  };

  const validateImportedEvent = (event: Partial<ImportedEvent>, index: number) => {
    const errors: string[] = [];

    if (!event.event_name || typeof event.event_name !== "string") {
      errors.push(`Événement ${index + 1}: event_name est obligatoire.`);
    }

    if (!event.event_date || typeof event.event_date !== "string") {
      errors.push(`Événement ${index + 1}: event_date est obligatoire.`);
    }

    if (!Array.isArray(event.sources) || event.sources.length === 0) {
      errors.push(`Événement ${index + 1}: au moins une source est obligatoire.`);
    }

    if (event.status && !STATUSES.includes(event.status)) {
      errors.push(`Événement ${index + 1}: status invalide.`);
    }

    return errors;
  };

  const parseImportJson = () => {
    setImportErrors([]);
    setImportPreview([]);

    try {
      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        setImportErrors(["Le JSON doit être une liste d’événements, donc commencer par [ et finir par ]."]);
        return;
      }

      const errors = parsed.flatMap((event, index) => validateImportedEvent(event, index));

      if (errors.length > 0) {
        setImportErrors(errors);
        return;
      }

      const cleaned: ImportedEvent[] = parsed.map((event: Partial<ImportedEvent>) => ({
        event_name: event.event_name ?? "",
        event_date: event.event_date ?? "",
        start_time: event.start_time ?? null,
        end_time: event.end_time ?? null,
        venue_name: event.venue_name ?? null,
        address: event.address ?? null,
        neighborhood: event.neighborhood ?? null,
        city: event.city ?? "Montréal",
        main_style: event.main_style ?? null,
        secondary_styles: Array.isArray(event.secondary_styles) ? event.secondary_styles : [],
        event_type: event.event_type ?? null,
        artists: Array.isArray(event.artists) ? event.artists : [],
        description: event.description ?? null,
        price_min: typeof event.price_min === "number" ? event.price_min : null,
        price_max: typeof event.price_max === "number" ? event.price_max : null,
        is_free: typeof event.is_free === "boolean" ? event.is_free : null,
        is_paid: typeof event.is_paid === "boolean" ? event.is_paid : null,
        ticket_required: typeof event.ticket_required === "boolean" ? event.ticket_required : null,
        ticket_url: event.ticket_url ?? null,
        sources: Array.isArray(event.sources) ? event.sources : [],
        image_url: event.image_url ?? null,
        min_age: event.min_age ?? null,
        dress_code: event.dress_code ?? null,
        entry_difficulty: event.entry_difficulty ?? null,
        entry_difficulty_reason: event.entry_difficulty_reason ?? null,
        popularity_score: typeof event.popularity_score === "number" ? event.popularity_score : 0,
        info_reliability_score:
          typeof event.info_reliability_score === "number" ? event.info_reliability_score : 50,
        status: "à vérifier",
      }));

      const existingKeys = new Set(events.map(getImportKey));
      const duplicateNames = cleaned
        .filter((event) => existingKeys.has(getImportKey(event)))
        .map((event) => `${event.event_name} — ${event.event_date}`);

      if (duplicateNames.length > 0) {
        setImportErrors(["Doublons potentiels détectés avec la base actuelle :", ...duplicateNames]);
      }

      setImportPreview(cleaned);
      toast.success(`${cleaned.length} événement(s) prêt(s) à importer.`);
    } catch {
      setImportErrors(["JSON invalide. Vérifie les virgules, guillemets et crochets."]);
    }
  };

  const importEvents = async () => {
    if (importPreview.length === 0) {
      toast.error("Prévisualise d’abord le JSON avant d’importer.");
      return;
    }

    setIsImporting(true);

    const existingKeys = new Set(events.map(getImportKey));

    const eventsToInsert = importPreview
      .filter((event) => !existingKeys.has(getImportKey(event)))
      .map((event) => ({
        event_name: event.event_name,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        venue_name: event.venue_name,
        address: event.address,
        neighborhood: event.neighborhood,
        city: event.city ?? "Montréal",
        main_style: event.main_style,
        secondary_styles: event.secondary_styles,
        event_type: event.event_type,
        artists: event.artists,
        description: event.description,
        price_min: event.price_min,
        price_max: event.price_max,
        is_free: event.is_free,
        is_paid: event.is_paid,
        ticket_required: event.ticket_required,
        ticket_url: event.ticket_url,
        sources: event.sources,
        image_url: event.image_url,
        min_age: event.min_age,
        dress_code: event.dress_code,
        entry_difficulty: event.entry_difficulty,
        entry_difficulty_reason: event.entry_difficulty_reason,
        popularity_score: event.popularity_score,
        info_reliability_score: event.info_reliability_score,
        status: "à vérifier",
        unique_key: `${normalize(event.event_name)}-${event.event_date}-${normalize(
          event.venue_name ?? "lieu-non-indique"
        )}-montreal`,
        last_updated: new Date().toISOString(),
      }));

    if (eventsToInsert.length === 0) {
      setIsImporting(false);
      toast.error("Aucun nouvel événement à importer. Tout semble déjà exister.");
      return;
    }

    const { error } = await supabase.from("events").insert(eventsToInsert);

    setIsImporting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${eventsToInsert.length} événement(s) importé(s).`);
    setJsonInput("");
    setImportPreview([]);
    setImportErrors([]);
    refresh();
    setTab("queue");
  };

  const save = async () => {
    if (!editing) return;

    const payload: any = { ...editing };

    if (payload.event_name && payload.event_date && payload.venue_name && !payload.unique_key) {
      payload.unique_key = `${normalize(payload.event_name)}-${payload.event_date}-${normalize(
        payload.venue_name
      )}-montreal`;
    }

    if (editing.id) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) return toast.error(error.message);
    }

    toast.success("Enregistré");
    setEditing(null);
    refresh();
  };

  const dupMap = new Map<string, EventRow[]>();

  events.forEach((event) => {
    const key = `${normalize(event.event_name)}|${event.event_date}|${normalize(event.venue_name ?? "")}`;
    if (!dupMap.has(key)) dupMap.set(key, []);
    dupMap.get(key)!.push(event);
  });

  const dupes = [...dupMap.values()].filter((group) => group.length > 1);
  const queue = events.filter((event) => event.status === "à vérifier");

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {events.length} événements · {queue.length} à vérifier · {dupes.length} doublons potentiels
            </p>
          </div>

          <button
            onClick={() =>
              setEditing({
                event_name: "",
                event_date: new Date().toISOString().slice(0, 10),
                status: "actif",
                is_free: false,
                is_paid: true,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-primary font-display font-semibold shadow-glow"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {(["events", "queue", "import", "sources", "logs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-display font-medium border-b-2 -mb-px transition whitespace-nowrap ${
                tab === t
                  ? "border-primary text-primary-glow"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "events"
                ? "Événements"
                : t === "queue"
                ? `À vérifier (${queue.length})`
                : t === "import"
                ? "Import JSON"
                : t === "sources"
                ? "Sources"
                : "Journaux"}
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
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-border hover:bg-card/50">
                    <td className="p-3 font-medium">{event.event_name}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(event.event_date)}</td>
                    <td className="p-3 text-muted-foreground">{event.venue_name ?? "non indiqué"}</td>
                    <td className="p-3 text-muted-foreground">{event.main_style ?? "non indiqué"}</td>
                    <td className="p-3">
                      <select
                        value={event.status}
                        onChange={(e) => updateStatus(event.id, e.target.value as EventStatus)}
                        className="bg-background border border-border rounded px-2 py-1 text-xs"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditing(event)} className="p-2 hover:text-primary-glow">
                        <Pencil className="h-4 w-4" />
                      </button>
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
                  <strong>{dupes.length} groupe(s) de doublons potentiels détectés</strong> même nom + date + lieu.
                </div>
              </div>
            )}

            {queue.length === 0 ? (
              <p className="text-muted-foreground text-sm">File vide.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-gradient-card border border-border flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium">{event.event_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(event.event_date)} · {event.venue_name ?? "non indiqué"}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(event)}
                      className="text-xs text-primary-glow hover:underline whitespace-nowrap"
                    >
                      Vérifier →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "import" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-card border border-border space-y-3">
              <div>
                <h2 className="font-display text-xl font-bold">Importer des événements JSON</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Colle ici le JSON produit par le GPT événementiel. Les événements seront ajoutés avec le statut
                  “à vérifier”.
                </p>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"event_name":"Nom de l’événement","event_date":"2026-06-12","sources":[{"name":"Source","url":"https://..."}]}]'
                className="w-full min-h-[260px] bg-background border border-border rounded-lg px-3 py-3 text-sm font-mono focus:outline-none focus:border-primary/60"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={parseImportJson}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm hover:bg-card"
                >
                  <Eye className="h-4 w-4" />
                  Prévisualiser JSON
                </button>

                <button
                  onClick={importEvents}
                  disabled={isImporting || importPreview.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-primary font-display font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? "Import en cours..." : "Importer dans Supabase"}
                </button>
              </div>
            </div>

            {importErrors.length > 0 && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm space-y-1">
                <div className="font-semibold">Points à vérifier :</div>
                {importErrors.map((error, index) => (
                  <div key={index} className="text-muted-foreground">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="p-3 bg-card text-sm font-display font-semibold">
                  Prévisualisation : {importPreview.length} événement(s)
                </div>

                <table className="w-full text-sm">
                  <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">Nom</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Lieu</th>
                      <th className="text-left p-3">Style</th>
                      <th className="text-left p-3">Sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((event, index) => (
                      <tr key={`${event.event_name}-${index}`} className="border-t border-border">
                        <td className="p-3 font-medium">{event.event_name}</td>
                        <td className="p-3 text-muted-foreground">{event.event_date}</td>
                        <td className="p-3 text-muted-foreground">{event.venue_name ?? "non indiqué"}</td>
                        <td className="p-3 text-muted-foreground">{event.main_style ?? "non indiqué"}</td>
                        <td className="p-3 text-muted-foreground">{event.sources.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "sources" && (
          <div className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground mb-3">
              Évaluation des sources d'ingestion lecture seule v1. L'ingestion automatique sera ajoutée en v2.
            </p>

            {sources.map((source) => (
              <div
                key={source.id}
                className="p-4 rounded-lg bg-gradient-card border border-border grid md:grid-cols-5 gap-3"
              >
                <div>
                  <div className="font-display font-semibold">{source.source_name}</div>
                  <div className="text-xs text-muted-foreground">{source.source_type}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Risque légal</div>
                  <div>{source.legal_risk ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Difficulté</div>
                  <div>{source.technical_difficulty ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Fréquence</div>
                  <div>{source.update_frequency ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Méthode</div>
                  <div className="text-xs">{source.alternative_method ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div className="rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            {logs.length === 0 ? (
              "Aucun journal d'ingestion. Les exécutions automatiques apparaîtront ici en v2."
            ) : (
              <ul>
                {logs.map((log) => (
                  <li key={log.id}>
                    {log.source_name} · {log.status} · {log.events_created} créés
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-bold">{editing.id ? "Modifier" : "Nouvel"} événement</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Inp label="Nom *" value={editing.event_name ?? ""} onChange={(v) => setEditing({ ...editing, event_name: v })} full />
              <Inp label="Date *" type="date" value={editing.event_date ?? ""} onChange={(v) => setEditing({ ...editing, event_date: v })} />
              <Inp label="Heure début" type="time" value={editing.start_time ?? ""} onChange={(v) => setEditing({ ...editing, start_time: v })} />
              <Inp label="Lieu *" value={editing.venue_name ?? ""} onChange={(v) => setEditing({ ...editing, venue_name: v })} />
              <Inp label="Quartier" value={editing.neighborhood ?? ""} onChange={(v) => setEditing({ ...editing, neighborhood: v })} />
              <Inp label="Style principal" value={editing.main_style ?? ""} onChange={(v) => setEditing({ ...editing, main_style: v })} />
              <Inp label="Type" value={editing.event_type ?? ""} onChange={(v) => setEditing({ ...editing, event_type: v })} />
              <Inp label="Prix min" type="number" value={String(editing.price_min ?? "")} onChange={(v) => setEditing({ ...editing, price_min: v ? Number(v) : null })} />
              <Inp label="Prix max" type="number" value={String(editing.price_max ?? "")} onChange={(v) => setEditing({ ...editing, price_max: v ? Number(v) : null })} />
              <Inp label="URL billet" value={editing.ticket_url ?? ""} onChange={(v) => setEditing({ ...editing, ticket_url: v })} full />
              <Inp label="URL image" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} full />

              <div className="col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Statut</label>
                <select
                  value={editing.status ?? "actif"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as EventStatus })}
                  className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm pt-5">
                <input
                  type="checkbox"
                  checked={!!editing.is_free}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      is_free: e.target.checked,
                      is_paid: !e.target.checked,
                    })
                  }
                />
                Gratuit
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-border text-sm">
                Annuler
              </button>
              <button onClick={save} className="px-4 py-2 rounded-md bg-gradient-primary font-display font-semibold text-sm">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const Inp = ({
  label,
  value,
  onChange,
  type = "text",
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
}) => (
  <div className={full ? "col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
    />
  </div>
);

export default Admin;