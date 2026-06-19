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

// ── Coordonnées précises par venue ──────────────────────────────────────────
const VENUE_COORDS: Record<string, [number, number]> = {
  // Clubs / bars Instagram
  "Le Mal Nécessaire":              [45.5047, -73.5613],
  "Le Red Room":                    [45.5218, -73.5740],
  "La Porte":                       [45.5210, -73.5870],
  "New City Gas":                   [45.4948, -73.5541],
  "Núcleo (Maybe Montreal)":        [45.4916, -73.5768],
  "Tiradito Lounge":                [45.5093, -73.5672],
  "Soubois":                        [45.5046, -73.5782],
  "MAYBE":                          [45.4957, -73.5784],
  "Flyjin":                         [45.5077, -73.5538],
  "Muzique":                        [45.5055, -73.5736],
  "Café Campus":                    [45.5165, -73.5665],
  // Festivals
  "Parc Jean-Drapeau (Osheaga)":    [45.5097, -73.5316],
  "Parc Jean-Drapeau":              [45.5097, -73.5316],
  "Festival International de Jazz de Montréal": [45.5115, -73.5650],
  "SAT / Quartier des Spectacles (MUTEK)":      [45.5115, -73.5650],
  "Quartier des Spectacles":        [45.5115, -73.5650],
  "BEACHCLUB":                      [45.6267, -73.9750],
  // Salles de concert / Ticketmaster
  "Centre Bell":                    [45.4960, -73.5692],
  "MTELUS":                         [45.5107, -73.5573],
  "Le Studio TD":                   [45.5084, -73.5700],
  "Le Balcon X Terrasse":           [45.5087, -73.5698],
  "Le Balcon":                      [45.5087, -73.5698],
  "Bar le Ritz PDB":                [45.5269, -73.6232],
  "St. Denis Theatre":              [45.5154, -73.5730],
  "Théâtre Beanfield":              [45.5197, -73.5548],
  "Fairmount Theatre":              [45.5216, -73.5999],
  "La Sala Rossa":                  [45.5239, -73.5906],
  "L'Olympia":                      [45.5174, -73.5527],
  "CABARET DU CASINO DE MONTREAL":  [45.5084, -73.5296],
  "Foufounes Electriques":          [45.5107, -73.5548],
  "Newspeak":                       [45.5196, -73.5740],
  "Le Système":                     [45.5214, -73.5734],
};

// ── Coordonnées par quartier (dernier recours) ──────────────────────────────
const HOOD_COORDS: Record<string, [number, number]> = {
  "Downtown / Village":       [45.5088, -73.5698],
  "Downtown":                 [45.5017, -73.5673],
  "Plateau-Mont-Royal":       [45.5257, -73.5740],
  "Plateau / Mile-End":       [45.5257, -73.5740],
  "Mile-End":                 [45.5257, -73.5740],
  "Mile-Ex / Rosemont":       [45.5310, -73.6112],
  "Vieux-Montréal":           [45.5074, -73.5536],
  "Village":                  [45.5162, -73.5523],
  "Quartier des spectacles":  [45.5115, -73.5650],
  "Griffintown":              [45.4948, -73.5541],
  "Westmount / Atwater":      [45.4916, -73.5768],
  "Centre-ville":             [45.5017, -73.5673],
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
  // Priorité : 1) lat/lng Supabase  2) venue name lookup  3) quartier  4) centre MTL
  const pins = filtered.map(e => {
    const base: [number, number] =
      (e.latitude && e.longitude)
        ? [e.latitude, e.longitude]
        : VENUE_COORDS[e.venue_name ?? ""]
        ?? HOOD_COORDS[e.neighborhood ?? "Montréal"]
        ?? [45.5017, -73.5673];
    const [dLat, dLng] = jitter();
    return { e, coords: [base[0] + dLat, base[1] + dLng] as [number, number] };
  });

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 112px)" }}>
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0">
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E8500A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>
            Montréal
          </p>
          <div className="flex items-end justify-between">
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#fff" }}>Carte</h1>
            {!loading && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                {filtered.length} événement{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Filtres genre */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-3 flex-shrink-0">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="flex-shrink-0 transition-all"
              style={genre === g
                ? { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, background: "#E8500A", color: "#fff", padding: "6px 14px", borderRadius: 20 }
                : { fontFamily: "'Space Mono', monospace", fontSize: 10, background: "#0f0f0f", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.07)", padding: "6px 14px", borderRadius: 20 }
              }
            >
              {g}
            </button>
          ))}
        </div>

        {/* Carte */}
        <div className="flex-1 relative overflow-hidden mx-4 mb-4 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#080808" }}>
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#E8500A" }} />
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Chargement de la carte…</p>
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
