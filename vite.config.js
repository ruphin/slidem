import { readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
const src = resolve(root, 'src');
const LICENSE = readFileSync(resolve(root, 'LICENSE'), 'utf8');

// Every src/*.js file is a separately importable entry point (slidem-deck.js, slidem-slide.js, ...)
const entries = Object.fromEntries(
  readdirSync(src)
    .filter(file => file.endsWith('.js'))
    .map(file => [file.replace(/\.js$/, ''), resolve(src, file)]),
);

const PREFIX = '\0slidem-asset:';

/**
 * Imports of .css files from src/ become constructible stylesheets (CSSStyleSheet),
 * imports of .html files become <template> elements.
 */
function slidemAssets() {
  return {
    name: 'slidem-assets',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || importer.startsWith(PREFIX) || !/\.(css|html)$/.test(source)) return null;
      const path = resolve(dirname(importer), source);
      if (!path.startsWith(src)) return null;
      // The .js suffix keeps Vite's own CSS/HTML handling away from these modules
      return PREFIX + relative(root, path) + '.js';
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const path = resolve(root, id.slice(PREFIX.length, -'.js'.length));
      this.addWatchFile(path);
      const contents = JSON.stringify(readFileSync(path, 'utf8'));
      if (path.endsWith('.css')) {
        return `const sheet = new CSSStyleSheet();\nsheet.replaceSync(${contents});\nexport default sheet;\n`;
      }
      return `const template = document.createElement('template');\ntemplate.innerHTML = ${contents};\nexport default template;\n`;
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  publicDir: false,
  plugins: [slidemAssets()],
  resolve: {
    // During development, serve the components from source instead of the built files
    alias: command === 'serve' && !isPreview
      ? [{ find: /^\.\/(slidem-[\w-]+\.js)$/, replacement: `${src}/$1` }]
      : [],
  },
  build: {
    // The built files live next to package.json (slidem-deck.js, slidem-slide.js, ...),
    // which is where the package "main"/"files" fields and the demo page expect them.
    outDir: '.',
    emptyOutDir: false,
    copyPublicDir: false,
    sourcemap: true,
    minify: false,
    target: 'es2022',
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'slidem-chunk-[hash].js',
        banner: `/**\n * @license\n${LICENSE}\n*/`,
      },
    },
  },
}));
