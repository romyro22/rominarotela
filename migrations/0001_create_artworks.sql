-- Create artworks table for the gallery
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  long_description_es TEXT NOT NULL DEFAULT '',
  long_description_en TEXT NOT NULL DEFAULT '',
  inspiration_es TEXT NOT NULL DEFAULT '',
  inspiration_en TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL,
  technique_es TEXT NOT NULL,
  technique_en TEXT NOT NULL,
  materials_es TEXT NOT NULL DEFAULT '',
  materials_en TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for filtering by technique
CREATE INDEX IF NOT EXISTS idx_artworks_technique ON artworks(technique_es);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_artworks_sort_order ON artworks(sort_order);
