// Genera public/og.png (1200×630), la imagen al compartir enlaces de la doc.
// Uso: node scripts/og-image.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;
const PINK = '#ec4899';

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="${PINK}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${PINK}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="88%" cy="100%" r="45%">
      <stop offset="0%" stop-color="#f472b6" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#09090b"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect width="100%" height="100%" fill="url(#glow2)"/>
  <text x="50%" y="430" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif"
        font-size="52" font-weight="700" fill="#fafafa">Documentación</text>
  <text x="50%" y="490" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif"
        font-size="28" font-weight="500" fill="#a1a1aa">Inbox multicanal, agentes IA, CRM, API y webhooks</text>
  <rect x="${W / 2 - 40}" y="545" width="80" height="4" rx="2" fill="${PINK}"/>
</svg>`);

const logo = await sharp(new URL('../src/assets/logo.png', import.meta.url).pathname)
	.resize({ width: 640 })
	.toBuffer();

await sharp(background)
	.composite([{ input: logo, top: 95, left: (W - 640) / 2 }])
	.png()
	.toFile(new URL('../public/og.png', import.meta.url).pathname);

console.log('public/og.png generado');
