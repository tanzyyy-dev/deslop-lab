// Takes full-page screenshots of steps/<id>/index.html at three viewport sizes.
// usage: node tools/screenshot.mjs [step-01 step-02 ...]   (default: all steps)
// Output: screenshots/<id>/{mobile,tablet,desktop}.png  (+ console errors are reported)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viewports = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { width: 1366, height: 900, deviceScaleFactor: 1 },
};
let ids = process.argv.slice(2);
if (!ids.length) ids = fs.readdirSync(path.join(root, 'steps')).filter((d) => /^step-/.test(d)).sort();

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
let problems = 0;
for (const id of ids) {
  const url = pathToFileURL(path.join(root, 'steps', id, 'index.html')).href;
  fs.mkdirSync(path.join(root, 'screenshots', id), { recursive: true });
  for (const [name, vp] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    // reveal scroll-triggered content: scroll through the page once
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: path.join(root, 'screenshots', id, `${name}.png`), fullPage: true });
    const msg = [];
    if (overflow > 0) msg.push(`horizontal overflow ${overflow}px`);
    if (errors.length) msg.push(`errors: ${errors.join(' | ')}`);
    if (msg.length) problems++;
    console.log(`${id} ${name}: ${msg.length ? msg.join('; ') : 'ok'}`);
    await ctx.close();
  }
}
await browser.close();
if (problems) process.exitCode = 1;
