import { describe, expect, it } from "vitest";
import type { ArtworkRow } from "../../src/types/artwork";
import { rowToArtwork } from "../../src/utils/mapper";

const baseRow: ArtworkRow = {
  id: "test-1",
  name_es: "Nombre",
  name_en: "Name",
  description_es: "Descripción",
  description_en: "Description",
  long_description_es: "Larga desc",
  long_description_en: "Long desc",
  inspiration_es: "Inspiración",
  inspiration_en: "Inspiration",
  size: "30x40",
  technique_es: "Acuarela",
  technique_en: "Watercolor",
  materials_es: "Papel",
  materials_en: "Paper",
  image_key: "artworks/test-1/img.png",
  tags: '["naturaleza","paisaje"]',
  sort_order: 5,
  created_at: "2026-01-01 00:00:00",
  updated_at: "2026-01-02 00:00:00",
};

describe("rowToArtwork", () => {
  it("should convert snake_case row to camelCase artwork", () => {
    const artwork = rowToArtwork(baseRow);

    expect(artwork.id).toBe("test-1");
    expect(artwork.nameEs).toBe("Nombre");
    expect(artwork.nameEn).toBe("Name");
    expect(artwork.descriptionEs).toBe("Descripción");
    expect(artwork.descriptionEn).toBe("Description");
    expect(artwork.longDescriptionEs).toBe("Larga desc");
    expect(artwork.longDescriptionEn).toBe("Long desc");
    expect(artwork.inspirationEs).toBe("Inspiración");
    expect(artwork.inspirationEn).toBe("Inspiration");
    expect(artwork.size).toBe("30x40");
    expect(artwork.techniqueEs).toBe("Acuarela");
    expect(artwork.techniqueEn).toBe("Watercolor");
    expect(artwork.materialsEs).toBe("Papel");
    expect(artwork.materialsEn).toBe("Paper");
    expect(artwork.imageKey).toBe("artworks/test-1/img.png");
    expect(artwork.sortOrder).toBe(5);
    expect(artwork.createdAt).toBe("2026-01-01 00:00:00");
    expect(artwork.updatedAt).toBe("2026-01-02 00:00:00");
  });

  it("should parse tags from JSON string to array", () => {
    const artwork = rowToArtwork(baseRow);
    expect(artwork.tags).toEqual(["naturaleza", "paisaje"]);
  });

  it("should return empty array for empty tags JSON", () => {
    const artwork = rowToArtwork({ ...baseRow, tags: "[]" });
    expect(artwork.tags).toEqual([]);
  });

  it("should return empty array for invalid tags JSON", () => {
    const artwork = rowToArtwork({ ...baseRow, tags: "not-json" });
    expect(artwork.tags).toEqual([]);
  });

  it("should filter non-string values from tags", () => {
    const artwork = rowToArtwork({ ...baseRow, tags: '["valid", 42, null, "also-valid"]' });
    expect(artwork.tags).toEqual(["valid", "also-valid"]);
  });
});
