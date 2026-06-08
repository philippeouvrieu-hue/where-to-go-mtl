
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Montréal',
  latitude NUMERIC,
  longitude NUMERIC,
  website_url TEXT,
  instagram_url TEXT,
  source_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.venues TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.venues TO authenticated;
GRANT ALL ON public.venues TO service_role;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Admins manage venues" ON public.venues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_key TEXT UNIQUE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_day TEXT,
  start_time TIME,
  end_time TIME,
  venue_name TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Montréal',
  latitude NUMERIC,
  longitude NUMERIC,
  main_style TEXT,
  secondary_styles TEXT[] DEFAULT '{}',
  event_type TEXT,
  artists TEXT[] DEFAULT '{}',
  description TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  is_free BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT true,
  ticket_required BOOLEAN,
  ticket_url TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  min_age TEXT,
  dress_code TEXT,
  entry_difficulty TEXT,
  entry_difficulty_reason TEXT,
  popularity_score INTEGER DEFAULT 0,
  info_reliability_score INTEGER DEFAULT 50,
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif','annulé','sold out','terminé','à vérifier')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX events_date_idx ON public.events(event_date);
CREATE INDEX events_status_idx ON public.events(status);
CREATE INDEX events_main_style_idx ON public.events(main_style);

CREATE OR REPLACE FUNCTION public.touch_last_updated()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.last_updated = now(); RETURN NEW; END; $$;
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_last_updated();

-- Sources
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_type TEXT,
  base_url TEXT,
  api_available BOOLEAN DEFAULT false,
  scraping_allowed BOOLEAN,
  legal_risk TEXT,
  technical_difficulty TEXT,
  update_frequency TEXT,
  alternative_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sources TO authenticated;
GRANT ALL ON public.sources TO service_role;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Admins manage sources" ON public.sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Saved events
CREATE TABLE public.saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_events TO authenticated;
GRANT ALL ON public.saved_events TO service_role;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.saved_events FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Ingestion logs
CREATE TABLE public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT,
  run_started_at TIMESTAMPTZ,
  run_finished_at TIMESTAMPTZ,
  status TEXT,
  events_found INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  duplicates_detected INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ingestion_logs TO authenticated;
GRANT ALL ON public.ingestion_logs TO service_role;
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read logs" ON public.ingestion_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage logs" ON public.ingestion_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
