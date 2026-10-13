import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Config for the local dev page (`npm run dev` runs `vite serve dev`;
// `dev` alone would be the CLI alias for `serve`, not the folder).
// The dev page imports the library by its package name; these aliases point
// that name at the TypeScript source so edits hot-reload without a build.
const src = (path: string) =>
  fileURLToPath(new URL(`../src/${path}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^slidem\/elements\/(.+)$/,
        replacement: `${src("elements")}/$1.ts`,
      },
      { find: /^slidem$/, replacement: src("index.ts") },
    ],
  },
  server: {
    port: 5000,
    open: true,
  },
});
