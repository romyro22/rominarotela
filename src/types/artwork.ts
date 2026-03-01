/** Row shape as stored in D1 (snake_case columns). */
export interface ArtworkRow {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  long_description_es: string;
  long_description_en: string;
  inspiration_es: string;
  inspiration_en: string;
  size: string;
  technique_es: string;
  technique_en: string;
  materials_es: string;
  materials_en: string;
  image_key: string;
  tags: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Application-level artwork (camelCase). */
export interface Artwork {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  longDescriptionEs: string;
  longDescriptionEn: string;
  inspirationEs: string;
  inspirationEn: string;
  size: string;
  techniqueEs: string;
  techniqueEn: string;
  materialsEs: string;
  materialsEn: string;
  imageKey: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Input DTO for creating an artwork. */
export interface CreateArtworkInput {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  longDescriptionEs?: string;
  longDescriptionEn?: string;
  inspirationEs?: string;
  inspirationEn?: string;
  size: string;
  techniqueEs: string;
  techniqueEn: string;
  materialsEs?: string;
  materialsEn?: string;
  imageKey: string;
  tags?: string[];
  sortOrder?: number;
}

/** Input DTO for updating an artwork (all fields optional). */
export type UpdateArtworkInput = Partial<Omit<CreateArtworkInput, "id">>;
