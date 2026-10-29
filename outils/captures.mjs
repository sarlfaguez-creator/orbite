// Captures d'écran pour les fiches des stores, prises par GitHub (workflow « Captures pour les stores »).
// Joue le jeu avec le pilote automatique de la démo, sur une copie de test servie sur http://localhost:8765.
// Utilisation : node construire.mjs, servir site/ sur le port 8765, puis node outils/captures.mjs fiches
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const OUT = process.argv[2] || 'fiches';
mkdirSync(OUT, { recursive: true });

// La copie de test : accès à l'état du jeu et pilote automatique activable pendant une vraie partie.
let page = readFileSync('www/index.html', 'utf8');
for (const [a, b] of [
  ["'use strict';", "'use strict';\n  window.__jeu = () => ({ G, S });"],
  ['if (G.demo) autopilot();', 'if (G.demo || window.__bot) autopilot();'],
]) {
  if (!page.includes(a)) throw new Error('jeu.html a changé, à adapter : ' + a);
  page = page.replace(a, b);
}
writeFileSync('site/capture.html', page);

const chrome = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome']
  .find((c) => c && existsSync(c));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--mute-audio'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const IOS = { width: 440, height: 956, deviceScaleFactor: 3, isMobile: true, hasTouch: true };   // 1320 × 2868
const PLAY = { width: 360, height: 720, deviceScaleFactor: 3, isMobile: true, hasTouch: true };  // 1080 × 2160
const p = await browser.newPage();
p.on('pageerror', (e) => console.log('ERREUR PAGE', e.message));
await p.setViewport(IOS);
await p.goto('http://localhost:8765/capture.html', { waitUntil: 'load' });
const js = (f, ...a) => p.evaluate(f, ...a);
const until = async (f, max = 120000) => { const t = Date.now(); while (!(await js(f))) { if (Date.now() - t > max) throw new Error('délai : ' + f); await sleep(250); } };
async function shot(nom, figer = true) {
  if (figer) await js(() => { window.__jeu().G.paused = true; });
  for (const [plateforme, vue] of [['iphone', IOS], ['android', PLAY]]) {
    await p.setViewport(vue); await sleep(500);
    await p.screenshot({ path: `${OUT}/${plateforme}-${nom}.png` });
  }
  await p.setViewport(IOS); await sleep(300);
  if (figer) await js(() => { window.__jeu().G.paused = false; });
  console.log('capture', nom);
}
const clic = (sel) => js((s) => document.querySelector(s).click(), sel);

await sleep(4000);
await shot('1-menu', false);

await clic('#btn-zen');
await js(() => { window.__bot = true; });
await until(() => window.__jeu().G.combo >= 14);
await sleep(350);
await shot('2-voyage');
await js(() => { window.__bot = false; });
await js(() => { document.querySelector('#btn-pause').click(); });
await clic('#btn-terminer');
await sleep(300);
await clic('#bilan-menu');

await clic('#btn-defi');
await js(() => { window.__bot = true; });
await until(() => document.querySelector('#ecran-defi').hidden === false, 240000);
await clic('#defi-rejouer');
await until(() => window.__jeu().G.daily.reached >= 14, 240000);
await sleep(350);
await shot('3-defi');
await until(() => document.querySelector('#ecran-defi').hidden === false, 240000);
await sleep(600);
await shot('4-defi-termine', false);
await js(() => { window.__bot = false; });

await clic('#defi-menu');
await js(() => { window.__jeu().S.dust += 3200; });
await clic('[data-ouvre="apparences"]');
const appar = async (n) => js((n) => [...document.querySelectorAll('#grille-apparences .apparence')].find((b) => b.textContent.includes(n)).click(), n);
await appar('Fuchsia'); await appar('Fuchsia');
await appar('Aurore'); await appar('Aurore');
await appar('Braise'); await appar('Braise');
await appar('Aurore');
await js(() => { document.querySelector('#apparences-msg').textContent = ''; });
await sleep(300);
await shot('5-apparences', false);
await clic('#ecran-apparences [data-retour]');
await clic('[data-ouvre="succes"]');
await sleep(300);
await shot('6-succes', false);
await clic('#ecran-succes [data-retour]');

// Image de présentation du Play Store (1024 × 500) : le logo sur la démo du menu.
const f = await browser.newPage();
await f.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
await f.goto('http://localhost:8765/capture.html', { waitUntil: 'load' });
await f.addStyleTag({ content: '.actions, .menu-ligne, .menu-pied, .astuce { display: none !important; } .logo { font-size: 96px; }' });
await sleep(5000);
await f.screenshot({ path: `${OUT}/play-image-presentation.png` });
console.log('capture image de présentation');
await browser.close();
