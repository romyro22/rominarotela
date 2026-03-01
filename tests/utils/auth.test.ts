import { describe, expect, it } from "vitest";
import { isAuthorized } from "../../src/utils/auth";

describe("isAuthorized", () => {
  const API_KEY = "test-secret-key-123";

  it("should return true for valid Bearer token", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    expect(await isAuthorized(request, API_KEY)).toBe(true);
  });

  it("should return false without Authorization header", async () => {
    const request = new Request("https://example.com");
    expect(await isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with wrong API key", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: "Bearer wrong-key" },
    });

    expect(await isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false without Bearer prefix", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: API_KEY },
    });

    expect(await isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with Basic auth scheme", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `Basic ${API_KEY}` },
    });

    expect(await isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with lowercase 'bearer' prefix", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `bearer ${API_KEY}` },
    });

    expect(await isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with empty API key", async () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: "Bearer " },
    });

    expect(await isAuthorized(request, "")).toBe(false);
  });
});
