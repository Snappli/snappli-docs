# Capturas del producto

Regenera las capturas de `src/assets/capturas/` con una organización demo ("Tienda Aurora") en una base **local**, sin tocar datos reales.

1. Base local: `createdb snappli_docs_demo`, luego desde `snappli-backend`, con `DATABASE_URL=postgresql://<usuario>@localhost:5432/snappli_docs_demo`:
   `npx prisma db push` (si tu Postgres no tiene pgvector, usa una copia del esquema sin la columna `embedding`) y `npx ts-node prisma/seed.ts`.
2. Backend demo en `:3001` con esa `DATABASE_URL`, `REDIS_URL=redis://localhost:6379/9`, `FRONTEND_URL=http://localhost:3010`, `RESEND_API_KEY=` y proveedores en `stub` (`BILLING_PROVIDER`, `WHATSAPP_PROVIDER`, `SMS_PROVIDER`, `TELEPHONY_PROVIDER`), `CHECKOUT_SIMULATED=true`, `VOICE_AI_ENABLED=false`.
3. Registra `laura@demo.snappli.io` (OTP en la respuesta, `devCode`), crea la organización "Tienda Aurora", activa el plan Business, crea los equipos Ventas y Soporte, aplica la plantilla de pipeline `ecommerce` y completa el onboarding.
4. `DATABASE_URL=… node scripts/capturas/demo-data.js` — equipo, canales, contactos y conversaciones. Solo corre contra `snappli_docs_demo`.
5. Frontend en `:3010` con `NEXT_PUBLIC_API_URL=http://localhost:3001/api` y `AUTH_URL=http://localhost:3010`.
6. `node scripts/capturas/shoot.mjs <carpeta> "/manage/inbox?c=<id>::inbox-conversacion" …` (requiere `puppeteer-core` y Google Chrome).

Recorta y redimensiona con `sharp` antes de copiar a `src/assets/capturas/` (1600 px de ancho; 900 px para paneles laterales).
