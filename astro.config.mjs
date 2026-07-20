// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.snappli.io',
	integrations: [
		sitemap(),
		starlight({
			title: 'Snappli Docs',
			description:
				'Guías de producto, API e integraciones para Snappli — atención al cliente con IA.',
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'Español',
					lang: 'es',
				},
			},
			logo: {
				light: './src/assets/logo-light.png',
				dark: './src/assets/logo.png',
				alt: 'Snappli',
				replacesTitle: true,
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/luis-gomez-91/snappli-docs',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/luis-gomez-91/snappli-docs/edit/main/',
			},
			lastUpdated: true,
			pagination: true,
			sidebar: [
				{
					label: 'Empezar',
					items: [
						{ label: 'Introducción', slug: 'guia/introduccion' },
						{ label: 'Primeros pasos', slug: 'guia/primeros-pasos' },
						{ label: 'Conceptos', slug: 'guia/conceptos' },
					],
				},
				{
					label: 'Producto',
					items: [
						{ label: 'Inbox', slug: 'producto/inbox' },
						{ label: 'Contactos', slug: 'producto/contactos' },
						{ label: 'Pipeline y acciones', slug: 'producto/pipeline' },
						{ label: 'Agentes IA', slug: 'producto/agentes' },
						{ label: 'Base de conocimiento', slug: 'producto/base-de-conocimiento' },
						{ label: 'Campañas', slug: 'producto/campanias' },
						{ label: 'Equipos', slug: 'producto/equipos' },
						{ label: 'Informes', slug: 'producto/informes' },
					],
				},
				{
					label: 'Canales',
					items: [
						{ label: 'Visión general', slug: 'canales/introduccion' },
						{ label: 'WhatsApp', slug: 'canales/whatsapp' },
						{ label: 'Instagram y Messenger', slug: 'canales/instagram-messenger' },
						{ label: 'Email', slug: 'canales/email' },
						{ label: 'Widget web', slug: 'canales/widget' },
					],
				},
				{
					label: 'Cuenta y organización',
					items: [
						{ label: 'Miembros y roles', slug: 'cuenta/miembros-y-roles' },
						{ label: 'Organización', slug: 'cuenta/organizacion' },
						{ label: 'Mi cuenta', slug: 'cuenta/mi-cuenta' },
						{ label: 'Facturación y uso', slug: 'cuenta/facturacion' },
					],
				},
				{
					label: 'Desarrolladores',
					badge: { text: 'API', variant: 'note' },
					items: [
						{ label: 'Introducción API', slug: 'desarrolladores/introduccion' },
						{ label: 'Autenticación', slug: 'desarrolladores/autenticacion' },
						{ label: 'API de contactos', slug: 'desarrolladores/contactos' },
						{ label: 'Webhooks', slug: 'desarrolladores/webhooks' },
						{ label: 'Instalar el widget', slug: 'desarrolladores/widget' },
					],
				},
				{
					label: 'Referencia',
					items: [{ autogenerate: { directory: 'referencia' } }],
				},
			],
			customCss: ['./src/styles/global.css'],
			components: {
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			head: [
				{
					tag: 'meta',
					attrs: {
						name: 'theme-color',
						content: '#ec4899',
					},
				},
			],
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
