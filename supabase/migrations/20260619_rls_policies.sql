-- ============================================================
-- Row Level Security — What's the Move
-- Permet la lecture publique des events et venues,
-- et limite les modifications aux utilisateurs authentifiés.
-- ============================================================

-- ── TABLE events ─────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les events
CREATE POLICY "events_public_read"
  ON events FOR SELECT
  USING (true);

-- Seul le service_role (admin/scraper) peut insérer/modifier/supprimer
-- (pas de policy INSERT/UPDATE/DELETE pour les users anonymes = bloqué par défaut)

-- ── TABLE venues ─────────────────────────────────────────────
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_public_read"
  ON venues FOR SELECT
  USING (true);

-- ── TABLE saved_events ───────────────────────────────────────
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- Un user ne voit que ses propres favoris
CREATE POLICY "saved_events_owner_read"
  ON saved_events FOR SELECT
  USING (auth.uid() = user_id);

-- Un user peut sauvegarder un event (uniquement le sien)
CREATE POLICY "saved_events_owner_insert"
  ON saved_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Un user peut supprimer ses propres favoris
CREATE POLICY "saved_events_owner_delete"
  ON saved_events FOR DELETE
  USING (auth.uid() = user_id);
