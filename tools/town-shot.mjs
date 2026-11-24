#!/usr/bin/env node
/**
 * Screenshot the town itself (not one building on its own), to check how a building sits in it.
 *
 *   node tools/town-shot.mjs <region> <year> <out.png> [--select=<plotId>] [--orbit=x,y,z,dist,azimuth,polar]
 *
 * Uses the dev server (GALLERY_URL, default http://127.0.0.1:5174). --select opens a plot's card and
 * frames it; --orbit then puts the camera where you want it: looking at (x, y, z) from `dist` metres,
 * `azimuth` radians (0 puts the camera south of the point, looking north; 1.57 puts it to the east,
 * looking west; 3.14 to the north), `polar` radians down from straight overhead (1.45 is near
 * ground level). Several --orbit flags give several shots, numbered.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const [region, year, out] = args;
if (!region || !year || !out) {
  console.error('usage: node tools/town-shot.mjs <region> <year> <out.png> [--select=<plotId>] [--orbit=x,y,z,dist,azimuth,polar]');
  process.exit(1);
}
const select = flags.find((f) => f.startsWith('--select='))?.slice(9);
const orbits = flags.filter((f) => f.startsWith('--orbit=')).map((f) => f.slice(8).split(',').map(Number));
const base = process.env.GALLERY_URL ?? 'http://127.0.0.1:5174';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/?r=${region}&y=${year}&q=low`, { waitUntil: 'load' });
await page.waitForFunction('window.__app && window.__app.getState().ready', null, { timeout: 300000 });
await page.evaluate(() => window.__app.setState({ intro: false }));
await page.waitForTimeout(5000);
if (select) {
  await page.evaluate((id) => window.__app.getState().select(id, true), select);
  await page.waitForTimeout(3500);
}
// hide the panels so the whole picture is the town
await page.addStyleTag({ content: 'body *:not(canvas):not(:has(canvas)) { visibility: hidden !important; }' });
const shots = orbits.length ? orbits : [null];
for (let i = 0; i < shots.length; i++) {
  const o = shots[i];
  if (o) {
    await page.evaluate(([x, y, z, d, az, pol]) => {
      const e = window.__engine();
      const T = e.nav.orbit.target.constructor;
      e.nav.setOrbit(new T(x, y, z), d, az, pol);
    }, o);
    await page.waitForTimeout(2500);
  }
  const file = shots.length > 1 ? out.replace(/\.png$/, `-${i + 1}.png`) : out;
  await page.screenshot({ path: file, timeout: 300000 });
  console.log(file);
}
await browser.close();
if (errors.length) console.log([...new Set(errors)].slice(0, 5).join('\n'));
