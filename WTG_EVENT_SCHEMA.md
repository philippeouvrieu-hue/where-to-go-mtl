# Where To Go Montréal — Format standard des événements

Ce fichier définit le format que le GPT “Where To Go” doit produire pour alimenter l’application.

## Règles générales

- Ne jamais inventer une information.
- Si une information est absente ou incertaine, utiliser `null`.
- L’application affichera `non indiqué` quand une valeur est absente.
- Chaque événement doit avoir au minimum :
  - `event_name`
  - `event_date`
  - au moins une source dans `sources`

## Format JSON attendu

```json
[
  {
    "event_name": "Nom de l’événement",
    "event_date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_time": null,
    "venue_name": "Nom du lieu",
    "address": null,
    "neighborhood": null,
    "city": "Montréal",
    "main_style": null,
    "secondary_styles": [],
    "event_type": null,
    "artists": [],
    "description": null,
    "price_min": null,
    "price_max": null,
    "is_free": null,
    "is_paid": null,
    "ticket_required": null,
    "ticket_url": null,
    "sources": [
      {
        "name": "Nom de la source",
        "url": "https://..."
      }
    ],
    "image_url": null,
    "min_age": null,
    "dress_code": null,
    "entry_difficulty": null,
    "entry_difficulty_reason": null,
    "popularity_score": 0,
    "info_reliability_score": 50,
    "status": "à vérifier"
  }
]
