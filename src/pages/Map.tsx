import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, formatPrice, styleColor } from "@/lib/events";
import { Clock, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// ── Fix icônes Leaflet avec Vite ──
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Coordonnées par quartier (fallback si pas de lat/lng) ──
const HOOD_COORDS: Record<string, [number, number]> = {
  "Downtown / Village":       [45.5088, -73.5698],
  "Downtown":                 [45.5017, -73.5673],
  "Plateau / Mile-End":       [45.5257, -73.5740],
  "Mile-End":                 [45.5257, -73.5740],
  "Mile-Ex / Rosemont":       [45.5310, -73.6112],
  "Rosemont":                 [45.5474, -73.5916],
  "Vieux-Montréal":           [45.5074, -73.5536],
  "Village":                  [45.5162, -73.5523],
  "Quartier des spectacles":  [45.5115, -73.5650],
  "Griffintown":              [45.4950, -73.5610],
  "Saint-Henri":              [45.4742, -73.5887],
  "Montréal":                 [45.5017, -73.5673],
};

// Légère variation pour éviter les pins superposés
const jitter = (): [number, number] => [
  (Math.random() - 0.5) * 0.004,
  (Math.random() - 0.5) * 0.006,
];

// ── Icône personnalisée par couleur de genre ──
const makeIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:${color};border:2px solid rgba(255,255,255,0.9);
        transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

// ── Recadre la carte sur Montréal ──
const FitMontreal = () => {
  const map = useMap();
  useEffect(() => {
    map.setView([45.5017, -73.5673], 13);
  }, [map]);
  return null;
};

// ── Filtre genre ──
const GENRES = ["Tous", "techno", "house", "hip-hop", "jazz", "afrobeat", "rock", "EDM", "autre"];

const MapPage = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("Tous");

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .neq("status", "terminé")
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setEvents((data as EventRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = genre === "Tous"
    ? events
    : events.filter(e => e.main_style === genre);

  // Attache des coordonnées à chaque event
  const pins = filtered.map(e => {
    const base: [number, number] =
      (e.latitude && e.longitude)
        ? [e.latitude, e.longitude]
        : HOOD_COORDS[e.neighborhood ?? "Montréal"] ?? [45.5017, -73.5673];
    const [dLat, dLng] = jitter();
    return { e, coords: [base[0] + dLat, base[1] + dLng] as [number, number] };
  });

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 112px)" }}>
        {/* Header */}
        <div className="container py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight text-white">Carte</h1>
            {!loading && (
              <p className="text-xs text-white/40 mt-0.5">{filtered.length} événement{filtered.length !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        {/* Filtres genre */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-3 flex-shrink-0">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={genre === g
                ? { background: "#f0146b", color: "white" }
                : { background: "#13131f", color: "rgba(255,255,255,0.4)", border: "1px solid #1e1e2e" }
              }
            >
              {g}
            </button>
          ))}
        </div>

        {/* Carte */}
        <div className="flex-1 relative overflow-hidden mx-4 mb-4 rounded-2xl" style={{ border: "1px solid #1e1e2e" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0d1520" }}>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#f0146b] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/40">Chargement de la carte…</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[45.5017, -73.5673]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <FitMontreal />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {pins.map(({ e, coords }) => (
                <Marker
                  key={e.id}
                  position={coords}
                  icon={makeIcon(styleColor(e.main_style))}
                >
                  <Popup
                    className="wtg-popup"
                    closeButton={false}
                    maxWidth={220}
                  >
                    <div style={{
                      background: "#13131f",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #1e1e2e",
                      minWidth: 180,
                    }}>
                      {e.image_url && (
                        <img src={e.image_url} alt={e.event_name}
                          style={{ width: "100%", height: 80, objectFit: "cover" }} />
                      )}
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: styleColor(e.main_style), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                          {e.main_style ?? "event"}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 6 }}>
                          {e.event_name}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                          <span>📍</span>{e.venue_name}
                        </div>
                        {e.start_time && (
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                            <span>🕐</span>{e.start_time.slice(0, 5)}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: e.is_free ? "#34d399" : "white" }}>
                            {formatPrice(e)}
                          </span>
                          <a
                            href={`/event/${e.id}`}
                            style={{
                              fontSize: 11, fontWeight: 700,
                              padding: "5px 12px", borderRadius: 20,
                              background: "#f0146b", color: "white",
                              textDecoration: "none",
                            }}
                          >
                            Voir →
                          </a>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* CSS popup Leaflet dark */}
      <style>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-container {
          background: #0d1520;
        }
      `}</style>
    </Layout>
  );
};

export default MapPage;
