// @ts-check
// Astro integration: after the build, write dist/sw.js with the list of every built file
// (pages, scripts, styles, fonts, icons, deck.json) so the whole site works offline.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP = [/^sw\.js$/, /\.map$/, /(^|\/)\.DS_Store$/];

/**
 * The URL each built file is served at: "chapters/ch01/index.html" → "/chapters/ch01/".
 * @param {string[]} files paths relative to dist, with "/" separators
 * @returns {string[]} sorted URLs
 */
export function precacheUrls(files) {
  return files
    .filter((f) => !SKIP.some((re) => re.test(f)))
    .map((f) => (f === 'index.html' ? '/' : `/${f.replace(/(^|\/)index\.html$/, '$1')}`))
    .sort();
}

/**
 * A short hash of all file names and contents: the same build gives the same version, so
 * redeploying unchanged content does not make every learner download the site again.
 * @param {{ path: string, content: Buffer | string }[]} files
 */
export function cacheVersion(files) {
  const hash = createHash('sha256');
  for (const { path, content } of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(path).update('\0').update(content).update('\0');
  }
  return hash.digest('hex').slice(0, 12);
}

/** @param {string} dir */
function listFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) out.push(join(entry.parentPath, entry.name));
  }
  return out;
}

/** @returns {import('astro').AstroIntegration} */
export default function pwa() {
  return {
    name: 'guj-de-pwa',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = listFiles(root)
          .map((abs) => ({ abs, path: relative(root, abs).split(sep).join('/') }))
          .filter((f) => !SKIP.some((re) => re.test(f.path)));
        const urls = precacheUrls(files.map((f) => f.path));
        const template = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8');
        // the worker's own code counts too, so a fix to it gives learners a fresh cache
        const version = cacheVersion([
          ...files.map((f) => ({ path: f.path, content: readFileSync(f.abs) })),
          { path: 'sw-template.js', content: template },
        ]);
        const sw = template
          .replace('__VERSION__', version)
          .replace('__PRECACHE__', JSON.stringify(urls, null, 2));
        writeFileSync(join(root, 'sw.js'), sw);
        logger.info(`sw.js: ${urls.length} files cached for offline use (version ${version})`);
      },
    },
  };
}
