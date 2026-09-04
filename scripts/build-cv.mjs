#!/usr/bin/env node
/**
 * Genera el CV en PDF desde data/*.yaml usando Chrome headless.
 * No requiere dependencias: reutiliza el Chrome ya instalado en el sistema.
 *
 *   npm run cv                      # ES y EN, sin datos privados
 *   npm run cv -- --private         # incluye teléfono desde private/contact.yaml
 *   npm run cv -- --locale en       # sólo un idioma
 *   npm run cv -- --sections profile,experience,skills
 *   npm run cv -- --variant corporate   # otro posicionamiento, mismo recorrido
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderCvDocument } from '../cv/template.mjs';
import { privateContact, VARIANTS } from '../lib/data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'cv/output');
const PUBLIC = join(ROOT, 'web/public/cv');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : (argv[i + 1] ?? true);
};

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error('No se encontró Chrome ni Chromium. Define CHROME_PATH con la ruta al binario.');
  process.exit(1);
}

const locales = flag('locale') && flag('locale') !== true ? [flag('locale')] : ['es', 'en'];
const sections = flag('sections') && flag('sections') !== true
  ? String(flag('sections')).split(',').map((s) => s.trim())
  : undefined;

const variant = flag('variant') && flag('variant') !== true ? String(flag('variant')) : null;
if (variant && !VARIANTS.includes(variant)) {
  console.error(`Variante desconocida: "${variant}". Disponibles: ${VARIANTS.join(', ') || 'ninguna'}`);
  process.exit(1);
}

const contact = argv.includes('--private') ? privateContact() : null;
if (argv.includes('--private') && !contact) {
  console.warn('Aviso: --private pedido pero no existe private/contact.yaml. Se omiten datos privados.');
}

mkdirSync(OUT, { recursive: true });
mkdirSync(PUBLIC, { recursive: true });

for (const locale of locales) {
  const slug = `cv-garri-figueroa-${locale}${variant ? `-${variant}` : ''}`;
  const html = join(OUT, `${slug}.html`);
  const pdf = join(OUT, `${slug}.pdf`);

  writeFileSync(html, renderCvDocument({ locale, contact, sections, variant }), 'utf8');

  execFileSync(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=4000',
    `--print-to-pdf=${pdf}`,
    pathToFileURL(html).href,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  // El sitio sirve el PDF desde web/public/cv/ (sólo la versión sin datos privados).
  if (!contact && !variant) copyFileSync(pdf, join(PUBLIC, `${slug}.pdf`));

  const aparte = contact ? ' (con datos privados, no se copia al sitio)'
    : variant ? ' (variante, no se copia al sitio)' : '';
  console.log(`✓ ${slug}.pdf${aparte}`);
}
