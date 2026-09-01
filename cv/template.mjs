// Renderizador único del CV: produce el mismo HTML para la web y para el PDF.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, data, t, formatPeriod, roles, paragraphs } from '../lib/data.mjs';

export const cvStyles = () => readFileSync(join(ROOT, 'cv/style.css'), 'utf8');

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const li = (items, locale) => items.map((i) => `<li>${esc(t(i, locale))}</li>`).join('');

const L = {
  es: {
    profile: 'Perfil profesional', specialties: 'Áreas de especialización',
    experience: 'Experiencia profesional', skills: 'Competencias técnicas',
    education: 'Educación', projects: 'Proyectos destacados',
    opensource: 'Open source', note: 'Nota',
  },
  en: {
    profile: 'Professional profile', specialties: 'Areas of expertise',
    experience: 'Professional experience', skills: 'Technical skills',
    education: 'Education', projects: 'Selected projects',
    opensource: 'Open source', note: 'Note',
  },
};

/**
 * Devuelve el <div class="cv"> completo.
 * @param {{ locale?: 'es'|'en', contact?: object|null, sections?: string[] }} opts
 */
export function renderCvBody({ locale = 'es', contact = null, sections } = {}) {
  const p = data.profile;
  const l = L[locale];
  const want = (id) => !sections || sections.includes(id);

  const contactLine = [
    t(p.location, locale),
    contact?.phone,
    p.email,
    p.links.find((x) => x.id === 'linkedin')?.url.replace(/^https?:\/\//, ''),
    p.links.find((x) => x.id === 'github')?.url.replace(/^https?:\/\//, ''),
  ].filter(Boolean).join(' · ');

  const out = [];

  out.push(`<header class="cv-head">
    <h1>${esc(p.name)}</h1>
    <p class="cv-role">${esc(t(p.headline, locale))}</p>
    <p class="cv-contact">${esc(contactLine)}</p>
  </header>`);

  if (want('profile')) {
    const paras = paragraphs(t(p.summary, locale))
      .map((par) => `<p>${esc(par)}</p>`).join('');
    out.push(`<section class="cv-section"><h2>${l.profile}</h2>${paras}</section>`);
  }

  if (want('specialties')) {
    out.push(`<section class="cv-section"><h2>${l.specialties}</h2>
      <ul>${li(p.specialties, locale)}</ul></section>`);
  }

  if (want('experience')) {
    const jobs = roles().map((r) => `
      <article class="cv-job">
        <div class="cv-job-head">
          <h3>${esc(t(r.role, locale))} · ${esc(t(r.company, locale))}</h3>
          <span class="cv-when">${esc(formatPeriod(r, locale))}</span>
        </div>
        ${r.stack?.length ? `<p class="cv-stack">${esc(r.stack.join(' · '))}</p>` : ''}
        ${r.highlights?.length ? `<ul>${li(r.highlights, locale)}</ul>` : ''}
      </article>`).join('');
    out.push(`<section class="cv-section"><h2>${l.experience}</h2>
      <p class="cv-note">${esc(t(data.experience.note, locale))}</p>${jobs}</section>`);
  }

  if (want('skills')) {
    const rows = data.skills.groups.map((g) => {
      const body = g.note ? t(g.note, locale)
        : g.items.map((i) => t(i, locale)).join(', ');
      return `<p class="cv-skill"><b>${esc(t(g.label, locale))}:</b> ${esc(body)}</p>`;
    }).join('');
    out.push(`<section class="cv-section"><h2>${l.skills}</h2>${rows}</section>`);
  }

  if (want('opensource')) {
    const items = data.opensource.contributions.map((c) =>
      `<li><b>${esc(c.ref)}</b> — ${esc(t(c.summary, locale))}</li>`).join('');
    out.push(`<section class="cv-section"><h2>${l.opensource}</h2><ul>${items}</ul></section>`);
  }

  if (want('education')) {
    const degrees = data.education.degrees.map((d) => `
      <article class="cv-job">
        <h3>${esc(t(d.title, locale))}</h3>
        <p class="cv-stack">${esc(t(d.institution, locale))}</p>
        <ul>${li(d.highlights, locale)}</ul>
      </article>`).join('');
    const lead = `<article class="cv-job"><h3>${esc(t(data.education.leadership.label, locale))}</h3>
      <ul>${li(data.education.leadership.items, locale)}</ul></article>`;
    out.push(`<section class="cv-section"><h2>${l.education}</h2>${degrees}${lead}</section>`);
  }

  return `<div class="cv">${out.join('\n')}</div>`;
}

/** Documento HTML autónomo (CSS embebido) para imprimir a PDF. */
export function renderCvDocument(opts = {}) {
  const locale = opts.locale ?? 'es';
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<title>${data.profile.name} — CV</title>
<style>
html,body{margin:0;padding:0;background:#fff;}
body{padding:1.5rem;}
@media print{body{padding:0;}}
${cvStyles()}
</style>
</head>
<body>${renderCvBody(opts)}</body>
</html>`;
}
