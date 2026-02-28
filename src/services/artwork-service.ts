import type { Artwork, ArtworkRow, CreateArtworkInput, UpdateArtworkInput } from "../types/artwork";
import { rowToArtwork } from "../utils/mapper";

/** Returns all artworks ordered by sort_order ascending. */
export async function getAllArtworks(db: D1Database): Promise<Artwork[]> {
  const result = await db
    .prepare("SELECT * FROM artworks ORDER BY sort_order ASC")
    .all<ArtworkRow>();
  return result.results.map(rowToArtwork);
}

/** Returns a single artwork by ID, or null if not found. */
export async function getArtworkById(db: D1Database, artworkId: string): Promise<Artwork | null> {
  const row = await db
    .prepare("SELECT * FROM artworks WHERE id = ?")
    .bind(artworkId)
    .first<ArtworkRow>();
  return row ? rowToArtwork(row) : null;
}

/** Returns artworks filtered by technique (Spanish). */
export async function getArtworksByTechnique(
  db: D1Database,
  technique: string,
): Promise<Artwork[]> {
  const result = await db
    .prepare("SELECT * FROM artworks WHERE technique_es = ? ORDER BY sort_order ASC")
    .bind(technique)
    .all<ArtworkRow>();
  return result.results.map(rowToArtwork);
}

/** Returns distinct technique names (Spanish). */
export async function getDistinctTechniques(db: D1Database): Promise<string[]> {
  const result = await db
    .prepare("SELECT DISTINCT technique_es FROM artworks ORDER BY technique_es ASC")
    .all<{ technique_es: string }>();
  return result.results.map((r) => r.technique_es);
}

/** Creates a new artwork and returns it. */
export async function createArtwork(db: D1Database, input: CreateArtworkInput): Promise<Artwork> {
  const tags = JSON.stringify(input.tags ?? []);
  await db
    .prepare(
      `INSERT INTO artworks (id, name_es, name_en, description_es, description_en,
       long_description_es, long_description_en, inspiration_es, inspiration_en,
       size, technique_es, technique_en, materials_es, materials_en,
       image_key, tags, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.nameEs,
      input.nameEn,
      input.descriptionEs,
      input.descriptionEn,
      input.longDescriptionEs ?? "",
      input.longDescriptionEn ?? "",
      input.inspirationEs ?? "",
      input.inspirationEn ?? "",
      input.size,
      input.techniqueEs,
      input.techniqueEn,
      input.materialsEs ?? "",
      input.materialsEn ?? "",
      input.imageKey,
      tags,
      input.sortOrder ?? 0,
    )
    .run();

  const created = await getArtworkById(db, input.id);
  if (!created) throw new Error(`Failed to retrieve created artwork: ${input.id}`);
  return created;
}

/** Updates an existing artwork. Returns updated artwork or null if not found. */
export async function updateArtwork(
  db: D1Database,
  artworkId: string,
  input: UpdateArtworkInput,
): Promise<Artwork | null> {
  const fieldMap: Record<string, unknown> = {};
  if (input.nameEs !== undefined) fieldMap.name_es = input.nameEs;
  if (input.nameEn !== undefined) fieldMap.name_en = input.nameEn;
  if (input.descriptionEs !== undefined) fieldMap.description_es = input.descriptionEs;
  if (input.descriptionEn !== undefined) fieldMap.description_en = input.descriptionEn;
  if (input.longDescriptionEs !== undefined) fieldMap.long_description_es = input.longDescriptionEs;
  if (input.longDescriptionEn !== undefined) fieldMap.long_description_en = input.longDescriptionEn;
  if (input.inspirationEs !== undefined) fieldMap.inspiration_es = input.inspirationEs;
  if (input.inspirationEn !== undefined) fieldMap.inspiration_en = input.inspirationEn;
  if (input.size !== undefined) fieldMap.size = input.size;
  if (input.techniqueEs !== undefined) fieldMap.technique_es = input.techniqueEs;
  if (input.techniqueEn !== undefined) fieldMap.technique_en = input.techniqueEn;
  if (input.materialsEs !== undefined) fieldMap.materials_es = input.materialsEs;
  if (input.materialsEn !== undefined) fieldMap.materials_en = input.materialsEn;
  if (input.imageKey !== undefined) fieldMap.image_key = input.imageKey;
  if (input.tags !== undefined) fieldMap.tags = JSON.stringify(input.tags);
  if (input.sortOrder !== undefined) fieldMap.sort_order = input.sortOrder;

  const entries = Object.entries(fieldMap);
  if (entries.length === 0) return getArtworkById(db, artworkId);

  fieldMap.updated_at = new Date().toISOString().replace("T", " ").slice(0, 19);
  const allEntries = Object.entries(fieldMap);

  const setClauses = allEntries.map(([col]) => `${col} = ?`).join(", ");
  const values = allEntries.map(([, val]) => val);

  const result = await db
    .prepare(`UPDATE artworks SET ${setClauses} WHERE id = ?`)
    .bind(...values, artworkId)
    .run();

  if (result.meta.changes === 0) return null;
  return getArtworkById(db, artworkId);
}

/** Deletes an artwork by ID. Returns true if deleted, false if not found. */
export async function deleteArtwork(db: D1Database, artworkId: string): Promise<boolean> {
  const result = await db.prepare("DELETE FROM artworks WHERE id = ?").bind(artworkId).run();
  return result.meta.changes > 0;
}
