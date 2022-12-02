import { readdir, readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { importAssertPlugin } from 'esbuild-plugin-import-assertions';

const r = path => fileURLToPath(new URL(path, import.meta.url));

export async function run(watch = process.argv.includes('start')) {
  const LICENSE = await readFile(r('./LICENSE'), 'utf8')
  for (const file of await readdir(r('./src/'))) {
    if (file.endsWith('.js')) {
      await build({
        entryPoints: [r(`./src/${file}`)],
        outdir: '.',
        banner: { js: `/**\n * @license\n${LICENSE}\n*/`, },
        format: 'esm',
        sourcemap: true,
        bundle: true,
        watch,
        loader: {
          '.css': 'js',
          '.html': 'js',
        },
        plugins: [
          importAssertPlugin,
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
          }
        ]
      })
    }
  }
}


if (import.meta.url.startsWith('file:')) { // (A)
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) { // (B)
    await run();
  }
}
