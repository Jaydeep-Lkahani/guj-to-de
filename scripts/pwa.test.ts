import { describe, expect, it } from 'vitest';
import { cacheVersion, precacheUrls } from './pwa.mjs';

describe('precacheUrls', () => {
  it('turns built files into the URLs they are served at', () => {
    expect(
      precacheUrls([
        'index.html',
        'chapters/ch01/index.html',
        'chapters/ch01/l01/index.html',
        '_astro/react.abc123.js',
        'deck.json',
        'manifest.webmanifest',
      ]),
    ).toEqual([
      '/',
      '/_astro/react.abc123.js',
      '/chapters/ch01/',
      '/chapters/ch01/l01/',
      '/deck.json',
      '/manifest.webmanifest',
    ]);
  });

  it('leaves out the service worker itself, source maps and .DS_Store', () => {
    expect(precacheUrls(['sw.js', 'a.js.map', '.DS_Store', 'icons/.DS_Store', 'a.js'])).toEqual([
      '/a.js',
    ]);
  });
});

describe('cacheVersion', () => {
  const files = [
    { path: 'index.html', content: '<html>' },
    { path: 'deck.json', content: '[]' },
  ];

  it('is the same for the same files, in any order', () => {
    expect(cacheVersion(files)).toBe(cacheVersion([...files].reverse()));
    expect(cacheVersion(files)).toMatch(/^[0-9a-f]{12}$/);
  });

  it('changes when any content changes', () => {
    const changed = [files[0]!, { path: 'deck.json', content: '[1]' }];
    expect(cacheVersion(changed)).not.toBe(cacheVersion(files));
  });
});
