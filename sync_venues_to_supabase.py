#!/usr/bin/env python3
"""
sync_venues_to_supabase.py
Lit venues-db.json et upserte dans la table Supabase `venues`.
Usage: python sync_venues_to_supabase.py
"""

import json, os, sys
import urllib.request, urllib.error

# ── Config ──────────────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "config.json"), encoding="utf-8") as f:
    cfg = json.load(f)

SUPABASE_URL = cfg["supabase_url"].rstrip("/")
_key_from_cfg = cfg.get("supabase_service_key", "LOAD_FROM_ENV")
SERVICE_KEY  = _key_from_cfg if _key_from_cfg != "LOAD_FROM_ENV" else os.environ.get("SUPABASE_SERVICE_KEY", "")
if not SERVICE_KEY:
    print("❌ Service key manquante. Ajoute SUPABASE_SERVICE_KEY=... dans .env ou en variable d'env.")
    print("   Exemple: SUPABASE_SERVICE_KEY=sb_secret_... python sync_venues_to_supabase.py")
    sys.exit(1)
VENUES_FILE  = os.path.join(HERE, "venues-db.json")

# ── SQL pour créer la table (à exécuter une seule fois dans l'éditeur SQL Supabase) ──
CREATE_SQL = """
-- Exécuter dans Supabase > SQL Editor (une seule fois)
CREATE TABLE IF NOT EXISTS venues (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  type                 TEXT,
  address              TEXT,
  neighborhood         TEXT,
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,
  website              TEXT,
  instagram            TEXT,
  phone                TEXT,
  hours                TEXT,
  capacity             INTEGER,
  vibe                 TEXT,
  music_styles         TEXT[],
  crowd_type           TEXT,
  cover_typical        TEXT,
  cover_notes          TEXT,
  drink_price_beer     TEXT,
  drink_price_cocktail TEXT,
  entry_difficulty     TEXT,
  dress_code           TEXT,
  guestlist_recommended BOOLEAN DEFAULT FALSE,
  face_control         BOOLEAN DEFAULT FALSE,
  wait_time_typical    TEXT,
  notes                TEXT,
  photo_main           TEXT,
  photos               TEXT[],
  tags                 TEXT[],
  rating               NUMERIC(3,1),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (lecture publique, écriture service_role seulement)
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venues_public_read" ON venues FOR SELECT USING (true);
"""

# ── Helpers ──────────────────────────────────────────────────────────────────
def supabase_request(method: str, path: str, body=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", SERVICE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "resolution=merge-duplicates,return=minimal")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"Lecture de {VENUES_FILE}…")
    with open(VENUES_FILE, encoding="utf-8") as f:
        db = json.load(f)

    venues = db.get("venues", [])
    print(f"  {len(venues)} venue(s) trouvé(s)")

    ok = err = 0
    for v in venues:
        # Prépare le payload Supabase (même structure que venues-db.json)
        payload = {
            "id":                   v["id"],
            "name":                 v.get("name", ""),
            "type":                 v.get("type", ""),
            "address":              v.get("address", ""),
            "neighborhood":         v.get("neighborhood", ""),
            "lat":                  v.get("lat"),
            "lng":                  v.get("lng"),
            "website":              v.get("website", ""),
            "instagram":            v.get("instagram", ""),
            "phone":                v.get("phone", ""),
            "hours":                v.get("hours", ""),
            "capacity":             v.get("capacity"),
            "vibe":                 v.get("vibe", ""),
            "music_styles":         v.get("music_styles", []),
            "crowd_type":           v.get("crowd_type", ""),
            "cover_typical":        v.get("cover_typical", ""),
            "cover_notes":          v.get("cover_notes", ""),
            "drink_price_beer":     v.get("drink_price_beer", ""),
            "drink_price_cocktail": v.get("drink_price_cocktail", ""),
            "entry_difficulty":     v.get("entry_difficulty", ""),
            "dress_code":           v.get("dress_code", ""),
            "guestlist_recommended":v.get("guestlist_recommended", False),
            "face_control":         v.get("face_control", False),
            "wait_time_typical":    v.get("wait_time_typical", ""),
            "notes":                v.get("notes", ""),
            "photo_main":           v.get("photo_main", ""),
            "photos":               v.get("photos", []),
            "tags":                 v.get("tags", []),
            "rating":               v.get("rating"),
        }
        status, body = supabase_request("POST", "venues", [payload])
        if status in (200, 201):
            print(f"  ✓ {v['name']}")
            ok += 1
        else:
            print(f"  ✗ {v['name']} — HTTP {status}: {body[:120]}")
            err += 1

    print(f"\nSync terminé: {ok} OK, {err} erreur(s)")
    if err:
        print("\n⚠️  Si tu vois 'relation venues does not exist', crée d'abord la table:")
        print("    Copie le SQL ci-dessous dans Supabase > SQL Editor > Run\n")
        print(CREATE_SQL)
        sys.exit(1)

if __name__ == "__main__":
    main()
