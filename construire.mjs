// Prépare le dossier « site/ », prêt à mettre en ligne :
// page complète, manifeste d'appli, service worker (jeu hors ligne) et icônes PNG générées par le code.
// Utilisation : node construire.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ici = dirname(fileURLToPath(import.meta.url));
const sortie = join(ici, 'site');
mkdirSync(sortie, { recursive: true });

/* ——— 1. La page ——— */
const source = readFileSync(join(ici, 'jeu.html'), 'utf8');
const titre = source.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>Orbite</title>';
const style = source.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? '';
const corps = source.replace(titre, '').replace(style, '').replace(/<meta name="claude:[^>]*>\s*/g, '').trim();
const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${titre}
<meta name="description" content="Glisse d’astre en astre, sans fin. Un jeu néon jouable hors ligne.">
<meta name="theme-color" content="#04050d">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icone.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icone-192.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Orbite">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${style}
</head>
<body>
${corps}
</body>
</html>
`;

/* ——— 2. Les icônes (PNG encodé à la main, sans dépendance) ——— */
const tableCrc = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = tableCrc[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloc(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(taille, pixel) {
  // RVB sans transparence, filtre « Up » par ligne : les dégradés se compressent bien mieux.
  const ligne = taille * 3 + 1;
  const brut = Buffer.alloc(ligne * taille);
  let dessus = new Uint8Array(taille * 3);
  for (let y = 0; y < taille; y++) {
    const rangee = new Uint8Array(taille * 3);
    for (let x = 0; x < taille; x++) rangee.set(pixel((x + 0.5) / taille, (y + 0.5) / taille, taille), x * 3);
    brut[y * ligne] = 2;
    for (let i = 0; i < rangee.length; i++) brut[y * ligne + 1 + i] = (rangee[i] - dessus[i]) & 255;
    dessus = rangee;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloc('IHDR', ihdr), bloc('IDAT', deflateSync(brut, { level: 9 })), bloc('IEND', Buffer.alloc(0)),
  ]);
}
const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// Une orbite néon, son astre et la comète avec sa traîne. « e » réduit le dessin (zone sûre des icônes adaptatives).
function icone(e) {
  const cx = 0.5, cy = 0.52, R = 0.3 * e, ang = -0.7;
  const kx = cx + Math.cos(ang) * R, ky = cy + Math.sin(ang) * R;
  return (u, v, n) => {
    const px = 1 / n;
    const dc = Math.hypot(u - 0.5, v - 0.45), fond = Math.max(0, 0.7 - dc);
    let r = 4 + 16 * fond, g = 5 + 20 * fond, b = 13 + 44 * fond;
    const d = Math.hypot(u - cx, v - cy);
    const anneau = Math.exp(-(((d - R) / (0.011 * e + px)) ** 2)) * 0.8 + 0.25 * Math.exp(-(((d - R) / (0.05 * e)) ** 2));
    r += 62 * anneau; g += 242 * anneau; b += 255 * anneau;
    let derriere = (Math.atan2(v - cy, u - cx) - ang) % (Math.PI * 2);
    if (derriere < 0) derriere += Math.PI * 2;
    if (derriere < 1.5) {
      const tr = (1 - derriere / 1.5) ** 1.5 * Math.exp(-(((d - R) / (0.02 * e + px)) ** 2));
      r += 190 * tr; g += 250 * tr; b += 255 * tr;
    }
    const pr = 0.085 * e, coeur = lisse(pr + px, pr - px, d), halo = Math.exp(-((d / (0.17 * e)) ** 2)) * 0.35;
    r += 40 * halo + 215 * coeur; g += 160 * halo + 225 * coeur; b += 200 * halo + 240 * coeur;
    const dk = Math.hypot(u - kx, v - ky), tete = lisse(0.03 * e + px, 0.03 * e - px, dk), eclat = Math.exp(-((dk / (0.075 * e)) ** 2));
    r += 160 * eclat + 255 * tete; g += 240 * eclat + 255 * tete; b += 255 * eclat + 255 * tete;
    return [Math.min(255, r) | 0, Math.min(255, g) | 0, Math.min(255, b) | 0];
  };
}
const icones = {
  'icone-192.png': png(192, icone(1)),
  'icone-512.png': png(512, icone(1)),
  'icone-maskable.png': png(512, icone(0.78)),
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#04050d"/><circle cx="32" cy="33" r="19" fill="none" stroke="#3ef2ff" stroke-width="2.5"/><circle cx="32" cy="33" r="5.5" fill="#dbe8ff"/><circle cx="46.5" cy="20.8" r="3.6" fill="#fff"/></svg>\n`;

/* ——— 3. Manifeste et service worker ——— */
const manifeste = {
  name: 'Orbite',
  short_name: 'Orbite',
  description: 'Glisse d’astre en astre, sans fin. Jouable hors ligne.',
  lang: 'fr',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#04050d',
  theme_color: '#04050d',
  icons: [
    { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icone-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'icone.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
};
const manifesteTexte = JSON.stringify(manifeste, null, 2) + '\n';
// La version change dès que le jeu change : les téléphones récupèrent alors la mise à jour, une seule fois.
const version = createHash('sha1').update(page).update(manifesteTexte).update(svg).digest('hex').slice(0, 10);
const sw = `// Généré par construire.mjs : met le jeu en cache pour qu'il fonctionne sans connexion.
const CACHE = 'orbite-${version}';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icone.svg', './icone-192.png', './icone-512.png', './icone-maskable.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k.startsWith('orbite-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// D'abord le cache (zéro donnée), le réseau seulement pour ce qui manque. Le classement en ligne n'est jamais mis en cache.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((trouve) => trouve || fetch(req).then((rep) => {
      if (rep.ok && rep.type === 'basic') {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie));
      }
      return rep;
    }).catch(() => caches.match('./index.html')))
  );
});
`;

/* ——— 4. Écriture ——— */
const fichiers = {
  'index.html': page,
  'manifest.webmanifest': manifesteTexte,
  'sw.js': sw,
  'icone.svg': svg,
  ...icones,
};
let total = 0;
for (const [nom, contenu] of Object.entries(fichiers)) {
  writeFileSync(join(sortie, nom), contenu);
  const ko = Buffer.byteLength(contenu) / 1024;
  total += ko;
  console.log(`  ${nom.padEnd(22)} ${ko.toFixed(1).padStart(6)} Ko`);
}
console.log(`  ${'total'.padEnd(22)} ${total.toFixed(1).padStart(6)} Ko  (version ${version})`);
