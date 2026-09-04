# vitrina — convenciones del proyecto

Este repositorio existe para que la trayectoria profesional se escriba **una sola vez**.

## Regla central

Todo el contenido vive en `data/*.yaml`. Nunca escribas texto de perfil, experiencia o
proyectos directamente en un componente de Astro, en la plantilla del CV o en un script:
si un dato hace falta, se agrega al YAML y se consume con `t()` desde `lib/data.mjs`.

## Bilingüismo

Cada campo de texto visible es `{ es, en }`. `pnpm run check` falla si falta una traducción, así
que no se puede publicar contenido a medio traducir. Un string plano equivale a "igual en ambos
idiomas" y sólo debe usarse para nombres propios y tecnologías.

En YAML, usa `>` (plegado) para párrafos y `>-` para textos de una sola línea larga. No uses `|`
salvo que quieras conservar los saltos de línea literales: `paragraphs()` en `lib/data.mjs`
normaliza ambos casos.

Cuidado con los dos puntos: cualquier valor que contenga `: ` debe ir entre comillas o en un
escalar de bloque, o el YAML no parsea.

## CV

`cv/template.mjs` es el único renderizador. Produce el cuerpo HTML que consumen tanto la página
`/cv` del sitio como el PDF. Si cambias la estructura del CV, cambia ahí y ambos salen iguales.
El PDF se genera con el Chrome del sistema (`scripts/build-cv.mjs`), sin dependencias.

## Rutas

`lib/data.mjs` resuelve la raíz del proyecto buscando `data/profile.yaml` hacia arriba, porque
Astro empaqueta el módulo dentro de `web/dist/.prerender/`. No vuelvas a usar rutas relativas a
`import.meta.url` para leer archivos del repositorio: usa `ROOT`.

## Datos privados

Teléfono, dirección y cualquier identificador personal van sólo en `private/contact.yaml`, que
está en `.gitignore`. El repositorio es público.

## Antes de dar algo por terminado

```bash
pnpm run all
```
