// Cargador único de la fuente de verdad. Lo usan el sitio, el generador de CV y los exports.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';

// Astro empaqueta este módulo dentro de web/dist/.prerender/, así que la raíz del
// proyecto no está siempre a un nivel de distancia: se busca hacia arriba.
function findRoot(from) {
  let dir = from;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'data/profile.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`No se encontró la raíz del proyecto (data/profile.yaml) desde ${from}`);
}

export const ROOT = findRoot(dirname(fileURLToPath(import.meta.url)));

const read = (file) => parse(readFileSync(join(ROOT, file), 'utf8'));

export const LOCALES = ['es', 'en'];
export const DEFAULT_LOCALE = 'es';

/**
 * Resuelve un campo bilingüe. Acepta un string plano (mismo texto en ambos idiomas),
 * un objeto { es, en }, o un array de cualquiera de los dos.
 */
export function t(value, locale = DEFAULT_LOCALE) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map((v) => t(v, locale));
  if (typeof value === 'object') return value[locale] ?? value[DEFAULT_LOCALE] ?? '';
  return value;
}

export const data = {
  profile: read('data/profile.yaml'),
  experience: read('data/experience.yaml'),
  projects: read('data/projects.yaml'),
  skills: read('data/skills.yaml'),
  education: read('data/education.yaml'),
  opensource: read('data/opensource.yaml'),
};

/** Datos de contacto privados: sólo existen en local, nunca en el repositorio. */
export function privateContact() {
  const file = join(ROOT, 'private/contact.yaml');
  return existsSync(file) ? parse(readFileSync(file, 'utf8')) : null;
}

const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
       'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
       'September', 'October', 'November', 'December'],
};

/** `2024-12` -> "Diciembre 2024" / "December 2024". `2013` -> "2013". */
export function formatDate(value, locale = DEFAULT_LOCALE) {
  if (value == null) return locale === 'es' ? 'Presente' : 'Present';
  const raw = value instanceof Date ? value.toISOString().slice(0, 7) : String(value);
  const [year, month] = raw.split('-');
  if (!month) return year;
  const name = MONTHS[locale][Number(month) - 1];
  return locale === 'es' ? `${name[0].toUpperCase()}${name.slice(1)} ${year}` : `${name} ${year}`;
}

export function formatPeriod(role, locale = DEFAULT_LOCALE) {
  const start = formatDate(role.start, locale);
  const end = role.current || role.end == null
    ? (locale === 'es' ? 'Presente' : 'Present')
    : formatDate(role.end, locale);
  return `${start} – ${end}`;
}

/** Proyectos ordenados por peso, opcionalmente sólo los destacados. */
export function projects({ featuredOnly = false } = {}) {
  return data.projects.projects
    .filter((p) => (featuredOnly ? p.featured : true))
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

export const roles = () => data.experience.roles;

/** Divide un texto multilínea en párrafos, tolerando escalares YAML plegados o literales. */
export function paragraphs(text) {
  return String(text).split(/\n+/).map((s) => s.trim()).filter(Boolean);
}
