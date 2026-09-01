#!/usr/bin/env node
/**
 * Genera, desde la misma fuente de verdad, los textos que hay que pegar en otras partes:
 *
 *   exports/linkedin-{es,en}.md   Titular, "Acerca de" y experiencia para LinkedIn
 *   exports/github-profile.md     README del repositorio de perfil gfiguero/gfiguero
 *   exports/cv-{es,en}.txt        CV en texto plano, para formularios y filtros ATS
 *
 * Todo el contenido de exports/ está en .gitignore: son artefactos, no fuente.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { data, t, formatPeriod, projects, roles, paragraphs } from '../lib/data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'exports');
mkdirSync(OUT, { recursive: true });

const p = data.profile;
const wrote = [];
const write = (name, content) => {
  writeFileSync(join(OUT, name), content.trimStart(), 'utf8');
  wrote.push(name);
};

// ── LinkedIn ────────────────────────────────────────────────────────────────
// LinkedIn limita: titular 220 caracteres, "Acerca de" 2600.
for (const locale of ['es', 'en']) {
  const es = locale === 'es';
  const headline = `${t(p.headline, locale)} · ${es ? 'Fundador' : 'Founder'} @ Captalog`;
  const about = [
    t(p.tagline, locale),
    '',
    paragraphs(t(p.summary, locale)).join('\n\n'),
    '',
    es ? 'Especialidades:' : 'Specialties:',
    ...p.specialties.map((s) => `• ${t(s, locale)}`),
  ].join('\n');

  const experience = roles().map((r) => [
    `### ${t(r.role, locale)} — ${t(r.company, locale)}`,
    `${formatPeriod(r, locale)}${r.stack?.length ? ` · ${r.stack.join(', ')}` : ''}`,
    '',
    ...(r.highlights ?? []).map((h) => `• ${t(h, locale)}`),
  ].join('\n')).join('\n\n');

  write(`linkedin-${locale}.md`, `
# LinkedIn — ${locale.toUpperCase()}

## Titular (${headline.length}/220 caracteres)

${headline}

## Acerca de (${about.length}/2600 caracteres)

${about}

## Experiencia

${experience}
`);
}

// ── README del perfil de GitHub ─────────────────────────────────────────────
const featured = projects({ featuredOnly: true });
write('github-profile.md', `
## ${p.name}

${t(p.tagline, 'en')}

${paragraphs(t(p.summary, 'en'))[1] ?? ''}

### What I'm building

${featured.filter((x) => x.status !== 'archived').map((x) => {
  const name = t(x.name, 'en');
  const link = x.url ?? x.repo;
  return `**${link ? `[${name}](${link})` : name}** — ${t(x.summary, 'en')}\n${
    (x.highlights ?? []).map((h) => `\n- ${t(h, 'en')}`).join('')}`;
}).join('\n\n')}

### Stack

${data.skills.groups.filter((g) => g.featured).flatMap((g) => g.items.map((i) => t(i, 'en'))).join(' · ')}

### Open source

${t(data.opensource.intro, 'en')}

${data.opensource.contributions.map((c) => `**[${c.ref}](${c.url})** — ${t(c.summary, 'en')}`).join('\n\n')}

${t(data.opensource.note, 'en')}

### Contact

${p.links.map((l) => `[${l.label}](${l.url})`).join(' · ')} · ${p.email}
`);

// ── CV en texto plano para ATS ──────────────────────────────────────────────
for (const locale of ['es', 'en']) {
  const es = locale === 'es';
  const rule = (title) => `\n\n${title.toUpperCase()}\n${'-'.repeat(title.length)}\n`;
  write(`cv-${locale}.txt`, [
    p.name,
    t(p.headline, locale),
    `${t(p.location, locale)} | ${p.email} | ${p.links.map((l) => l.url).join(' | ')}`,
    rule(es ? 'Perfil profesional' : 'Professional profile'),
    paragraphs(t(p.summary, locale)).join('\n\n'),
    rule(es ? 'Áreas de especialización' : 'Areas of expertise'),
    p.specialties.map((s) => `- ${t(s, locale)}`).join('\n'),
    rule(es ? 'Experiencia profesional' : 'Professional experience'),
    roles().map((r) => [
      `${t(r.role, locale)} | ${t(r.company, locale)}`,
      `${formatPeriod(r, locale)}${r.stack?.length ? ` | ${r.stack.join(', ')}` : ''}`,
      ...(r.highlights ?? []).map((h) => `- ${t(h, locale)}`),
    ].join('\n')).join('\n\n'),
    rule(es ? 'Competencias técnicas' : 'Technical skills'),
    data.skills.groups.map((g) =>
      `${t(g.label, locale)}: ${g.note ? t(g.note, locale) : g.items.map((i) => t(i, locale)).join(', ')}`
    ).join('\n'),
    rule(es ? 'Educación' : 'Education'),
    data.education.degrees.map((d) => [
      t(d.title, locale), t(d.institution, locale),
      ...d.highlights.map((h) => `- ${t(h, locale)}`),
    ].join('\n')).join('\n\n'),
  ].join('\n'));
}

console.log(`✓ ${wrote.length} exports generados en exports/:\n  ${wrote.join('\n  ')}`);
