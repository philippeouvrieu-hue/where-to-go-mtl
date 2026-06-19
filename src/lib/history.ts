/**
 * history.ts — Historique musical de l'utilisateur (localStorage)
 *
 * Stocke les styles musicaux des events consultés.
 * Applique un decay exponentiel sur 7 jours pour favoriser les goûts récents.
 * NE stocke pas les venues — uniquement les styles.
 */

const HISTORY_KEY = "wtm_style_history";
const MAX_ENTRIES = 60;
const DECAY_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface HistoryEntry {
  style: string;
  timestamp: number;
}

function readHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Enregistre la consultation d'un event (par son style musical principal).
 * À appeler dans EventDetail au montage du composant.
 */
export function trackView(style: string | null | undefined): void {
  if (!style) return;
  const history = readHistory();
  history.unshift({ style: style.toLowerCase(), timestamp: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
}

/**
 * Retourne les poids des styles musicaux (somme = 1.0).
 * Plus un style a été consulté récemment et souvent, plus son poids est élevé.
 *
 * Exemple : { "techno": 0.6, "house": 0.3, "jazz": 0.1 }
 */
export function getStyleWeights(): Record<string, number> {
  const history = readHistory();
  if (history.length === 0) return {};

  const now = Date.now();
  const raw: Record<string, number> = {};

  for (const entry of history) {
    const age = now - entry.timestamp;
    // Decay exponentiel : 1.0 maintenant → ~0.37 à 7j → ~0.05 à 21j
    const weight = Math.exp(-age / DECAY_MS);
    raw[entry.style] = (raw[entry.style] ?? 0) + weight;
  }

  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return {};

  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v / total])
  );
}

/**
 * Retourne les N styles préférés de l'utilisateur (pour affichage debug/profil).
 */
export function getTopStyles(n = 3): string[] {
  const weights = getStyleWeights();
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([style]) => style);
}

/** Réinitialise l'historique (utilisé si l'user se déconnecte). */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
