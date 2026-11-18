---
title: Webhooks
description: Recibe eventos de Snappli en tu servidor con firma HMAC.
---

Los **webhooks** envían un `POST` JSON a tu URL cuando ocurren eventos (pipeline, contactos, conversaciones). Se configuran en **Configuración → Webhooks**.

:::note[Disponibilidad]
Los webhooks forman parte de **API y webhooks**, incluido en el plan **Pro** o superior de Snappli completo (Pro, Business o Enterprise). No están disponibles en Snappli para WhatsApp.
:::

## Configuración

Puedes crear **varios webhooks** por organización (por ejemplo, uno para tu CRM y otro para tu backend). Para cada uno:

1. En **Configuración → Webhooks**, crea un **nuevo webhook** con un nombre.
2. Indica la **URL** de destino.
3. (Recomendado) define un **secret** para verificar firmas HMAC.
4. (Opcional) añade una **cabecera de autenticación** (p. ej. `Authorization: Bearer …`) si tu endpoint la exige; se envía en cada entrega.
5. Elige los **eventos suscritos**.
6. (Opcional) filtra por **etapa** del pipeline (eventos de etapa) o por **etiqueta** (`contact.tag.assigned`). Si lo dejas vacío, recibes todas.
7. (Opcional) en **Documentos y respuesta**: la validez de los enlaces de los documentos, **No enviar si el contacto ya tiene…** y qué [guardar de la respuesta](#leer-la-respuesta) de tu sistema.

La página también incluye el historial de entregas y las aprobaciones pendientes. Para guías paso a paso (webhook.site, tu propio backend, n8n, Google Sheets, HubSpot, Zapier) consulta las [recetas de webhooks](/desarrolladores/webhooks-recetas/).

## Eventos

| Evento | Cuándo se dispara |
|--------|-------------------|
| `contact.stage.entered` | Un contacto entra a una etapa del pipeline |
| `contact.webhook.manual` | Envío manual o de prueba |
| `contact.created` | Se crea un contacto |
| `contact.updated` | Se actualiza un contacto |
| `contact.tag.assigned` | Se asigna una etiqueta a un contacto |
| `conversation.escalated` | Una conversación se escala a un humano |

Por defecto se suscriben `contact.stage.entered` y `contact.webhook.manual`.

## Cabeceras

| Cabecera | Descripción |
|----------|-------------|
| `Content-Type` | `application/json` |
| `User-Agent` | `Snappli-Webhook/1.0` |
| `X-Snappli-Timestamp` | Epoch en segundos (si hay secret) |
| `X-Snappli-Signature` | HMAC SHA-256 en hex (si hay secret) |
| `Idempotency-Key` | Id de la entrega; **igual en todos los reintentos** |
| `X-Snappli-Delivery-Id` | Id de la entrega (el mismo que `trigger.deliveryId`) |

:::caution[Ignora las entregas repetidas]
Un reintento llega con la misma `Idempotency-Key`. Si tu sistema crea algo (un pedido, una inscripción, un cliente), guarda la clave y no lo crees dos veces.
:::

## Forma del payload

Todos los eventos comparten una base:

```json
{
  "organizationId": "org_...",
  "sentAt": "2026-07-16T18:00:00.000Z",
  "trigger": {
    "source": "AI",
    "userId": null,
    "deliveryId": "dlv_..."
  },
  "contact": {
    "id": "ckv...",
    "firstName": "Ana",
    "lastName": "Pérez",
    "displayName": "Ana Pérez",
    "email": "ana@example.com",
    "phone": "+593999999999",
    "language": "es",
    "countryCode": "EC",
    "tags": ["vip"],
    "customFields": {},
    "documents": {}
  }
}
```

`trigger.source` puede ser `AI`, `AGENT`, `MANUAL`, `BULK`, `TEST` (el botón **Enviar prueba**) o `SYSTEM`.

Campos adicionales según el evento:

| Evento | Añade |
|--------|-------|
| `contact.stage.entered`, `contact.webhook.manual` | `pipeline` (`stageId`, `stageName`, `previousStageId`, `previousStageName`) y `conversation` (`id`, `channel`, `lastMessageAt`) |
| `contact.tag.assigned` | `tag` (`id`, `name`, `source`) |
| `conversation.escalated` | `conversation`, `reason`, `summary`, `departmentId` y `departmentName` (el área a la que se pasó, o `null`) |

### Documentos del contacto

`contact.documents` trae los [campos de tipo Archivo](/producto/contactos/#documentos-del-contacto) del contacto, por su clave. Estos campos no se repiten en `customFields`.

```json
"documents": {
  "doc_cedula": {
    "label": "Cédula de identidad",
    "status": "APPROVED",
    "storageKey": "orgs/org_.../contacts/ckv.../doc_cedula_....jpg",
    "mimeType": "image/jpeg",
    "size": 284512,
    "fileName": "cedula.jpg",
    "url": "https://api.snappli.io/api/webhook-files/…",
    "urlExpiresAt": "2026-11-20T18:00:00.000Z"
  }
}
```

- `status` es `PENDING` (por revisar), `APPROVED` o `REJECTED`.
- `url` es un enlace temporal para descargar el archivo, sin cabeceras de autenticación. Se genera de nuevo **en cada intento**, así que un reintento tardío no llega con enlaces caducados. Por defecto vale **72 horas** (configurable hasta 168). Descarga el archivo si lo necesitas guardar.
- `fileName` puede venir en `null` (por ejemplo, una foto de WhatsApp).

En `conversation.escalated`, `reason` es el motivo del traspaso que indicó la IA, la intención detectada si no hay motivo, o `idle_timeout` si escaló por inactividad. `summary` es el resumen que la IA escribió para el agente humano; puede venir en `null` o no venir.

## Verificación HMAC

La firma es el HMAC SHA-256 de `timestamp.body` usando tu secret:

```js
import crypto from 'node:crypto';

function verify(secret, timestamp, rawBody, signature) {
  if (!timestamp || !signature) return false;

  // Rechaza entregas con más de 5 minutos de antigüedad (evita replays).
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const expected = Buffer.from(
    crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex'),
  );
  const received = Buffer.from(signature);

  // timingSafeEqual lanza un error si las longitudes difieren.
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(expected, received);
}
```

:::caution
Usa el **cuerpo crudo** (raw body) tal cual lo recibes, antes de parsear el JSON. Reparsear y volver a serializar puede cambiar bytes y romper la verificación.
:::

### Con el SDK

En Node 20 o superior, `@snappli/sdk` verifica la firma y la hora en tiempo constante y te devuelve el evento con sus tipos:

```js
import express from 'express';
import { verifyWebhook, SnappliWebhookError } from '@snappli/sdk';

// express.raw: el cuerpo llega sin parsear.
app.post('/webhooks/snappli', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    event = verifyWebhook(req.body, req.headers, process.env.SNAPPLI_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof SnappliWebhookError) return res.status(401).json({ error: error.reason });
    throw error;
  }
  // event.trigger.deliveryId es la Idempotency-Key: ignora las repetidas.
  res.json({ data: { id: '…' } });
});
```

`error.reason` dice por qué no vale: `missing_signature`, `bad_signature`, `timestamp_out_of_range`, `invalid_json`… Para descargar los documentos, `downloadDocument(event.contact.documents.<clave>)`.

## Probar en local

No hace falta mover contactos en el panel para probar tu receptor. El [CLI](/desarrolladores/herramientas/) envía webhooks firmados igual que Snappli:

```sh
npx @snappli/cli webhooks trigger contact.stage.entered \
  --to http://localhost:3000/webhooks/snappli --secret "$SNAPPLI_WEBHOOK_SECRET" \
  --repeat --with-documents
```

- `--repeat` reenvía la misma entrega, como un reintento: comprueba que tu sistema la procesa una sola vez.
- `--with-documents` incluye documentos que se pueden descargar de verdad y te dice si tu receptor los descargó.
- `--mapping '{"fields":{"id_pedido":"$.data.id"}}'` muestra qué rellenaría el [mapeo de la respuesta](#leer-la-respuesta).

Si la firma no valida, `npx @snappli/cli webhooks verify` te dice por qué.

## Entrega y reintentos

- Responde con un código **`2xx`** en menos de **15 segundos**.
- Un código distinto de `2xx`, un error de red o pasar de 15 segundos cuentan como fallo. Snappli hace **hasta 3 intentos** en total, con backoff exponencial (desde 2 s).
- Si se agotan los reintentos, queda una **nota en el contacto** con el error para que el equipo lo vea. El contacto no cambia de etapa.
- Puedes reintentar manualmente una entrega desde el panel.
- Las entregas con **aprobación** quedan pendientes hasta que alguien las aprueba.
- Si el contacto sale de la etapa y vuelve a entrar, la entrega de esa etapa se reutiliza: si ya se entregó, no se repite; si falló o se rechazó, se envía de nuevo.

### Envío único por contacto

Con **No enviar si el contacto ya tiene…** eliges un campo (por ejemplo, el ID que devolvió tu sistema). Si el contacto ya tiene ese campo, la entrega no se envía y queda en el historial como **No enviado**, con el motivo. Desde el detalle puedes **Enviar igualmente**.

## Leer la respuesta

Si tu sistema responde con un **`2xx` y JSON**, Snappli puede guardar datos de la respuesta en el contacto. En **Documentos y respuesta** configuras:

- **Campos** — el campo del contacto y la ruta en la respuesta, por ejemplo `id_pedido ← $.data.id`. Admite rutas simples: `$.campo`, `$.a.b`, `$.lista[0].id`.
- **Etiquetas** — se añaden al contacto cuando llega la respuesta.
- **Nota** — se deja en el contacto; usa `{{clave_del_campo}}` para poner un valor leído, por ejemplo *«Pedido creado: {{id_pedido}}»*.

Con la respuesta `{"data": {"id": "PED-123"}}` y el campo `id_pedido ← $.data.id`, el contacto queda con `id_pedido = PED-123`. Si además usas **No enviar si el contacto ya tiene…** `id_pedido`, nunca se crea dos veces.

Si la respuesta no es JSON o no trae la ruta, la entrega queda **Entregada** con un aviso en el historial. El detalle de cada entrega muestra qué campos se rellenaron. Usa **Probar** (con una respuesta de ejemplo) para revisar el mapeo antes de guardarlo; la **prueba** del webhook muestra qué se rellenaría, sin escribir en ningún contacto.

:::tip
Cada webhook en **Configuración → Webhooks** tiene un botón **Enviar prueba** para validar tu endpoint. Si es tu primera vez, sigue la [prueba rápida con webhook.site](/desarrolladores/webhooks-recetas/#prueba-rápida-con-webhooksite).
:::
