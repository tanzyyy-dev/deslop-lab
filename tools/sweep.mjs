// Multi-size check of one step's site (17 common device sizes, served under /deslop-lab/).
// Reports horizontal overflow and how much the hero text column overlaps the hero image.
// usage: node tools/sweep.mjs step-12 [out-dir-for-screenshots]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [step = 'step-12', outDir] = process.argv.slice(2);
const port = 4181;
const sizes = [[320, 568], [360, 780], [390, 844], [430, 932], [600, 960], [744, 1133], [768, 1024], [820, 1180], [912, 1368],
  [1024, 768], [1024, 1366], [1180, 820], [1200, 800], [1280, 800], [1366, 900], [1440, 900], [1920, 1080]];
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
let bad = 0;
try {
  for (const [w, h] of sizes) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: w < 1280, isMobile: w < 1024, reducedMotion: 'reduce' });
    await page.goto(`http://localhost:${port}/deslop-lab/steps/${step}/`, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => {
      const img = document.querySelector('.hero img')?.getBoundingClientRect();
      const copy = document.querySelector('.hero-copy')?.getBoundingClientRect();
      let overlap = null;
      if (img && copy) {
        const ox = Math.max(0, Math.min(img.right, copy.right) - Math.max(img.left, copy.left));
        const oy = Math.max(0, Math.min(img.bottom, copy.bottom) - Math.max(img.top, copy.top));
        overlap = Math.round((100 * ox * oy) / (img.width * img.height));
      }
      return { overflow: document.documentElement.scrollWidth - innerWidth, heroOverlapPct: overlap };
    });
    if (m.overflow > 0) bad++;
    console.log(`${String(w).padStart(4)}x${h}  overflow=${m.overflow}px  hero text/image overlap=${m.heroOverlapPct}%`);
    if (outDir) await page.screenshot({ path: path.join(outDir, `${step}-${w}x${h}.jpg`), type: 'jpeg', quality: 70 });
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
if (bad) process.exitCode = 1;
