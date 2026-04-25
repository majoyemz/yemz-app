-- Migration: 002_items_table.sql
-- Yemz venue/item catalog imported from Bubble export

CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop and recreate to ensure the schema is exactly as defined below
DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bubble_id       TEXT        UNIQUE,
  name            TEXT        NOT NULL,
  address         TEXT,
  neighborhood    TEXT,
  category        TEXT,
  type            TEXT,
  description     TEXT,
  cover_image     TEXT,
  image_gallery   TEXT[],
  amenities       TEXT[],
  tags            TEXT[],
  cost            TEXT,
  rating          NUMERIC(3,1),
  review_status   TEXT        DEFAULT 'pending',
  website         TEXT,
  google_maps_url TEXT,
  google_place_id TEXT,
  ot_url          TEXT,
  phone_number    TEXT,
  lat             NUMERIC(10,7),
  lng             NUMERIC(10,7),
  location        GEOGRAPHY(Point, 4326),
  opening_time    TEXT[],
  closing_time    TEXT[],
  opening_days    TEXT[],
  yemz_value      INTEGER     DEFAULT 100,
  slug            TEXT,
  creator         TEXT,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  inserted_at     TIMESTAMPTZ DEFAULT now()
);

-- Populate PostGIS point from lat/lng after insert or update
CREATE OR REPLACE FUNCTION items_set_location()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_items_location ON items;
CREATE TRIGGER trg_items_location
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION items_set_location();

CREATE INDEX idx_items_neighborhood   ON items (neighborhood);
CREATE INDEX idx_items_category       ON items (category);
CREATE INDEX idx_items_type           ON items (type);
CREATE INDEX idx_items_review_status  ON items (review_status);
CREATE INDEX idx_items_location       ON items USING GIST (location);
