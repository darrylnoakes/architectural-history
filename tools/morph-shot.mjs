#!/usr/bin/env node
/**
 * Watch one plot change in the town, in slow motion: a row of screenshots as the model that stood
 * at one year turns into the one standing at another (a new stage, or a revision).
 *
 *   node tools/morph-shot.mjs <region> <plotId> <yearFrom> <yearTo> <outPrefix> [--frames=6] [--orbit=x,y,z,dist,azimuth,polar]
 *
 * Writes <outPrefix>-0.png (before) to <outPrefix>-N.png (after). Uses the dev server (GALLERY_URL,
 * default http://127.0.0.1:5174). The camera frames the plot unless --orbit is given (see
 * tools/town-shot.mjs for what the numbers mean).
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flag = (name) => process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const [region, plot, y0, y1, prefix] = args;
if (!prefix) {
  console.error('usage: node tools/morph-shot.mjs <region> <plotId> <yearFrom> <yearTo> <outPrefix> [--frames=6] [--orbit=x,y,z,dist,azimuth,polar]');
  process.exit(1);
}
const frames = Number(flag('frames') ?? 6);
const orbit = flag('orbit')?.split(',').map(Number);
const base = process.env.GALLERY_URL ?? 'http://127.0.0.1:5174';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 900, height: 620 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/?r=${region}&y=${y0}&q=low`, { waitUntil: 'load' });
await page.waitForFunction('window.__app && window.__app.getState().ready', null, { timeout: 300000 });
await page.evaluate(() => window.__app.setState({ intro: false }));
await page.waitForTimeout(4000);
await page.evaluate((id) => window.__app.getState().select(id, true), plot);
await page.waitForTimeout(3500);
await page.addStyleTag({ content: 'body *:not(canvas):not(:has(canvas)) { visibility: hidden !important; }' });
if (orbit) {
  await page.evaluate((o) => {
    const e = window.__engine();
    const T = e.nav.orbit.target.constructor;
    e.nav.setOrbit(new T(o[0], o[1], o[2]), o[3], o[4], o[5]);
  }, orbit);
  await page.waitForTimeout(2000);
}
// step the town's own clock by hand, so each screenshot is a known moment of the change
await page.evaluate(() => {
  const t = window.__engine().town;
  window.__townUpdate = t.update.bind(t);
  t.update = () => {};
});
await page.screenshot({ path: `${prefix}-0.png` });
console.log(`${prefix}-0.png`);
await page.evaluate((y) => window.__app.getState().setYear(y), Number(y1));
await page.waitForTimeout(1500);
for (let i = 1; i <= frames; i++) {
  // the whole change takes about a second
  await page.evaluate((dt) => window.__townUpdate(dt), i === frames ? 2 : 1.0 / (frames - 1));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-${i}.png` });
  console.log(`${prefix}-${i}.png`);
}
await browser.close();
if (errors.length) console.log([...new Set(errors)].slice(0, 5).join('\n'));
