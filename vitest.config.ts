import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    deps: {
      optimizer: {
        ssr: {
          exclude: ["dist"],
        },
      },
    },
    server: {
      deps: {
        external: [/dist\/_worker\.js/],
      },
    },
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
