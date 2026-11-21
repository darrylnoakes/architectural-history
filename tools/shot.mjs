#!/usr/bin/env node
/**
 * Screenshot buildings from the gallery page.
 *
 *   node tools/shot.mjs <lineage> [buildingId|all|row] [views] [--seed=N]
 *   node tools/shot.mjs extra <buildingId> [views]
 *
 *   node tools/shot.mjs home roundhouse            -> shots/home/roundhouse-iso.png, -front.png
 *   node tools/shot.mjs home roundhouse iso,back,eye
 *   node tools/shot.mjs home all                   -> every stage, iso + front
 *   node tools/shot.mjs home row                   -> one wide image of the whole lineage
 *   node tools/shot.mjs italy/home all             -> a lineage of another region (shots/italy/home/)
 *
 * Needs the dev server: `pnpm dev` (http://127.0.0.1:5173), or set GALLERY_URL to another one.
 * At most three screenshots run at once across all callers, so several authors can share a machine.
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.GALLERY_URL ?? 'http://127.0.0.1:5173';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')),
);
const [target, which = 'all', viewArg] = args;
const [region, lineage] = target?.includes('/') ? target.split('/') : ['england', target];
if (!lineage) {
  console.error('usage: node tools/shot.mjs <lineage> [buildingId|all|row] [views]');
  process.exit(1);
}

// --- a small cross-process queue: software WebGL is slow, and ten browsers at once are slower still
const SLOTS = 3;
const slotDir = (i) => resolve(tmpdir(), `ah-shot-slot-${i}`);
let slot = -1;
async function acquire() {
  for (;;) {
    for (let i = 0; i < SLOTS; i++) {
      try {
        mkdirSync(slotDir(i));
        slot = i;
        return;
      } catch {
        // a slot abandoned by a crashed run is reclaimed after five minutes
        try {
          if (Date.now() - statSync(slotDir(i)).mtimeMs > 300000) rmdirSync(slotDir(i));
        } catch {}
      }
    }
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
  }
}
function release() {
  if (slot < 0) return;
  try {
    rmdirSync(slotDir(slot));
  } catch {}
  slot = -1;
}
process.on('exit', release);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));
await acquire();

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const outDir = region === 'england' ? resolve(root, 'shots', lineage) : resolve(root, 'shots', region, lineage);
mkdirSync(outDir, { recursive: true });

async function shoot(params, file, size) {
  // the dev server occasionally reloads the page mid-shot (dependency re-optimisation): try again
  for (let attempt = 0; ; attempt++) {
    try {
      return await shootOnce(params, file, size);
    } catch (e) {
      if (attempt >= 2) throw e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function shootOnce(params, file, size) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  const logs = [];
  page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
  page.on('pageerror', (e) => logs.push(String(e)));
  const url = `${BASE}/gallery.html?${new URLSearchParams({ ...params, region, static: '1' })}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', null, { timeout: 180000 }).catch(() => logs.push('timed out waiting for render'));
  const err = await page.evaluate('window.__error');
  const info = await page.evaluate('window.__info');
  await page.waitForTimeout(250);
  const path = resolve(outDir, file);
  await page.screenshot({ path });
  await page.close();
  if (err) console.error(`ERROR ${file}: ${err}`);
  else if (logs.length) console.error(`console errors for ${file}:\n  ${logs.join('\n  ')}`);
  return { path, info, err };
}

try {
  const seed = flags.seed ?? '1';
  if (lineage === 'extra') {
    const views = (viewArg ?? 'iso,front').split(',');
    for (const view of views) {
      const r = await shoot({ extra: which, view, seed }, `${which}-${view}.png`, { width: 1000, height: 750 });
      console.log(r.path);
      if (view === views[0] && r.info) console.log('  ' + r.info.join('\n  '));
    }
  } else if (which === 'row') {
    const r = await shoot({ lineage, view: viewArg ?? 'iso', seed, marks: '0' }, `_row.png`, { width: 2400, height: 800 });
    console.log(r.path);
    if (r.info) console.log('  ' + r.info.join('\n  '));
  } else {
    let ids = [which];
    if (which === 'all') {
      const page = await browser.newPage();
      await page.goto(`${BASE}/gallery.html?region=${region}&lineage=${lineage}&static=1`, { waitUntil: 'load' });
      await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
      const info = (await page.evaluate('window.__info')) ?? [];
      const err = await page.evaluate('window.__error');
      if (err) console.error(`ERROR: ${err}`);
      ids = info.filter((l) => !l.startsWith('  ')).map((l) => l.split(/\s/)[0]);
      await page.close();
    }
    const views = (viewArg ?? 'iso,front').split(',');
    for (const id of ids) {
      for (const view of views) {
        const r = await shoot({ lineage, id, view, seed }, `${id}-${view}.png`, { width: 1000, height: 750 });
        console.log(r.path);
        if (view === views[0] && r.info) console.log('  ' + r.info.join('\n  '));
      }
    }
  }
} finally {
  await browser.close();
}
