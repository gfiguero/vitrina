// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Para publicar en un dominio propio: SITE_URL=https://tudominio.cl SITE_BASE=/ npm run build
// Por defecto apunta a GitHub Pages en gfiguero.github.io/vitrina.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://gfiguero.github.io',
  base: process.env.SITE_BASE ?? '/vitrina',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-CL', en: 'en' } },
    }),
  ],
  // `lib/` y `data/` viven fuera de web/: hay que permitir su lectura en dev.
  vite: { server: { fs: { allow: ['..'] } } },
});
