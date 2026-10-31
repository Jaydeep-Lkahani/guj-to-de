import { t } from '../lib/t';

/** Web app manifest: lets the learner install the site on a phone (pending.md Step 9). */
export function GET() {
  const manifest = {
    name: `${t('app.title')} – ${t('app.tagline')}`,
    short_name: t('app.title'),
    description: t('app.tagline'),
    lang: 'gu',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#faf8f4', // --bg (light)
    theme_color: '#4c3fd1', // --brand
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
