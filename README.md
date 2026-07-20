# Snappli Docs

Documentación pública de [Snappli](https://www.snappli.io), publicada en [docs.snappli.io](https://docs.snappli.io).

Stack: **Astro 7** + **Starlight** + **Tailwind CSS 4**, desplegable en Vercel.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:4321](http://localhost:4321).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build estático en `dist/` |
| `pnpm preview` | Previsualiza el build |

## Contenido

Las páginas viven en `src/content/docs/` (Markdown / MDX). La navegación (sidebar) se configura en `astro.config.mjs`.

Estructura de secciones:

| Carpeta | Sección |
|---------|---------|
| `guia/` | Empezar (introducción, primeros pasos, conceptos) |
| `producto/` | Producto (inbox, contactos, pipeline, agentes IA, KB, campañas, equipos, informes) |
| `canales/` | Canales (WhatsApp, Instagram/Messenger, email, widget) |
| `cuenta/` | Cuenta y organización (miembros/roles, organización, mi cuenta, facturación) |
| `desarrolladores/` | API (introducción, autenticación, contactos, webhooks, widget) |
| `referencia/` | Glosario, FAQ, novedades (autogenerado por orden) |

Al añadir una página, actualiza el `sidebar` en `astro.config.mjs` (salvo `referencia/`, que es autogenerado y ordena por `sidebar.order`).

## Despliegue (Vercel)

1. Importa este repo en Vercel (framework: Astro).
2. Añade el dominio `docs.snappli.io`.
3. En Cloudflare DNS: `CNAME` `docs` → `cname.vercel-dns.com`.
4. En el frontend de Snappli (producción): `NEXT_PUBLIC_DOCS_URL=https://docs.snappli.io`.

## Branding

Colores de acento alineados con el producto (`#ec4899` / pink). Estilos en `src/styles/global.css`.
