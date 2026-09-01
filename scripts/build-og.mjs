#!/usr/bin/env node
/**
 * Genera web/public/og.png (1200×630), la imagen que muestran LinkedIn, WhatsApp,
 * Slack y X al compartir el enlace. Se construye desde data/, con el mismo Chrome
 * headless que el CV: si cambia el titular o la frase, la imagen se regenera.
 */
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, data, t } from '../lib/data.mjs';

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

const p = data.profile;
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center;
    box-sizing: border-box; padding: 84px 92px; background: #14151a; color: #e9e6e1;
    font-family: -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
  }
  .eyebrow {
    font-size: 21px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
    color: #d99a6c; margin: 0 0 26px;
  }
  h1 {
    font-family: "Iowan Old Style", Palatino, Georgia, serif;
    font-size: 96px; line-height: 1; margin: 0 0 30px; letter-spacing: -.02em; font-weight: 600;
  }
  p.tagline { font-size: 33px; line-height: 1.42; margin: 0; color: #a9a49c; max-width: 940px; }
  .rule { height: 4px; width: 96px; background: #d99a6c; margin: 40px 0 0; border-radius: 2px; }
  .foot {
    position: absolute; bottom: 66px; left: 92px; right: 92px;
    display: flex; justify-content: space-between; font-size: 23px; color: #7d7972;
  }
</style></head><body>
  <p class="eyebrow">${t(p.headline, 'es')}</p>
  <h1>${p.name}</h1>
  <p class="tagline">${t(p.tagline, 'es')}</p>
  <div class="rule"></div>
  <div class="foot"><span>${t(p.location, 'es')}</span><span>github.com/${p.handle}</span></div>
</body></html>`;

const tmp = join(ROOT, 'cv/output/og.html');
const out = join(ROOT, 'web/public/og.png');
mkdirSync(join(ROOT, 'cv/output'), { recursive: true });
writeFileSync(tmp, html, 'utf8');

execFileSync(chrome, [
  '--headless', '--disable-gpu', '--no-sandbox',
  '--hide-scrollbars', '--default-background-color=00000000',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  `--screenshot=${out}`,
  pathToFileURL(tmp).href,
], { stdio: ['ignore', 'ignore', 'pipe'] });

rmSync(tmp, { force: true });
console.log('✓ web/public/og.png (1200×630)');
