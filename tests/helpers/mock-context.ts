import { env } from "cloudflare:test";
import type { APIContext } from "astro";

/** Options for creating a mock APIContext for handler testing. */
export interface MockContextOptions {
  /** HTTP method. Defaults to "GET". */
  method?: string;
  /** Full URL string. Defaults to "https://example.com/". */
  url?: string;
  /** Request headers as key-value pairs. */
  headers?: Record<string, string>;
  /** Request body (string or object — objects are JSON-serialized). */
  body?: string | object;
  /** Route params (e.g., { id: "art-1" }). */
  params?: Record<string, string | undefined>;
}

/** Creates a mock Astro APIContext with real D1/KV/R2 bindings from cloudflare:test. */
export function createMockContext(options: MockContextOptions = {}): APIContext {
  const { method = "GET", url = "https://example.com/", headers = {}, body, params = {} } = options;

  const requestHeaders = new Headers(headers);

  let requestBody: string | undefined;
  if (body !== undefined) {
    requestBody = typeof body === "string" ? body : JSON.stringify(body);
    if (!requestHeaders.has("Content-Type") && typeof body === "object") {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (requestBody !== undefined && method !== "GET" && method !== "HEAD") {
    requestInit.body = requestBody;
  }

  const request = new Request(url, requestInit);
  const parsedUrl = new URL(url);

  return {
    request,
    url: parsedUrl,
    params,
    locals: {
      runtime: {
        env: env as typeof env & {
          ASSETS: { fetch: (req: Request | string) => Promise<Response> };
        },
        cf: {} as never,
        caches: {} as never,
        ctx: {
          waitUntil: () => {},
          passThroughOnException: () => {},
        } as never,
      },
    },
    // Stubs for fields not used in API route handlers
    props: {},
    redirect: (path: string, status = 302) =>
      new Response(null, { status, headers: { Location: path } }),
    cookies: {} as never,
    site: undefined,
    generator: "astro",
    currentLocale: "es",
    preferredLocale: "es",
    preferredLocaleList: ["es", "en"],
    rewrite: (() => {}) as never,
    originPathname: parsedUrl.pathname,
    isPrerendered: false,
    callAction: (() => {}) as never,
    routePattern: "",
    getActionResult: (() => undefined) as never,
    clientAddress: "127.0.0.1",
    csp: { nonce: "" },
  } as unknown as APIContext;
}

/** Shorthand to create a mock context with Bearer auth header. */
export function createAuthenticatedContext(options: MockContextOptions = {}): APIContext {
  return createMockContext({
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${env.API_KEY}`,
    },
  });
}
