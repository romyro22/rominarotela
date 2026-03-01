import { describe, expect, it } from "vitest";
import type { ApiError, ApiSuccess } from "../../src/types/api";
import { jsonError, jsonSuccess } from "../../src/utils/response";

describe("jsonSuccess", () => {
  it("should return 200 with success body", async () => {
    const response = jsonSuccess({ items: [1, 2, 3] });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = (await response.json()) as ApiSuccess<{ items: number[] }>;
    expect(body).toEqual({ success: true, data: { items: [1, 2, 3] } });
  });

  it("should support custom status code", async () => {
    const response = jsonSuccess({ id: "new" }, 201);

    expect(response.status).toBe(201);

    const body = (await response.json()) as ApiSuccess<{ id: string }>;
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: "new" });
  });
});

describe("jsonError", () => {
  it("should return error body with default 400 status", async () => {
    const response = jsonError("INVALID_INPUT", "Name is required");

    expect(response.status).toBe(400);

    const body = (await response.json()) as ApiError;
    expect(body).toEqual({
      success: false,
      error: { code: "INVALID_INPUT", message: "Name is required" },
    });
  });

  it("should support custom status code", async () => {
    const response = jsonError("UNAUTHORIZED", "Invalid token", 401);

    expect(response.status).toBe(401);

    const body = (await response.json()) as ApiError;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
