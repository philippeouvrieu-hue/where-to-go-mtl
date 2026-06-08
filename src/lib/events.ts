export type EventStatus = "actif" | "annulé" | "sold out" | "terminé" | "à vérifier";

export interface EventRow {
  id: string;
  unique_key: string | null;
  event_name: string;
  event_date: string;
  event_day: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  main_style: string | null;
  secondary_styles: string[] | null;
  event_type: string | null;
  artists: string[] | null;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  is_free: boolean | null;
  is_paid: boolean | null;
  ticket_required: boolean | null;
  ticket_url: string | null;
  sources: any;
  image_url: string | null;
  min_age: string | null;
  dress_code: string | null;
  entry_difficulty: string | null;
  entry_difficulty_reason: string | null;
  popularity_score: number | null;
  info_reliability_score: number | null;
  status: EventStatus;
  last_updated: string;
  created_at: string;
}

export const N_I = "non indiqué";
export const display = <T,>(v: T | null | undefined | "" | unknown[]): string => {
  if (v === null || v === undefined || v === "") return N_I;
  if (Array.isArray(v) && v.length === 0) return N_I;
  return String(v);
};

export const formatPrice = (e: Pick<EventRow, "is_free" | "price_min" | "price_max">) => {
  if (e.is_free) return "Gratuit";
  if (e.price_min == null && e.price_max == null) return N_I;
  if (e.price_min != null && e.price_max != null && e.price_min !== e.price_max) return `${e.price_min}–${e.price_max} $`;
  return `${e.price_min ?? e.price_max} $`;
};

export const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" });
};
