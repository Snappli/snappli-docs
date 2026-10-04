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
- Precios y límites de planes: `src/data/pricing.ts` (fuente única; refleja `snappli-backend/prisma/seed.ts` y `src/modules/billing/plan-limits.util.ts`). En las páginas usa `<PlanTable>` o los helpers de ese archivo, nunca cifras escritas a mano.

Al añadir una página, actualiza el `sidebar` en `astro.config.mjs` (salvo carpetas con `autogenerate`).
