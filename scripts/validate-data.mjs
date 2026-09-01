#!/usr/bin/env node
/**
 * Comprueba que la fuente de verdad esté completa y sea coherente antes de publicar.
 * Falla la build si falta una traducción o un campo obligatorio.
 */
import { data, LOCALES } from '../lib/data.mjs';

const errors = [];
const warnings = [];

/** Un campo bilingüe debe traer ambos idiomas (o ser un string plano deliberado). */
const bilingual = (value, where) => {
  if (value == null) return errors.push(`${where}: falta`);
  if (typeof value === 'string') return;
  for (const l of LOCALES) {
    if (!value[l] || String(value[l]).trim() === '') errors.push(`${where}: falta traducción "${l}"`);
  }
};

const p = data.profile;
for (const field of ['name', 'email', 'handle']) {
  if (!p[field]) errors.push(`profile.${field}: falta`);
}
bilingual(p.headline, 'profile.headline');
bilingual(p.tagline, 'profile.tagline');
bilingual(p.location, 'profile.location');
bilingual(p.summary, 'profile.summary');
p.specialties.forEach((s, i) => bilingual(s, `profile.specialties[${i}]`));
p.links.forEach((l, i) => {
  if (!/^https?:\/\//.test(l.url ?? '')) errors.push(`profile.links[${i}].url: no es una URL absoluta`);
});

data.experience.roles.forEach((r, i) => {
  const where = `experience.roles[${i}] (${r.company?.es ?? r.company})`;
  bilingual(r.role, `${where}.role`);
  if (!r.start) errors.push(`${where}.start: falta`);
  if (r.end == null && !r.current) warnings.push(`${where}: sin fecha de término ni current:true`);
  if (!r.highlights?.length) warnings.push(`${where}: sin highlights`);
  r.highlights?.forEach((h, j) => bilingual(h, `${where}.highlights[${j}]`));
});

data.projects.projects.forEach((pr, i) => {
  const where = `projects[${i}] (${pr.id})`;
  if (!pr.id) errors.push(`${where}.id: falta`);
  if (!['live', 'wip', 'archived'].includes(pr.status)) errors.push(`${where}.status: debe ser live | wip | archived`);
  bilingual(pr.summary, `${where}.summary`);
  bilingual(pr.role, `${where}.role`);
});

data.skills.groups.forEach((g, i) => {
  bilingual(g.label, `skills.groups[${i}].label`);
  if (!g.items?.length) errors.push(`skills.groups[${i}] (${g.id}): sin items`);
});

data.education.degrees.forEach((d, i) => {
  bilingual(d.title, `education.degrees[${i}].title`);
  bilingual(d.institution, `education.degrees[${i}].institution`);
});

data.opensource.contributions.forEach((c, i) => {
  if (!/^https?:\/\//.test(c.url ?? '')) errors.push(`opensource[${i}].url: no es una URL absoluta`);
  bilingual(c.summary, `opensource[${i}].summary`);
});

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗  ${e}`);
  console.error(`\n${errors.length} error(es) en data/.`);
  process.exit(1);
}
console.log(`✓ Datos válidos: ${data.experience.roles.length} cargos, ${data.projects.projects.length} proyectos, ${data.skills.groups.length} grupos de competencias.`);
