## Desarrollo

```bash
pnpm install
pnpm dev
```

El servidor de docs usa el puerto por defecto de Astro (`4321`).

## Documentación del stack

- [Astro](https://docs.astro.build)
- [Starlight](https://starlight.astro.build)
- [Starlight + Tailwind](https://starlight.astro.build/guides/css-and-tailwind/)

## Contenido

- Páginas: `src/content/docs/**/*.md(x)`
- Sidebar y sitio: `astro.config.mjs`
- Tema (marca Snappli): `src/styles/global.css`

Al añadir una página, actualiza el `sidebar` en `astro.config.mjs` (salvo carpetas con `autogenerate`).
