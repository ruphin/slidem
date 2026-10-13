/// <reference types="vitest/config" />
import { globSync } from "node:fs";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build + test configuration.
// The dev page has its own config in dev/vite.config.ts.
export default defineConfig({
  build: {
    lib: {
      // One entry for the pure barrel, plus one per registering element module.
      entry: [
        "src/index.ts",
        ...globSync("src/elements/*.ts").filter((f) => !f.endsWith(".test.ts")),
      ],
      formats: ["es"],
    },
    sourcemap: true,
    rollupOptions: {
      // Runtime deps (package.json "dependencies") are not bundled into dist/.
      external: ["@gluon/gluon", "lite-html"],
      output: {
        // Emit one file per source module instead of bundling into chunks.
        // This keeps dist/ mirroring src/, so the "sideEffects" globs in
        // package.json match exactly the modules that call customElements.define().
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [
    dts({
      // Only emit types for the library, not dev/ or tests.
      include: ["src"],
      exclude: ["src/**/*.test.ts"],
      outDirs: "dist/types",
    }),
  ],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
});
