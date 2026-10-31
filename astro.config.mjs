// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import pwa from './scripts/pwa.mjs';

export default defineConfig({
  integrations: [react(), pwa()],
  vite: {
    plugins: [tailwindcss()],
  },
});
