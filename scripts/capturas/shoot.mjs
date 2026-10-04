// Uso: node shoot.mjs <out-dir> <ruta>[=nombre] ...
// Inicia sesión en el frontend local con la cuenta demo y captura cada ruta.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3010';
const EMAIL = 'laura@demo.snappli.io';
const [outDir, ...targets] = process.argv.slice(2);
const profileDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'chrome-profile');
const theme = process.env.THEME ?? 'dark';

const browser = await puppeteer.launch({
	executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	headless: 'new',
	userDataDir: profileDir,
	defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);

async function ensureLogin() {
	await page.goto(`${BASE}/manage`, { waitUntil: 'networkidle2' });
	if (!page.url().includes('/login')) return;
	let devCode = null;
	page.on('response', async (res) => {
		if (res.url().includes('/auth/email/otp/request')) {
			try {
				devCode = (await res.json()).devCode;
			} catch {}
		}
	});
	await page.waitForSelector('input[type="email"]');
	await page.type('input[type="email"]', EMAIL);
	await page.keyboard.press('Enter');
	for (let i = 0; i < 50 && !devCode; i++) await new Promise((r) => setTimeout(r, 200));
	if (!devCode) throw new Error('No llegó el código OTP');
	await page.waitForSelector('input[autocomplete="one-time-code"], input[inputmode="numeric"]');
	await page.click('input[autocomplete="one-time-code"], input[inputmode="numeric"]');
	await page.keyboard.type(devCode, { delay: 40 });
	await page.keyboard.press('Enter');
	try {
		await page.waitForFunction(() => !location.pathname.includes('/login'), { timeout: 60000 });
	} catch (e) {
		fs.mkdirSync(outDir, { recursive: true });
		await page.screenshot({ path: path.join(outDir, 'login-fail.png') });
		console.log('login-fail', page.url(), devCode);
		throw e;
	}
	await page.waitForNetworkIdle({ idleTime: 800 });
}

await ensureLogin();
fs.mkdirSync(outDir, { recursive: true });
for (const t of targets) {
	const [route, name = route.replace(/\W+/g, '_')] = t.split('::');
	await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2' });
	await new Promise((r) => setTimeout(r, 1500));
	await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
	await page.evaluate(() => {
		for (const el of document.querySelectorAll('body *')) {
			if (el.children.length === 0 && /Softphone/.test(el.textContent ?? '')) {
				(el.closest('[role="status"], li, div') ?? el).style.display = 'none';
			}
		}
	});
	await new Promise((r) => setTimeout(r, 300));
	const file = path.join(outDir, `${name}.png`);
	await page.screenshot({ path: file });
	console.log(file, page.url());
}
await browser.close();
