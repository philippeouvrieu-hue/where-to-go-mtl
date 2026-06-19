/**
 * algorithm.ts — Algorithme de ranking des événements
 *
 * Score composite (0–100) :
 *   • Style × historique utilisateur  → 40 pts max
 *   • Popularité Instagram             → 25 pts max
 *   • DJ / artiste notable             → 20 pts max
 *   • Fraîcheur (event ce soir)        → 15 pts max
 *
 * Post-processing : règle de diversité (jamais même venue ni même style
 * deux fois de suite dans le feed).
 */

import { EventRow } from "./events";
import { getStyleWeights } from "./history";

// ── Tiers de DJs ─────────────────────────────────────────────────────────────
// Tier 1 = star internationale (rare à MTL)
// Tier 2 = connu nationalement / scène MTL établie
// Tier 3 = local / émergent (défaut)
const DJ_TIERS: Record<string, 1 | 2 | 3> = {
  // Tier 1
  "amelie lens": 1, "charlotte de witte": 1, "carl cox": 1, "fisher": 1,
  "nina kraviz": 1, "peggy gou": 1, "bicep": 1, "jon hopkins": 1,
  "bonobo": 1, "floating points": 1, "four tet": 1, "jamie xx": 1,
  "objekt": 1, "ben ufo": 1, "blawan": 1, "dj koze": 1,
  "solomon": 1, "hunee": 1, "andy stott": 1, "actress": 1,
  "burial": 1, "aphex twin": 1, "moderat": 1, "nils frahm": 1,
  // Tier 2
  "kaytranada": 2, "tiga": 2, "deadmau5": 2, "richie hawtin": 2,
  "snails": 2, "ouri": 2, "essáy": 2, "lunice": 2,
  "Jacques Greene": 2, "absurd trax": 2, "d. tiffany": 2,
  "klue": 2, "priori": 2, "lsdxoxo": 2,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** 0–20 pts selon le meilleur DJ de l'event */
function scoreDJ(artists: string[] | null): number {
  if (!artists || artists.length === 0) return 0;
  let bestTier: 1 | 2 | 3 = 3;
  for (const a of artists) {
    const tier = DJ_TIERS[a.toLowerCase()] ?? 3;
    if (tier < bestTier) bestTier = tier;
  }
  return bestTier === 1 ? 20 : bestTier === 2 ? 10 : 0;
}

/** 0–40 pts selon l'adéquation style de l'event × préférences utilisateur */
function scoreStyle(event: EventRow, weights: Record<string, number>): number {
  if (Object.keys(weights).length === 0) return 0;

  const eventStyles = [
    (event.main_style ?? "").toLowerCase(),
    ...((event.secondary_styles ?? []).map((s: string) => s.toLowerCase())),
  ].filter(Boolean);

  let score = 0;
  for (const eStyle of eventStyles) {
    for (const [prefStyle, w] of Object.entries(weights)) {
      // Match partiel dans les deux sens (ex: "deep house" ↔ "house")
      if (eStyle.includes(prefStyle) || prefStyle.includes(eStyle)) {
        score += w * (eStyle === prefStyle ? 1 : 0.6); // match exact > partiel
      }
    }
  }
  return Math.min(score * 40, 40);
}

/** 0–25 pts depuis popularity_score Supabase (alimenté par le scraper Instagram) */
function scorePopularity(event: EventRow): number {
  const pop = event.popularity_score ?? 0;
  // popularity_score est sur 0–100 dans la DB
  return Math.min((pop / 100) * 25, 25);
}

/** 0–15 pts : boost si l'event a lieu aujourd'hui ou demain */
function scoreFreshness(event: EventRow): number {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (event.event_date === today) return 15;
  if (event.event_date === tomorrow) return 8;
  return 0;
}

/** Score total pour un event donné */
export function scoreEvent(
  event: EventRow,
  weights: Record<string, number>
): number {
  return (
    scoreStyle(event, weights) +
    scorePopularity(event) +
    scoreDJ(event.artists ?? null) +
    scoreFreshness(event)
  );
}

// ── Diversité ─────────────────────────────────────────────────────────────────

/**
 * Réordonne les events pour éviter :
 *   - deux fois la même venue de suite
 *   - deux fois le même style principal de suite
 *
 * On parcourt la liste triée et on saute les items qui créeraient un doublon,
 * en les insérant plus loin. Si aucun candidat valide, on accepte le doublon
 * (plutôt que de bloquer).
 */
function diversify(events: EventRow[]): EventRow[] {
  const result: EventRow[] = [];
  const pool = [...events];

  while (pool.length > 0) {
    const lastVenue = result.at(-1)?.venue_name ?? null;
    const lastStyle = result.at(-1)?.main_style?.toLowerCase() ?? null;

    // Cherche le premier event qui ne duplique ni venue ni style
    const idx = pool.findIndex(
      (e) =>
        e.venue_name !== lastVenue &&
        (e.main_style?.toLowerCase() ?? "") !== lastStyle
    );

    if (idx === -1) {
      // Impossible d'éviter le doublon — on prend le meilleur disponible
      result.push(pool.shift()!);
    } else {
      result.push(pool.splice(idx, 1)[0]);
    }
  }

  return result;
}

// ── Export principal ──────────────────────────────────────────────────────────

/**
 * Trie et diversifie une liste d'events selon l'algo complet.
 * À appeler sur les sections "À la une" et "Ce soir" de la home.
 */
export function rankEvents(events: EventRow[]): EventRow[] {
  if (events.length === 0) return [];
  const weights = getStyleWeights();

  const scored = events
    .map((e) => ({ e, score: scoreEvent(e, weights) }))
    .sort((a, b) => b.score - a.score);

  return diversify(scored.map((s) => s.e));
}

/**
 * Trie les events d'un genre donné (popularité + DJ, pas style car déjà filtré).
 * À appeler dans GenreRow.
 */
export function rankGenreEvents(events: EventRow[]): EventRow[] {
  if (events.length === 0) return [];
  return [...events].sort(
    (a, b) =>
      scorePopularity(b) + scoreDJ(b.artists ?? null) -
      (scorePopularity(a) + scoreDJ(a.artists ?? null))
  );
}
