import { describe, expect, it } from "vitest";
import { isAuthorized } from "../../src/utils/auth";

describe("isAuthorized", () => {
  const API_KEY = "test-secret-key-123";

  it("should return true for valid Bearer token", () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    expect(isAuthorized(request, API_KEY)).toBe(true);
  });

  it("should return false without Authorization header", () => {
    const request = new Request("https://example.com");
    expect(isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with wrong API key", () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: "Bearer wrong-key" },
    });

    expect(isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false without Bearer prefix", () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: API_KEY },
    });

    expect(isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with Basic auth scheme", () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `Basic ${API_KEY}` },
    });

    expect(isAuthorized(request, API_KEY)).toBe(false);
  });

  it("should return false with lowercase 'bearer' prefix", () => {
    const request = new Request("https://example.com", {
      headers: { Authorization: `bearer ${API_KEY}` },
    });

    expect(isAuthorized(request, API_KEY)).toBe(false);
  });
});
