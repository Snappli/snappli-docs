---
title: Webhooks
description: Recibe eventos de Snappli en tu servidor con firma HMAC.
---

Los **webhooks** envían un `POST` JSON a tu URL cuando ocurren eventos (pipeline, contactos, conversaciones). Se configuran en **Configuración → Webhooks**.

## Configuración

Puedes crear **varios webhooks** por organización (por ejemplo, uno para tu CRM y otro para tu backend). Para cada uno:

1. En **Configuración → Webhooks**, crea un **nuevo webhook** con un nombre.
2. Indica la **URL** de destino.
3. (Recomendado) define un **secret** para verificar firmas HMAC.
4. (Opcional) añade una **cabecera de autenticación** (p. ej. `Authorization: Bearer …`) si tu endpoint la exige; se envía en cada entrega.
5. Elige los **eventos suscritos**.
6. (Opcional) filtra por **etapa** del pipeline (eventos de etapa) o por **etiqueta** (`contact.tag.assigned`). Si lo dejas vacío, recibes todas.

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
    "customFields": {}
  }
}
```

`trigger.source` puede ser `AI`, `AGENT`, `MANUAL`, `BULK` o `SYSTEM`.

Campos adicionales según el evento:

| Evento | Añade |
|--------|-------|
| `contact.stage.entered`, `contact.webhook.manual` | `pipeline` (`stageId`, `stageName`, `previousStageId`, `previousStageName`) y `conversation` (`id`, `channel`, `lastMessageAt`) |
| `contact.tag.assigned` | `tag` (`id`, `name`, `source`) |
| `conversation.escalated` | `conversation` y `reason` |

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

## Entrega y reintentos

- Responde con un código **`2xx`** en menos de **15 segundos**.
- Ante fallo, Snappli **reintenta hasta 3 veces** con backoff exponencial (desde 2 s).
- Puedes reintentar manualmente una entrega desde el panel.
- Las entregas con **aprobación** quedan pendientes hasta que alguien las aprueba.

:::tip
Cada webhook en **Configuración → Webhooks** tiene un botón **Enviar prueba** para validar tu endpoint. Si es tu primera vez, sigue la [prueba rápida con webhook.site](/desarrolladores/webhooks-recetas/#prueba-rápida-con-webhooksite).
:::
