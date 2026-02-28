/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<import("./types/env").Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
