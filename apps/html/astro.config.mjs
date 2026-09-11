import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Served from a subpath on GitHub Pages, from the root in dev and when a
// consumer drops dist/ into their own app. BASE_PATH is set by CI only.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
