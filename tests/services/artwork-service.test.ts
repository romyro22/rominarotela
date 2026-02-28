import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createArtwork,
  deleteArtwork,
  getAllArtworks,
  getArtworkById,
  getArtworksByTechnique,
  getDistinctTechniques,
  updateArtwork,
} from "../../src/services/artwork-service";

const CREATE_TABLE =
  "CREATE TABLE IF NOT EXISTS artworks (id TEXT PRIMARY KEY, name_es TEXT NOT NULL, name_en TEXT NOT NULL, description_es TEXT NOT NULL, description_en TEXT NOT NULL, long_description_es TEXT NOT NULL DEFAULT '', long_description_en TEXT NOT NULL DEFAULT '', inspiration_es TEXT NOT NULL DEFAULT '', inspiration_en TEXT NOT NULL DEFAULT '', size TEXT NOT NULL, technique_es TEXT NOT NULL, technique_en TEXT NOT NULL, materials_es TEXT NOT NULL DEFAULT '', materials_en TEXT NOT NULL DEFAULT '', image_key TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));";

const SEED_ART1 =
  "INSERT INTO artworks (id, name_es, name_en, description_es, description_en, size, technique_es, technique_en, image_key, tags, sort_order) VALUES ('art-1', 'Paisaje', 'Landscape', 'Un paisaje', 'A landscape', '30x40', 'Acuarela', 'Watercolor', 'artworks/art-1/img.png', '[\"paisaje\",\"naturaleza\"]', 1);";

const SEED_ART2 =
  "INSERT INTO artworks (id, name_es, name_en, description_es, description_en, size, technique_es, technique_en, image_key, tags, sort_order) VALUES ('art-2', 'Retrato', 'Portrait', 'Un retrato', 'A portrait', '40x50', 'Óleo', 'Oil', 'artworks/art-2/img.png', '[\"retrato\"]', 2);";

const SEED_ART3 =
  "INSERT INTO artworks (id, name_es, name_en, description_es, description_en, size, technique_es, technique_en, image_key, tags, sort_order) VALUES ('art-3', 'Bosque', 'Forest', 'Un bosque', 'A forest', '50x60', 'Acuarela', 'Watercolor', 'artworks/art-3/img.png', '[]', 3);";

describe("ArtworkService", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
    await env.DB.exec(SEED_ART1);
    await env.DB.exec(SEED_ART2);
    await env.DB.exec(SEED_ART3);
  });

  it("should return all artworks ordered by sort_order", async () => {
    const artworks = await getAllArtworks(env.DB);

    expect(artworks).toHaveLength(3);
    expect(artworks[0].id).toBe("art-1");
    expect(artworks[1].id).toBe("art-2");
    expect(artworks[2].id).toBe("art-3");
  });

  it("should return a single artwork by ID", async () => {
    const artwork = await getArtworkById(env.DB, "art-2");

    expect(artwork).not.toBeNull();
    expect(artwork?.id).toBe("art-2");
    expect(artwork?.nameEs).toBe("Retrato");
    expect(artwork?.nameEn).toBe("Portrait");
    expect(artwork?.techniqueEs).toBe("Óleo");
    expect(artwork?.tags).toEqual(["retrato"]);
  });

  it("should return null for non-existent ID", async () => {
    const artwork = await getArtworkById(env.DB, "non-existent");
    expect(artwork).toBeNull();
  });

  it("should filter artworks by technique", async () => {
    const watercolors = await getArtworksByTechnique(env.DB, "Acuarela");

    expect(watercolors).toHaveLength(2);
    expect(watercolors[0].id).toBe("art-1");
    expect(watercolors[1].id).toBe("art-3");
  });

  it("should return empty array for unknown technique", async () => {
    const artworks = await getArtworksByTechnique(env.DB, "Pastel");
    expect(artworks).toHaveLength(0);
  });

  it("should return distinct techniques", async () => {
    const techniques = await getDistinctTechniques(env.DB);

    expect(techniques).toHaveLength(2);
    expect(techniques).toContain("Acuarela");
    expect(techniques).toContain("Óleo");
  });

  it("should create a new artwork", async () => {
    const created = await createArtwork(env.DB, {
      id: "art-new",
      nameEs: "Nuevo",
      nameEn: "New",
      descriptionEs: "Desc ES",
      descriptionEn: "Desc EN",
      size: "20x30",
      techniqueEs: "Gouache",
      techniqueEn: "Gouache",
      imageKey: "artworks/art-new/img.png",
      tags: ["nuevo"],
      sortOrder: 10,
    });

    expect(created.id).toBe("art-new");
    expect(created.nameEs).toBe("Nuevo");
    expect(created.tags).toEqual(["nuevo"]);
    expect(created.sortOrder).toBe(10);

    const all = await getAllArtworks(env.DB);
    expect(all).toHaveLength(4);
  });

  it("should update an existing artwork partially", async () => {
    const updated = await updateArtwork(env.DB, "art-1", {
      nameEs: "Paisaje Actualizado",
      size: "35x45",
    });

    expect(updated).not.toBeNull();
    expect(updated?.nameEs).toBe("Paisaje Actualizado");
    expect(updated?.size).toBe("35x45");
    expect(updated?.nameEn).toBe("Landscape");
  });

  it("should return null when updating non-existent artwork", async () => {
    const result = await updateArtwork(env.DB, "non-existent", { nameEs: "X" });
    expect(result).toBeNull();
  });

  it("should return unchanged artwork when no fields are provided", async () => {
    const result = await updateArtwork(env.DB, "art-1", {});

    expect(result).not.toBeNull();
    expect(result?.nameEs).toBe("Paisaje");
  });

  it("should delete an artwork and return true", async () => {
    const deleted = await deleteArtwork(env.DB, "art-2");
    expect(deleted).toBe(true);

    const all = await getAllArtworks(env.DB);
    expect(all).toHaveLength(2);
  });

  it("should return false when deleting non-existent artwork", async () => {
    const deleted = await deleteArtwork(env.DB, "non-existent");
    expect(deleted).toBe(false);
  });
});
