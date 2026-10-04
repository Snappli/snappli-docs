/*
  Fuente única de precios y límites de planes.
  Debe coincidir con el backend: `prisma/seed.ts` (precios y complementos)
  y `src/modules/billing/plan-limits.util.ts` (límites).
  `null` = ilimitado; `0` = no incluido.
*/

export type Plan = {
	id: string;
	name: string;
	monthly: number;
	yearly: number;
	/** El precio es un mínimo (plan a medida). */
	fromPrice?: boolean;
	users: number;
	activeContacts: number;
	channels: number | null;
	teams: number | null;
	organizations: number;
	kbFragments: number | null;
	aiCredits: number;
	/** Snappli completo: destinatarios por envío. */
	recipientsPerSend?: number;
	/** Snappli para WhatsApp: destinatarios al mes. */
	recipientsPerMonth?: number | null;
	campaignEmails: number;
	voiceMinutes: number;
	reports: boolean;
	api: boolean;
	priorityOnboarding: boolean;
};

export const FULL_PLANS: Plan[] = [
	{
		id: 'starter',
		name: 'Starter',
		monthly: 59,
		yearly: 590,
		users: 3,
		activeContacts: 2_000,
		channels: 3,
		teams: 1,
		organizations: 1,
		kbFragments: 400,
		aiCredits: 10_000_000,
		recipientsPerSend: 1_000,
		campaignEmails: 0,
		voiceMinutes: 0,
		reports: true,
		api: false,
		priorityOnboarding: false,
	},
	{
		id: 'pro',
		name: 'Pro',
		monthly: 129,
		yearly: 1_290,
		users: 5,
		activeContacts: 5_000,
		channels: null,
		teams: 3,
		organizations: 1,
		kbFragments: 2_000,
		aiCredits: 25_000_000,
		recipientsPerSend: 5_000,
		campaignEmails: 15_000,
		voiceMinutes: 60,
		reports: true,
		api: true,
		priorityOnboarding: false,
	},
	{
		id: 'business',
		name: 'Business',
		monthly: 239,
		yearly: 2_390,
		users: 10,
		activeContacts: 10_000,
		channels: null,
		teams: 10,
		organizations: 1,
		kbFragments: 8_000,
		aiCredits: 50_000_000,
		recipientsPerSend: 10_000,
		campaignEmails: 40_000,
		voiceMinutes: 200,
		reports: true,
		api: true,
		priorityOnboarding: true,
	},
	{
		id: 'enterprise',
		name: 'Enterprise',
		monthly: 399,
		yearly: 3_990,
		fromPrice: true,
		users: 20,
		activeContacts: 25_000,
		channels: null,
		teams: null,
		organizations: 2,
		kbFragments: null,
		aiCredits: 100_000_000,
		recipientsPerSend: 25_000,
		campaignEmails: 100_000,
		voiceMinutes: 500,
		reports: true,
		api: true,
		priorityOnboarding: true,
	},
];

export const WS_PLANS: Plan[] = [
	{
		id: 'free',
		name: 'Free',
		monthly: 0,
		yearly: 0,
		users: 1,
		activeContacts: 50,
		channels: 1,
		teams: 1,
		organizations: 1,
		kbFragments: 50,
		aiCredits: 500_000,
		recipientsPerMonth: 0,
		campaignEmails: 0,
		voiceMinutes: 0,
		reports: false,
		api: false,
		priorityOnboarding: false,
	},
	{
		id: 'starter',
		name: 'Starter',
		monthly: 19,
		yearly: 190,
		users: 2,
		activeContacts: 1_000,
		channels: 1,
		teams: 1,
		organizations: 1,
		kbFragments: 200,
		aiCredits: 4_000_000,
		recipientsPerMonth: 1_000,
		campaignEmails: 0,
		voiceMinutes: 0,
		reports: false,
		api: false,
		priorityOnboarding: false,
	},
	{
		id: 'pro',
		name: 'Pro',
		monthly: 35,
		yearly: 350,
		users: 3,
		activeContacts: 3_000,
		channels: 1,
		teams: 1,
		organizations: 1,
		kbFragments: 600,
		aiCredits: 10_000_000,
		recipientsPerMonth: 5_000,
		campaignEmails: 0,
		voiceMinutes: 0,
		reports: true,
		api: false,
		priorityOnboarding: false,
	},
	{
		id: 'business',
		name: 'Business',
		monthly: 89,
		yearly: 890,
		users: 5,
		activeContacts: 10_000,
		channels: 2,
		teams: 1,
		organizations: 1,
		kbFragments: 2_000,
		aiCredits: 30_000_000,
		recipientsPerMonth: null,
		campaignEmails: 0,
		voiceMinutes: 0,
		reports: true,
		api: false,
		priorityOnboarding: false,
	},
];

export const ADDONS = {
	full: {
		activeContacts100: 10,
		user: 15,
		team: 10,
		organization: 79,
		kbFragments500: 15,
		aiCredits1M: 3,
		campaignEmails1000: 2.5,
		voiceMinute: 0.15,
		onboarding: 149,
	},
	ws: {
		activeContacts100: 5,
		user: 10,
		kbFragments500: 15,
		aiCredits1M: 3,
		onboarding: 149,
	},
};

/** Tarifas de referencia de Meta ("resto de Latinoamérica", incluye Ecuador). */
export const META_RATES = {
	marketing: 0.074,
	utility: 0.0113,
	pricingUrl: 'https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing',
};

const numberFormat = new Intl.NumberFormat('es-EC');

export function formatNumber(value: number): string {
	return numberFormat.format(value);
}

/** $59, $2,50, $0,15, $0,0113 */
export function formatUsd(value: number): string {
	const decimals = Number.isInteger(value) ? 0 : Math.max(2, String(value).split('.')[1].length);
	return `$${new Intl.NumberFormat('es-EC', { minimumFractionDigits: decimals }).format(value)}`;
}

/** 500.000, 10M */
export function formatCredits(value: number): string {
	return value >= 1_000_000 && value % 1_000_000 === 0 ? `${value / 1_000_000}M` : formatNumber(value);
}

export function planPrice(plan: Plan, period: 'monthly' | 'yearly' = 'monthly'): string {
	const amount = period === 'monthly' ? plan.monthly : plan.yearly;
	if (amount === 0) return '$0';
	const suffix = period === 'monthly' ? '/mes' : '/año';
	return `${plan.fromPrice ? 'Desde ' : ''}${formatUsd(amount)}${suffix}`;
}

export const fullPlan = (id: string) => FULL_PLANS.find((p) => p.id === id)!;
export const wsPlan = (id: string) => WS_PLANS.find((p) => p.id === id)!;
