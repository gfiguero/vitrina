// @ts-check
import { defineConfig } from 'astro/config';

// Para publicar en un dominio propio: cambia `site` y define SITE_BASE=/ al construir.
// Por defecto apunta a GitHub Pages en gfiguero.github.io/vitrina.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://gfiguero.github.io',
  base: process.env.SITE_BASE ?? '/vitrina',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // `lib/` y `data/` viven fuera de web/: hay que permitir su lectura en dev.
  vite: { server: { fs: { allow: ['..'] } } },
});
