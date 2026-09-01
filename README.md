# vitrina

Fuente de verdad única de mi perfil profesional. La trayectoria vive una sola vez, en
`data/*.yaml`, y de ahí salen el CV en PDF, el sitio web, el portfolio, el README de mi perfil
de GitHub y los textos de LinkedIn.

El problema que resuelve: mantener cinco versiones del mismo currículum y que ninguna coincida.
Aquí se edita el YAML y todo lo demás se regenera.

**Sitio:** https://gfiguero.github.io/vitrina

## Cómo está organizado

```
data/                fuente de verdad, bilingüe ES/EN
  profile.yaml         identidad, resumen, áreas de especialización
  experience.yaml      cargos, con highlights y tags
  projects.yaml        portfolio
  skills.yaml          competencias técnicas
  education.yaml       formación, liderazgo
  opensource.yaml      contribuciones
lib/data.mjs         cargador compartido: resuelve campos { es, en }, fechas y orden
cv/                  plantilla y hoja de estilo del CV (misma salida para web y PDF)
web/                 sitio Astro estático (ES en la raíz, EN bajo /en)
scripts/             validador, generador de PDF y generador de exports
private/             datos de contacto que NO se versionan (teléfono, dirección)
exports/             artefactos generados: LinkedIn, README de perfil, CV en texto plano
```

Nada se escribe dos veces. La plantilla del CV (`cv/template.mjs`) genera el mismo HTML para la
página `/cv` del sitio y para el PDF, así que ambos no pueden divergir.

## Uso

```bash
npm install

npm run dev        # sitio en local con recarga en caliente
npm run check      # valida que no falte ninguna traducción ni campo obligatorio
npm run cv         # genera cv/output/*.pdf (ES y EN) con Chrome headless
npm run exports    # genera exports/ para LinkedIn, GitHub y formularios ATS
npm run build      # sitio estático en web/dist
npm run all        # todo lo anterior, en orden
```

### Datos privados

El teléfono y la dirección no van al repositorio ni al sitio. Para incluirlos en un PDF
destinado a una postulación concreta:

```bash
cp private/contact.example.yaml private/contact.yaml   # completar
npm run cv -- --private
```

El PDF resultante queda sólo en `cv/output/` y no se copia al sitio.

### CV recortado para una postulación

```bash
npm run cv -- --locale es --sections profile,experience,skills
```

Secciones disponibles: `profile`, `specialties`, `experience`, `skills`, `opensource`,
`education`.

## Publicación

Cada push a `main` dispara `.github/workflows/deploy.yml`: valida los datos, genera los PDF,
construye el sitio y lo publica en GitHub Pages. Si la validación falla, no se publica nada.

Para usar un dominio propio: agrega el `CNAME` en `web/public/`, y construye con
`SITE_URL=https://tudominio.cl SITE_BASE=/ npm run build`.

## Al día

- [ ] Rellenar `projects.yaml` con métricas concretas (usuarios, volumen, tiempos)
- [ ] Foto y Open Graph propio para compartir en redes
- [ ] Sección de escritura o notas técnicas
- [ ] Dominio propio
