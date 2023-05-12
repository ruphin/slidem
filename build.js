import { readdir, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const r = path => fileURLToPath(new URL(path, import.meta.url));

export async function run(watch = process.argv.includes('start')) {
  const files = await readdir(r('./src/'));
  const LICENSE = await readFile(r('./LICENSE'), 'utf8')
  await build({
    entryPoints: files
      .filter(file => file.endsWith('.js'))
      .map(file => r(`./src/${file}`)),
    outdir: '.',
    banner: { js: `/**\n * @license\n${LICENSE}\n*/`, },
    format: 'esm',
    bundle: true,
    sourcemap: true,
    target: [
      'es2022',
    ],
    loader: {
      '.css': 'js',
      '.html': 'js',
    },
    plugins: [
      {
        name: 'html-template',
        setup(api) {
          api.onResolve({ filter: /\.html$/ }, args => ({
            path: resolve(dirname(args.importer), args.path),
            namespace: 'html-template',
          }));

          api.onLoad({ filter: /\.html$/, namespace: 'html-template' }, async args => ({
            contents: `\
const template = document.createElement('template');
template.innerHTML = \`${await readFile(args.path, 'utf8')}\`;
export default template;`,
            loader: 'ts',
          }));
        }
      },
      {
        name: 'css-constructible',
        setup(api) {
          api.onResolve({ filter: /\.css$/ }, args => ({
            path: resolve(dirname(args.importer), args.path),
            namespace: 'css-constructible',
          }));

          api.onLoad({ filter: /\.css$/, namespace: 'css-constructible' }, async args => ({
            contents: `\
const sheet = new CSSStyleSheet();
sheet.replaceSync(/*css*/\`${await readFile(args.path, 'utf8')}\`);
export default sheet;`,
            loader: 'ts',
          }));
        }
      }
    ]
  }).catch(() => process.exit(1));
}


if (import.meta.url.startsWith('file:')) { // (A)
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) { // (B)
    await run();
  }
}
