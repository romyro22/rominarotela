import type { Artwork, ArtworkRow } from "../types/artwork";

/** Converts a D1 row (snake_case) to an Artwork object (camelCase). */
export function rowToArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    nameEs: row.name_es,
    nameEn: row.name_en,
    descriptionEs: row.description_es,
    descriptionEn: row.description_en,
    longDescriptionEs: row.long_description_es,
    longDescriptionEn: row.long_description_en,
    inspirationEs: row.inspiration_es,
    inspirationEn: row.inspiration_en,
    size: row.size,
    techniqueEs: row.technique_es,
    techniqueEn: row.technique_en,
    materialsEs: row.materials_es,
    materialsEn: row.materials_en,
    imageKey: row.image_key,
    tags: parseTags(row.tags),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Safely parses a JSON string of tags into a string array. */
function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}
