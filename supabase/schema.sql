-- Bella Coiffure — Neon PostgreSQL schema

CREATE TABLE IF NOT EXISTS appointments (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  client_firstname TEXT        NOT NULL,
  client_lastname  TEXT        NOT NULL,
  client_phone     TEXT        NOT NULL,
  client_email     TEXT        NOT NULL,
  service_name     TEXT        NOT NULL,
  service_price    INTEGER     NOT NULL,
  coiffeur_nom     TEXT        NOT NULL,
  coiffeur_genre   TEXT        NOT NULL CHECK (coiffeur_genre IN ('homme', 'femme')),
  appointment_date DATE        NOT NULL,
  appointment_time TEXT        NOT NULL,
  note             TEXT,
  status           TEXT        DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending'))
);

CREATE TABLE IF NOT EXISTS services (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  nom         TEXT        NOT NULL,
  description TEXT,
  duree       TEXT        NOT NULL,
  prix        INTEGER     NOT NULL,
  is_active   BOOLEAN     DEFAULT TRUE
);
