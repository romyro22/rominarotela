import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.ts"],
      exclude: ["src/types/**", "src/env.d.ts", "src/i18n/**"],
      thresholds: {
        statements: 75,
        branches: 60,
        functions: 80,
        lines: 75,
      },
    },
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
        wrangler: { configPath: "./wrangler.test.jsonc" },
      },
    },
  },
});
