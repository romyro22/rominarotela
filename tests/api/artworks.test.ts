import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { DELETE, GET as GET_BY_ID, PUT } from "../../src/pages/api/artworks/[id]";
import { GET, POST } from "../../src/pages/api/artworks/index";
import type { ApiError, ApiSuccess } from "../../src/types/api";
import type { Artwork } from "../../src/types/artwork";
import { createAuthenticatedContext, createMockContext } from "../helpers/mock-context";

const CREATE_TABLE =
  "CREATE TABLE IF NOT EXISTS artworks (id TEXT PRIMARY KEY, name_es TEXT NOT NULL, name_en TEXT NOT NULL, description_es TEXT NOT NULL, description_en TEXT NOT NULL, long_description_es TEXT NOT NULL DEFAULT '', long_description_en TEXT NOT NULL DEFAULT '', inspiration_es TEXT NOT NULL DEFAULT '', inspiration_en TEXT NOT NULL DEFAULT '', size TEXT NOT NULL, technique_es TEXT NOT NULL, technique_en TEXT NOT NULL, materials_es TEXT NOT NULL DEFAULT '', materials_en TEXT NOT NULL DEFAULT '', image_key TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));";

const SEED_ART1 =
  "INSERT INTO artworks (id, name_es, name_en, description_es, description_en, size, technique_es, technique_en, image_key, tags, sort_order) VALUES ('art-1', 'Paisaje', 'Landscape', 'Un paisaje', 'A landscape', '30x40', 'Acuarela', 'Watercolor', 'artworks/art-1/img.png', '[\"paisaje\"]', 1);";

const SEED_ART2 =
  "INSERT INTO artworks (id, name_es, name_en, description_es, description_en, size, technique_es, technique_en, image_key, tags, sort_order) VALUES ('art-2', 'Retrato', 'Portrait', 'Un retrato', 'A portrait', '40x50', 'Oleo', 'Oil', 'artworks/art-2/img.png', '[\"retrato\"]', 2);";

const VALID_CREATE_BODY = {
  id: "art-new",
  nameEs: "Nueva Obra",
  nameEn: "New Artwork",
  descriptionEs: "Descripcion",
  descriptionEn: "Description",
  size: "20x30",
  techniqueEs: "Gouache",
  techniqueEn: "Gouache",
  imageKey: "artworks/art-new/img.png",
};

describe("GET /api/artworks", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
    await env.DB.exec(SEED_ART1);
    await env.DB.exec(SEED_ART2);
  });

  it("should return all artworks with success:true", async () => {
    const ctx = createMockContext({ url: "https://example.com/api/artworks" });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork[]>;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].id).toBe("art-1");
    expect(body.data[1].id).toBe("art-2");
  });

  it("should filter artworks by technique query param", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/artworks?technique=Acuarela",
    });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork[]>;

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].techniqueEs).toBe("Acuarela");
  });

  it("should return empty array for unknown technique", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/artworks?technique=Pastel",
    });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork[]>;

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });
});

describe("POST /api/artworks", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
  });

  it("should create artwork with valid input and auth", async () => {
    const ctx = createAuthenticatedContext({
      method: "POST",
      url: "https://example.com/api/artworks",
      body: VALID_CREATE_BODY,
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork>;

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("art-new");
    expect(body.data.nameEs).toBe("Nueva Obra");
  });

  it("should return 401 without auth header", async () => {
    const ctx = createMockContext({
      method: "POST",
      url: "https://example.com/api/artworks",
      body: VALID_CREATE_BODY,
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 400 with invalid JSON body", async () => {
    const ctx = createAuthenticatedContext({
      method: "POST",
      url: "https://example.com/api/artworks",
      body: "not-valid-json{{{",
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_JSON");
  });

  it("should return 400 with missing required fields", async () => {
    const ctx = createAuthenticatedContext({
      method: "POST",
      url: "https://example.com/api/artworks",
      body: { id: "art-incomplete" },
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_FIELDS");
  });

  it("should return 400 with invalid field types", async () => {
    const ctx = createAuthenticatedContext({
      method: "POST",
      url: "https://example.com/api/artworks",
      body: { ...VALID_CREATE_BODY, sortOrder: "not-a-number" },
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_FIELDS");
  });
});

describe("GET /api/artworks/:id", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
    await env.DB.exec(SEED_ART1);
  });

  it("should return single artwork by ID", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
    });
    const response = await GET_BY_ID(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork>;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("art-1");
    expect(body.data.nameEs).toBe("Paisaje");
  });

  it("should return 404 for non-existent ID", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/artworks/non-existent",
      params: { id: "non-existent" },
    });
    const response = await GET_BY_ID(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("should return 400 without ID param", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/artworks/",
      params: {},
    });
    const response = await GET_BY_ID(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("MISSING_ID");
  });
});

describe("PUT /api/artworks/:id", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
    await env.DB.exec(SEED_ART1);
  });

  it("should update artwork with valid partial input", async () => {
    const ctx = createAuthenticatedContext({
      method: "PUT",
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
      body: { nameEs: "Paisaje Actualizado", size: "35x45" },
    });
    const response = await PUT(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork>;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.nameEs).toBe("Paisaje Actualizado");
    expect(body.data.size).toBe("35x45");
    expect(body.data.nameEn).toBe("Landscape");
  });

  it("should return 401 without auth", async () => {
    const ctx = createMockContext({
      method: "PUT",
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
      body: { nameEs: "X" },
    });
    const response = await PUT(ctx);

    expect(response.status).toBe(401);
  });

  it("should return 404 for non-existent ID", async () => {
    const ctx = createAuthenticatedContext({
      method: "PUT",
      url: "https://example.com/api/artworks/non-existent",
      params: { id: "non-existent" },
      body: { nameEs: "X" },
    });
    const response = await PUT(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("should return 400 with invalid field types", async () => {
    const ctx = createAuthenticatedContext({
      method: "PUT",
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
      body: { sortOrder: "not-a-number" },
    });
    const response = await PUT(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_FIELDS");
  });
});

describe("DELETE /api/artworks/:id", () => {
  beforeEach(async () => {
    await env.DB.exec("DROP TABLE IF EXISTS artworks;");
    await env.DB.exec(CREATE_TABLE);
    await env.DB.exec(SEED_ART1);
  });

  it("should delete artwork and return success", async () => {
    const ctx = createAuthenticatedContext({
      method: "DELETE",
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
    });
    const response = await DELETE(ctx);
    const body = (await response.json()) as ApiSuccess<{ deleted: boolean }>;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it("should return 401 without auth", async () => {
    const ctx = createMockContext({
      method: "DELETE",
      url: "https://example.com/api/artworks/art-1",
      params: { id: "art-1" },
    });
    const response = await DELETE(ctx);

    expect(response.status).toBe(401);
  });

  it("should return 404 for non-existent ID", async () => {
    const ctx = createAuthenticatedContext({
      method: "DELETE",
      url: "https://example.com/api/artworks/non-existent",
      params: { id: "non-existent" },
    });
    const response = await DELETE(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
