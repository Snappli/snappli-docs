---
title: Novedades
description: Cambios recientes en Snappli y en esta documentación.
sidebar:
  order: 3
---

Registro de cambios destacados. Las fechas siguen el formato AAAA-MM-DD.

## 2026-11

- **Campañas: repetir en días concretos** (2026-11-17) — las campañas recurrentes salen siempre a la misma hora y pueden repetirse en días de la semana (L–D), días del mes o el último día del mes, o a diario solo en laborables. Las de llamadas añaden horario propio y máximo de llamadas por día. Ver [Campañas](/producto/campanias/#programación-y-recurrencia).
- **Llamadas IA salientes y campañas de llamadas** (2026-11-17, beta) — la IA puede llamar a tus contactos por WhatsApp o por teléfono con un objetivo, en horario laboral de su país, y deja el resultado y un resumen en el chat. Puedes programar una llamada desde la ficha del contacto o llamar a un segmento con una campaña. Gastan minutos de voz con IA. Ver [Llamadas IA salientes](/producto/llamadas-ia-salientes/).
- **Resumen IA del contacto** (2026-11-17) — cada contacto tiene un resumen de lo que habló por todos los canales, que la IA del chat y de las llamadas usa como contexto. Ver [Resumen IA](/producto/contactos/#resumen-ia).
- **Documentos del contacto con revisión** (2026-11-17) — nuevo tipo de campo **Archivo** para guardar cédulas, títulos, comprobantes de pago o contratos que te envían por el chat, con estado **Por revisar**, **Aprobado** o **Rechazado**. Se guardan desde el chat con **Guardar como…**, subiéndolos, o los reconoce la IA sola en las imágenes; la IA solo confirma que los recibió y nunca da un pago por confirmado. Ver [Documentos del contacto](/producto/contactos/#documentos-del-contacto).
- **Etapas solo para personas y documentos obligatorios** (2026-11-17) — en cada etapa del pipeline eliges si la IA puede mover contactos a ella y qué documentos exige, subidos o aprobados. Ver [Pipeline](/producto/pipeline/#etapas-que-solo-mueve-una-persona).
- **Webhooks con documentos y respuesta** (2026-11-17) — el payload trae `contact.documents` con enlaces temporales, cada entrega lleva `Idempotency-Key`, puedes no enviar si el contacto ya tiene un campo y guardar datos de la respuesta de tu sistema (por ejemplo, el ID del pedido) en el contacto. Ver [Webhooks](/desarrolladores/webhooks/#leer-la-respuesta).
- **Llamadas con IA con servicio de respaldo** (2026-11-16) — si el servicio de voz principal falla al contestar, la llamada la atiende otro servicio de voz en vez de decir «no podemos atenderte». En **Configurar voz** de cada canal puedes elegir la **voz de respaldo** o dejarla en automática (una parecida a la voz principal). Ver [Minutos de voz con IA](/producto/voz-minutos/).
- **Cierres de la IA más naturales** (2026-11-15) — un «igualmente, gracias» después de que la IA cerró ya no reabre la conversación ni recibe otra respuesta; en el chat web, la IA pide una vez el WhatsApp (o el nombre) a quien se despide sin dejarlo; cuando falta un dato para pasar con un asesor, la IA conserva su respuesta y solo añade la pregunta; en el widget, las negritas se ven como negritas; y los saludos y agradecimientos se responden más rápido, sin buscar en la base de conocimiento. Ver [Resolución por la IA](/producto/agentes/#resolución-por-la-ia).
- **La IA comparte contactos, ubicaciones y archivos en todos los canales** (2026-11-15) — el agente ya usa tus ubicaciones para responder direcciones y horarios y puede enviarlas; los contactos compartibles funcionan también en el widget, Telegram, Instagram, Messenger, email y SMS (como tarjeta o como texto, según el canal), y los archivos llegan como enlace en los canales que no los adjuntan. Si el contacto quiere hablar con un área que tiene contacto compartible, la IA se lo comparte en vez de pasarlo a un asesor. También se corrige que la IA volviera a pedir datos ya respondidos antes de derivar. Ver [Qué puede hacer el agente](/producto/agentes/#qué-puede-hacer-el-agente).
- **Archivos, notas de voz y ubicación en el widget web** (2026-11-14) — los visitantes ya pueden enviar fotos, documentos, notas de voz y su ubicación desde el chat de tu sitio, y ven las imágenes, archivos, tarjetas de contacto y ubicaciones que les envías desde el inbox. Ver [Widget web](/canales/widget/#archivos-notas-de-voz-y-ubicación).

## 2026-10

- **Plantillas de WhatsApp más completas** (2026-10-28) — encabezado con **imagen, video o PDF**; cada variable se rellena sola con un dato del contacto (incluidos campos personalizados), de la empresa o a mano al enviar, también en campañas y pipeline; las **respuestas rápidas** que toca el cliente llegan al inbox y la IA les responde. Ver [Plantillas de WhatsApp](/canales/whatsapp-plantillas/).
- **Archivos de WhatsApp en el inbox** (2026-10-28) — las imágenes, stickers, documentos y videos que envían los clientes ya aparecen en el chat. Ver [Inbox](/producto/inbox/#lo-que-te-envían-por-whatsapp).
- **Conexión manual de WhatsApp verificada** (2026-10-28) — al guardar, Snappli comprueba el Phone Number ID, el WABA ID y el token, y suscribe la cuenta a los webhooks automáticamente. Ver [WhatsApp](/canales/whatsapp/#método-2-configuración-manual).

- **El widget pide nombre y WhatsApp** — la IA pide estos datos a quien escribe desde la web y los guarda en su contacto. Además, la IA sigue mejor el hilo de la conversación: no se vuelve a presentar, no repite información ni reenvía archivos que ya envió. Ver [Widget web](/canales/widget/#datos-del-visitante).
- **Atención humana y horario de atención** — hasta 3 turnos por día, turnos nocturnos, días de 24 h, feriados y aviso de cola con interruptor. La configuración general de automatización se reorganiza en las pestañas Identidad, Comportamiento IA, Atención humana y Automatización. Ver [Agentes IA](/producto/agentes/#configuración-general).
- **La IA responde mejor** — contesta los mensajes que llegan mientras responde y, si falla o se agotan los créditos de IA, pasa la conversación a una persona con una nota interna. Ver [Cómo responde la IA](/producto/agentes/#cómo-responde-la-ia).
- **Crea plantillas de WhatsApp desde Snappli** — editor con vista previa, validación de las reglas de Meta, estado de revisión y aviso por email cuando Meta aprueba o rechaza. Ver [Plantillas de WhatsApp](/canales/whatsapp-plantillas/).
- **Nuevos planes y precios** — se actualizan precios y cupos de Snappli completo y Snappli para WhatsApp, con **cobros por uso** opcionales para contactos, créditos de IA y minutos de voz. Ver [Facturación y uso](/cuenta/facturacion/).
- **Minutos de voz con IA** — las llamadas atendidas por la IA ahora se miden en minutos, con cupo por plan. Ver [Minutos de voz con IA](/producto/voz-minutos/).
- **Campañas de email más seguras** — Snappli deja de enviar campañas a direcciones que rebotan o marcan spam. Ver [Campañas](/producto/campanias/#rebotes-y-spam-en-email).

## 2026-09

- **Baja de campañas de email** — los destinatarios pueden darse de baja desde el propio correo.
- **Plantillas de email con imágenes** — el editor de plantillas permite insertar imágenes.
- **Varios webhooks por organización** — cada uno con sus eventos, filtros por etapa o etiqueta, cabecera de autenticación propia e historial de entregas. Ahora están en **Configuración → Webhooks**. Ver [Webhooks](/desarrolladores/webhooks/).
- **Voz con IA en tiempo real** — conversaciones de voz más naturales, con interrupciones y elección de voz por canal.

## 2026-07

- **Acciones de etapa de pipeline** — al entrar a una etapa puedes disparar webhook, añadir etiqueta, crear una nota, asignar la conversación o enviar una plantilla. Ver [Pipeline y acciones](/producto/pipeline/).
- **Documentación ampliada** — nuevas secciones de Canales, Cuenta y organización, y referencia de la API de contactos.

:::note
¿Falta algo que lanzamos y no está aquí? Escríbenos desde el centro de ayuda de la app.
:::
