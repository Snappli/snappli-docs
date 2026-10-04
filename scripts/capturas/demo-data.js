// Datos demo para capturas de la doc. Solo contra la base local snappli_docs_demo.
const { PrismaClient } = require(require('node:path').resolve(__dirname, '../../../snappli-backend/node_modules/@prisma/client'));

if (!process.env.DATABASE_URL?.includes('localhost:5432/snappli_docs_demo')) {
	throw new Error('DATABASE_URL debe apuntar a la base local snappli_docs_demo');
}

const prisma = new PrismaClient();
const now = Date.now();
const ago = (min) => new Date(now - min * 60_000);

async function main() {
	const org = await prisma.organization.findFirstOrThrow({ where: { slug: 'tienda-aurora' } });
	const orgId = org.id;
	const owner = await prisma.user.findFirstOrThrow({ where: { email: 'laura@demo.snappli.io' } });
	const ventas = await prisma.department.findFirstOrThrow({ where: { organizationId: orgId, name: 'Ventas' } });
	const soporte = await prisma.department.findFirstOrThrow({ where: { organizationId: orgId, name: 'Soporte' } });
	const stages = Object.fromEntries(
		(await prisma.pipelineStage.findMany({ where: { organizationId: orgId } })).map((s) => [s.name, s]),
	);

	await prisma.organization.update({
		where: { id: orgId },
		data: { settings: { ...(org.settings ?? {}), timezone: 'America/Guayaquil' } },
	});
	await prisma.department.update({ where: { id: ventas.id }, data: { assignmentMode: 'DIRECT_ASSIGNMENT' } });

	// —— Equipo ——
	const people = [
		{ name: 'Andrés Vega', email: 'andres@demo.snappli.io', role: 'ADMIN', dept: null },
		{ name: 'Diego Paredes', email: 'diego@demo.snappli.io', role: 'AGENT', dept: ventas.id },
		{ name: 'Camila Ríos', email: 'camila@demo.snappli.io', role: 'AGENT', dept: soporte.id },
		{ name: 'Sofía Lema', email: 'sofia@demo.snappli.io', role: 'AGENT', dept: ventas.id },
	];
	const users = { laura: owner };
	for (const p of people) {
		const user = await prisma.user.upsert({
			where: { email: p.email },
			update: {},
			create: { email: p.email, emailCanonical: p.email, name: p.name, emailVerified: true },
		});
		await prisma.organizationMember.upsert({
			where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
			update: { role: p.role, departmentId: p.dept },
			create: { organizationId: orgId, userId: user.id, role: p.role, departmentId: p.dept },
		});
		if (p.dept) {
			await prisma.agentProfile.upsert({
				where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
				update: { availabilityStatus: 'ONLINE', departmentId: p.dept },
				create: { organizationId: orgId, userId: user.id, departmentId: p.dept, availabilityStatus: 'ONLINE' },
			});
		}
		users[p.email.split('@')[0]] = user;
	}

	// —— Canales ——
	const mkChannel = async (type, label, departments) => {
		const channel = await prisma.channel.create({
			data: {
				organizationId: orgId,
				type,
				label,
				defaultDepartmentId: departments[0],
				departments: { create: departments.map((departmentId) => ({ departmentId })) },
			},
		});
		return channel;
	};
	const waChannel = await mkChannel('WHATSAPP', 'WhatsApp Tienda Aurora', [ventas.id, soporte.id]);
	const wa = await prisma.whatsAppConnection.create({
		data: {
			organizationId: orgId,
			channelId: waChannel.id,
			label: 'Tienda Aurora',
			phoneNumberId: 'demo-phone-1',
			wabaId: 'demo-waba-1',
			displayPhone: '+593 99 812 4470',
			accessToken: 'demo',
			verifyToken: 'demo',
			connectionMethod: 'EMBEDDED_SIGNUP',
		},
	}).catch(() =>
		prisma.whatsAppConnection.create({
			data: {
				organizationId: orgId,
				channelId: waChannel.id,
				label: 'Tienda Aurora',
				phoneNumberId: 'demo-phone-1',
				wabaId: 'demo-waba-1',
				displayPhone: '+593 99 812 4470',
				accessToken: 'demo',
				verifyToken: 'demo',
			},
		}),
	);
	const igChannel = await mkChannel('INSTAGRAM', '@tiendaaurora.ec', [ventas.id]);
	const ig = await prisma.metaMessagingConnection.create({
		data: {
			organizationId: orgId,
			channelId: igChannel.id,
			platform: 'INSTAGRAM',
			label: '@tiendaaurora.ec',
			pageId: 'demo-page-1',
			igAccountId: 'demo-ig-1',
			pageName: 'Tienda Aurora',
			accessToken: 'demo',
			verifyToken: 'demo',
		},
	});
	const widgetChannel = await mkChannel('WIDGET', 'Chat de tiendaaurora.ec', [ventas.id]);
	const widget = await prisma.widgetConnection.create({
		data: {
			organizationId: orgId,
			channelId: widgetChannel.id,
			label: 'Chat de tiendaaurora.ec',
			publicKey: 'pk_demo_tiendaaurora',
			allowedOrigins: ['https://tiendaaurora.ec'],
			quickPrompts: ['¿Hacen envíos a mi ciudad?', 'Guía de tallas', '¿Dónde está mi pedido?'],
		},
	});
	const emailChannel = await mkChannel('EMAIL', 'hola@tiendaaurora.ec', [soporte.id]);
	const email = await prisma.emailConnection.create({
		data: {
			organizationId: orgId,
			channelId: emailChannel.id,
			label: 'Atención al cliente',
			fromEmail: 'hola@tiendaaurora.ec',
			fromName: 'Tienda Aurora',
			inboundAddress: 'tienda-aurora@inbound.demo.snappli.io',
		},
	});

	// —— Etiquetas ——
	const contactTagDefs = [
		['VIP', '#ec4899'],
		['Mayorista', '#8b5cf6'],
		['Recompra', '#22c55e'],
		['Quito', '#0ea5e9'],
		['Guayaquil', '#f59e0b'],
	];
	const ctags = {};
	for (const [name, color] of contactTagDefs) {
		ctags[name] = await prisma.contactTag.create({ data: { organizationId: orgId, name, color } });
	}
	const inboxTagDefs = [
		['Pedido', '#6366f1'],
		['Devolución', '#ef4444'],
		['Talla', '#f59e0b'],
		['Urgente', '#dc2626'],
		['Mayoreo', '#8b5cf6'],
	];
	const itags = {};
	for (const [name, color] of inboxTagDefs) {
		itags[name] = await prisma.inboxTag.create({
			data: { organizationId: orgId, name, color, createdById: owner.id },
		});
	}

	// —— Base de conocimiento y agentes IA ——
	const kb = await prisma.knowledgeBase.create({
		data: { organizationId: orgId, name: 'Catálogo y políticas', description: 'Tallas, envíos, cambios y preguntas frecuentes.' },
	});
	const docs = [
		{ name: 'Política de cambios y devoluciones.pdf', mimeType: 'application/pdf', size: 184_320, sourceType: 'UPLOAD', chunks: 14 },
		{ name: 'Guía de tallas 2026.pdf', mimeType: 'application/pdf', size: 402_112, sourceType: 'UPLOAD', chunks: 22 },
		{ name: 'Envíos y tiempos de entrega', mimeType: 'text/html', size: 18_944, sourceType: 'URL', sourceUrl: 'https://tiendaaurora.ec/envios', chunks: 6 },
		{ name: 'Preguntas frecuentes', mimeType: 'application/vnd.google-apps.document', size: 26_112, sourceType: 'GOOGLE_DOC', sourceUrl: 'https://docs.google.com/document/d/demo', chunks: 11 },
	];
	for (const d of docs) {
		const doc = await prisma.document.create({
			data: {
				organizationId: orgId,
				knowledgeBaseId: kb.id,
				name: d.name,
				mimeType: d.mimeType,
				size: d.size,
				sourceType: d.sourceType,
				sourceUrl: d.sourceUrl ?? null,
				status: 'READY',
				lastSyncedAt: ago(60 * 26),
			},
		});
		await prisma.documentChunk.createMany({
			data: Array.from({ length: d.chunks }, (_, i) => ({
				organizationId: orgId,
				knowledgeBaseId: kb.id,
				documentId: doc.id,
				content: `${d.name} — fragmento ${i + 1}`,
				chunkIndex: i,
			})),
		});
	}

	const ventasPrompt = `Eres Aurora, la asistente de ventas de Tienda Aurora, una tienda de ropa y accesorios en Quito.

- Responde en español, con un tono cercano y breve (máximo 3 frases).
- Ayuda a elegir talla con la guía de tallas y confirma disponibilidad antes de prometer stock.
- Envíos: 24–48 h en Quito y Guayaquil, 2–4 días al resto del país. Envío gratis desde $60.
- No ofrezcas descuentos que no estén en la base de conocimiento.
- Si el cliente quiere hablar con una persona o pide una compra mayorista, pasa la conversación al equipo.

Cliente: {{contact.firstName}}`;
	const soportePrompt = `Eres Aurora, la asistente de soporte de Tienda Aurora.

- Ayuda con el estado de pedidos, cambios y devoluciones según la política vigente.
- Los cambios se aceptan hasta 30 días después de la compra, con etiqueta.
- Nunca confirmes un reembolso: pásalo a una persona del equipo de Soporte.`;
	const assistants = await prisma.assistant.findMany({ where: { organizationId: orgId } });
	for (const a of assistants) {
		const isVentas = a.departmentId === ventas.id;
		const isSoporte = a.departmentId === soporte.id;
		await prisma.assistant.update({
			where: { id: a.id },
			data: {
				isActive: true,
				knowledgeBaseId: kb.id,
				escalationKeywords: ['humano', 'agente', 'persona', 'asesor'],
				idleEscalationMinutes: isSoporte ? 20 : 30,
				...(isVentas ? { description: 'Asesora de compras: tallas, stock y envíos.', systemPrompt: ventasPrompt } : {}),
				...(isSoporte ? { description: 'Pedidos, cambios y devoluciones.', systemPrompt: soportePrompt } : {}),
			},
		});
	}
	const bot = assistants.find((a) => a.departmentId === ventas.id);
	const botSoporte = assistants.find((a) => a.departmentId === soporte.id);

	// —— Contactos ——
	const contactDefs = [
		{ k: 'valeria', first: 'Valeria', last: 'Andrade', phone: '+593987654321', email: 'valeria.andrade@gmail.com', stage: 'Carrito', tags: ['Quito', 'Recompra'] },
		{ k: 'mateo', first: 'Mateo', last: 'Guerrero', phone: '+593991234567', stage: 'Interesado', tags: ['Guayaquil'] },
		{ k: 'isabela', first: 'Isabela', last: 'Cevallos', phone: '+593984561230', email: 'isa.cevallos@outlook.com', stage: 'Compra', tags: ['VIP', 'Quito', 'Recompra'] },
		{ k: 'boutique', first: 'Boutique', last: 'Esmeralda', phone: '+593972223344', email: 'compras@boutiqueesmeralda.ec', stage: 'Interesado', tags: ['Mayorista', 'Guayaquil'] },
		{ k: 'jorge', first: 'Jorge', last: 'Salazar', phone: '+593995556677', email: 'jsalazar@yahoo.com', stage: 'Compra', tags: ['Quito'] },
		{ k: 'daniela', first: 'Daniela', last: 'Moreno', igName: 'dani.moreno', stage: 'Nuevo', tags: [] },
		{ k: 'carla', first: 'Carla', last: 'Benítez', email: 'carla.benitez@gmail.com', stage: 'Compra', tags: ['Recompra'] },
		{ k: 'sebastian', first: 'Sebastián', last: 'Ortiz', stage: 'Nuevo', tags: [] },
		{ k: 'paula', first: 'Paula', last: 'Villacís', phone: '+593983334455', stage: 'Carrito', tags: ['Quito'] },
		{ k: 'nicolas', first: 'Nicolás', last: 'Herrera', phone: '+593967778899', stage: 'Perdido', tags: [] },
		{ k: 'gabriela', first: 'Gabriela', last: 'Proaño', phone: '+593981112233', email: 'gaby.proano@gmail.com', stage: 'Compra', tags: ['VIP', 'Recompra'] },
		{ k: 'martin', first: 'Martín', last: 'Castro', igName: 'martincastro.ec', stage: 'Interesado', tags: ['Guayaquil'] },
		{ k: 'lucia', first: 'Lucía', last: 'Navarrete', phone: '+593994445566', stage: 'Nuevo', tags: [] },
		{ k: 'fernanda', first: 'Fernanda', last: 'Ruiz', email: 'fer.ruiz@hotmail.com', stage: 'Interesado', tags: ['Quito'] },
		{ k: 'tomas', first: 'Tomás', last: 'Aguirre', phone: '+593968889900', stage: 'Compra', tags: [] },
		{ k: 'renata', first: 'Renata', last: 'Jaramillo', phone: '+593976665544', email: 'renata.j@gmail.com', stage: 'Carrito', tags: ['VIP', 'Guayaquil'] },
	];
	const contacts = {};
	for (const [i, c] of contactDefs.entries()) {
		contacts[c.k] = await prisma.contact.create({
			data: {
				organizationId: orgId,
				firstName: c.first,
				lastName: c.last,
				phone: c.phone ?? null,
				email: c.email ?? null,
				language: 'es',
				countryCode: 'EC',
				externalIds: c.igName ? { instagramUsername: c.igName } : {},
				pipelineStageId: stages[c.stage].id,
				pipelineStageEnteredAt: ago(60 * (i + 2)),
				createdAt: ago(60 * 24 * (20 - i)),
				tags: { create: c.tags.map((t) => ({ tagId: ctags[t].id })) },
			},
		});
	}
	await prisma.contactNote.create({
		data: {
			organizationId: orgId,
			contactId: contacts.boutique.id,
			body: 'Pide catálogo mayorista para temporada escolar. Volumen estimado: 120 prendas/mes.',
			source: 'AGENT',
		},
	});

	// —— Conversaciones ——
	const conn = {
		WHATSAPP: { whatsappConnectionId: wa.id },
		INSTAGRAM: { metaMessagingConnectionId: ig.id },
		WIDGET: { widgetConnectionId: widget.id },
		EMAIL: { emailConnectionId: email.id },
	};
	const C = 'CONTACT';
	const B = 'BOT';
	const A = 'AGENT';
	const SYS = 'SYSTEM';
	const conversations = [
		{
			contact: 'valeria', channel: 'WHATSAPP', dept: ventas, assignee: 'diego', status: 'OPEN', tags: ['Talla', 'Pedido'],
			msgs: [
				[C, 38, 'Hola! Vi el vestido midi lino en Instagram, ¿lo tienen en color arena?'],
				[B, 38, '¡Hola Valeria! 😊 Sí, el vestido midi de lino está disponible en arena, en tallas S, M y L. ¿Qué talla usas normalmente?'],
				[C, 36, 'Normalmente M pero no sé si me queda largo, mido 1,58'],
				[B, 36, 'Según la guía de tallas, con 1,58 m el largo midi te llegaría a media pantorrilla. La M es la talla recomendada para tu medida habitual.'],
				[C, 33, 'Ok, ¿y puedo hablar con una persona para confirmar el envío a Cumbayá?'],
				[SYS, 33, 'Aurora transfirió la conversación al equipo Ventas: el cliente pidió hablar con una persona.'],
				[A, 21, 'Hola Valeria, soy Diego 👋 Sí llegamos a Cumbayá: si confirmas hoy antes de las 4 pm te llega mañana. ¿Te separo la talla M en arena?'],
				[C, 4, 'Sí porfa! Te paso los datos para el envío'],
			],
		},
		{
			contact: 'boutique', channel: 'WHATSAPP', dept: ventas, assignee: null, status: 'OPEN', tags: ['Mayoreo', 'Urgente'],
			msgs: [
				[C, 15, 'Buenas tardes, somos Boutique Esmeralda de Guayaquil. Queremos el catálogo mayorista para temporada escolar.'],
				[B, 15, '¡Buenas tardes! Gracias por escribirnos. Las compras mayoristas las gestiona directamente nuestro equipo de Ventas; te paso con una persona ahora mismo.'],
				[SYS, 15, 'Aurora transfirió la conversación al equipo Ventas: compra mayorista.'],
				[C, 9, 'Perfecto, quedo atenta. Necesitamos cotización esta semana 🙏'],
			],
		},
		{
			contact: 'isabela', channel: 'INSTAGRAM', dept: ventas, assignee: null, status: 'OPEN', tags: [],
			msgs: [
				[C, 52, 'Hola!! ¿Cuándo vuelve a llegar la chaqueta denim oversize?'],
				[B, 52, '¡Hola Isabela! La chaqueta denim oversize vuelve a estar disponible el viernes. ¿Quieres que te avisemos por aquí cuando llegue?'],
				[C, 50, 'Sí porfa, en talla S 💕'],
				[B, 50, '¡Listo! Te escribiremos en cuanto llegue la talla S. ¿Te puedo ayudar con algo más?'],
			],
		},
		{
			contact: 'jorge', channel: 'EMAIL', dept: soporte, assignee: 'camila', status: 'OPEN', tags: ['Devolución'],
			subject: 'Cambio de talla pedido #10482',
			msgs: [
				[C, 140, 'Hola, recibí el pedido #10482 pero la camisa me quedó grande. ¿Puedo cambiarla por una talla M?\n\nSaludos,\nJorge Salazar'],
				[A, 95, 'Hola Jorge, claro que sí. Tienes 30 días para el cambio. Te enviamos una guía de retiro sin costo a tu correo; cuando la recibamos despachamos la talla M.\n\nCamila — Tienda Aurora'],
				[C, 26, 'Perfecto, muchas gracias. ¿El courier pasa a domicilio?'],
			],
		},
		{
			contact: 'mateo', channel: 'WHATSAPP', dept: ventas, assignee: 'sofia', status: 'OPEN', tags: ['Pedido'],
			msgs: [
				[C, 75, '¿Hacen envíos a Guayaquil? ¿Cuánto cuesta?'],
				[B, 75, '¡Sí! A Guayaquil llegamos en 24–48 h. El envío cuesta $3,50 y es gratis en compras desde $60.'],
				[C, 70, 'Genial. Quiero 2 polos básicos negros talla L'],
				[A, 61, 'Hola Mateo, soy Sofía. Te separé los 2 polos negros L ($34 en total). Te envío el link de pago 👇'],
			],
		},
		{
			contact: 'daniela', channel: 'INSTAGRAM', dept: ventas, assignee: null, status: 'OPEN', tags: [],
			msgs: [
				[C, 12, 'Holaa ¿tienen tienda física?'],
				[B, 12, '¡Hola Daniela! Nuestra tienda física está en el CC Quicentro Norte, local 214, abierta de 10:00 a 20:00. También vendemos en tiendaaurora.ec 🛍️'],
			],
		},
		{
			contact: 'sebastian', channel: 'WIDGET', dept: ventas, assignee: null, status: 'OPEN', tags: ['Talla'],
			msgs: [
				[C, 7, 'Hola, ¿la talla 32 de los jeans slim equivale a qué talla?'],
				[B, 7, '¡Hola! La talla 32 de los jeans slim equivale a una cintura de 81–83 cm. Si estás entre dos tallas, te recomendamos la más grande.'],
				[C, 6, 'Gracias, quiero hablar con un asesor'],
				[SYS, 6, 'Aurora transfirió la conversación al equipo Ventas: el cliente pidió hablar con una persona.'],
			],
		},
		{
			contact: 'gabriela', channel: 'WHATSAPP', dept: soporte, assignee: 'camila', status: 'OPEN', tags: ['Pedido'],
			msgs: [
				[C, 190, 'Hola, ¿cómo va mi pedido #10477? Lo compré el lunes'],
				[B, 190, 'Hola Gabriela, tu pedido #10477 salió ayer del centro de distribución y está en ruta. Debería llegar hoy antes de las 7 pm.'],
				[C, 30, 'Todavía no llega y ya son las 6:30'],
				[SYS, 30, 'Aurora transfirió la conversación al equipo Soporte: inactividad o consulta fuera de alcance.'],
				[A, 18, 'Hola Gabriela, soy Camila. Acabo de hablar con el courier: tu pedido está a 3 paradas. Te escribo apenas se entregue 🙌'],
			],
		},
		{
			contact: 'paula', channel: 'WHATSAPP', dept: ventas, assignee: 'diego', status: 'OPEN', tags: [],
			msgs: [
				[C, 240, '¿Tienen descuento por primera compra?'],
				[B, 240, '¡Hola Paula! Con el código BIENVENIDA10 tienes 10% de descuento en tu primera compra en tiendaaurora.ec.'],
				[C, 238, 'Súper, gracias!'],
			],
		},
		{
			contact: 'carla', channel: 'EMAIL', dept: soporte, assignee: 'camila', status: 'RESOLVED', tags: ['Devolución'],
			subject: 'Reembolso pedido #10431',
			msgs: [
				[C, 60 * 26, 'Buenas, quisiera saber si ya procesaron el reembolso de mi pedido #10431.'],
				[A, 60 * 25, 'Hola Carla, el reembolso se procesó hoy y verás el valor en tu tarjeta en 3 a 5 días hábiles. ¡Gracias por tu paciencia!'],
				[C, 60 * 24, '¡Perfecto, gracias!'],
			],
		},
		{
			contact: 'nicolas', channel: 'WHATSAPP', dept: ventas, assignee: 'sofia', status: 'RESOLVED', tags: [],
			msgs: [
				[C, 60 * 30, '¿Tienen la sudadera gris en XL?'],
				[B, 60 * 30, 'Por ahora la sudadera gris está agotada en XL. ¿Quieres que te avisemos cuando vuelva?'],
				[C, 60 * 29, 'No, gracias'],
			],
		},
		{
			contact: 'renata', channel: 'WHATSAPP', dept: ventas, assignee: null, status: 'OPEN', tags: ['Pedido'],
			msgs: [
				[C, 3, 'Hola! Dejé un carrito en la web con 3 prendas, ¿me ayudan a terminar la compra?'],
				[B, 2, '¡Hola Renata! Claro: veo que tienes la blusa satinada, el pantalón palazzo y el cinturón trenzado. ¿Prefieres pagar con tarjeta o transferencia?'],
			],
		},
	];

	for (const cv of conversations) {
		const contact = contacts[cv.contact];
		const last = Math.min(...cv.msgs.map((m) => m[1]));
		const first = Math.max(...cv.msgs.map((m) => m[1]));
		const convo = await prisma.conversation.create({
			data: {
				organizationId: orgId,
				contactId: contact.id,
				channel: cv.channel,
				...conn[cv.channel],
				status: cv.status,
				subject: cv.subject ?? null,
				departmentId: cv.dept.id,
				assignedToId: cv.assignee ? users[cv.assignee].id : null,
				lastMessageAt: ago(last),
				lastResolvedAt: cv.status === 'RESOLVED' ? ago(last - 5) : null,
				createdAt: ago(first),
				tags: { create: cv.tags.map((t) => ({ tagId: itags[t].id })) },
			},
		});
		let n = 0;
		for (const [sender, min, content] of cv.msgs) {
			n += 1;
			await prisma.message.create({
				data: {
					organizationId: orgId,
					conversationId: convo.id,
					contactId: contact.id,
					direction: sender === C ? 'INBOUND' : 'OUTBOUND',
					senderType: sender,
					senderId:
						sender === A ? users[cv.assignee].id : sender === B ? (cv.dept.id === soporte.id ? botSoporte.id : bot.id) : null,
					content,
					contentType: sender === SYS ? 'SYSTEM' : 'TEXT',
					createdAt: new Date(ago(min).getTime() + n * 1000),
				},
			});
		}
		const lastInbound = Math.min(...cv.msgs.filter((m) => m[0] === C).map((m) => m[1]));
		await prisma.contact.update({
			where: { id: contact.id },
			data: { lastInboundMessageAt: ago(lastInbound), lastActiveAt: ago(last), lastActiveChannel: cv.channel },
		});
	}

	console.log('Datos demo listos:', {
		contacts: Object.keys(contacts).length,
		conversations: conversations.length,
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
