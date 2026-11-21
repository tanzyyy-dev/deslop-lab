// End-to-end check of the viewer (index.html) served like the GitHub Pages project site.
// Starts tools/serve.mjs, drives the slider / keyboard / tabs / copy button, and saves
// screenshots of the viewer to screenshots/viewer/. Exits non-zero on any failure.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 4179;
const base = `http://localhost:${port}/deslop-lab/`;
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'pipe' });
await new Promise((r) => server.stdout.once('data', r));

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); };
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
fs.mkdirSync(path.join(root, 'screenshots/viewer'), { recursive: true });

try {
  const n = (await import(path.join(root, 'data/steps.js')).catch(() => null), null);
  const sizes = { mobile: [390, 844], tablet: [820, 1180], desktop: [1440, 900] };
  for (const [name, [w, h]] of Object.entries(sizes)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: name !== 'desktop', isMobile: name === 'mobile', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    const count = await page.evaluate(() => window.DESLOP_STEPS.length);
    ok(count >= 2, `[${name}] steps loaded (${count})`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(overflow <= 0, `[${name}] no horizontal page overflow (${overflow}px)`);
    ok((await page.locator('#frame').getAttribute('src')).endsWith('steps/step-01/index.html'), `[${name}] starts at STEP1`);
    await page.screenshot({ path: path.join(root, `screenshots/viewer/${name}-step-01.jpg`), type: 'jpeg', quality: 80 });

    // slider via keyboard
    await page.locator('#slider').focus();
    await page.keyboard.press('End');
    const last = await page.evaluate(() => window.DESLOP_STEPS.at(-1).id);
    await page.waitForTimeout(300);
    ok((await page.locator('#frame').getAttribute('src')).includes(last), `[${name}] End key on slider jumps to last step`);
    ok(page.url().endsWith(`#${last}`), `[${name}] URL hash follows step`);
    await page.keyboard.press('Home');
    ok((await page.locator('#nowStep').textContent()) === 'STEP 1', `[${name}] Home key returns to STEP 1`);
    // global arrow key
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.locator('#nextBtn').focus();
    await page.keyboard.press('Enter');
    ok((await page.locator('#slider').inputValue()) === '1', `[${name}] next button advances`);
    // tick click (touch on small screens)
    const tick = page.locator('.tick').first();
    if (name === 'desktop') await tick.click(); else await tick.tap();
    ok((await page.locator('#slider').inputValue()) === '0', `[${name}] tick click/tap selects step`);
    // tabs with arrow keys
    await page.locator('#tab-overview').focus();
    await page.keyboard.press('ArrowRight');
    ok(await page.locator('#pane-prompt').isVisible(), `[${name}] tab arrow key shows prompt pane`);
    // copy
    await page.locator('.copy-btn').first().click();
    await page.waitForTimeout(150);
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
    const expected = await page.evaluate(() => window.DESLOP_STEPS[0].prompts[0].text);
    ok(clip === expected, `[${name}] copy button copies the exact prompt`);
    // device switch
    await page.locator('[data-device="mobile"]').click();
    const fw = await page.evaluate(() => document.getElementById('frameBox').style.width);
    ok(fw === '390px', `[${name}] device switch sets frame width (${fw})`);
    await page.locator('[data-device="desktop"]').click();
    // final screenshot at last step with prompt tab
    await page.locator('#slider').focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(root, `screenshots/viewer/${name}-last.jpg`), type: 'jpeg', quality: 80 });
    await page.locator('#tab-overview').click();
    ok(errors.length === 0, `[${name}] no console/network errors ${errors.join(' | ')}`);
    await ctx.close();
  }
  // every step snapshot resolves under the project-site base path
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const steps = await page.evaluate(() => window.DESLOP_STEPS.map((s) => ({ id: s.id, site: s.site, shots: Object.values(s.screenshots) })));
  for (const s of steps) {
    const bad = [];
    const p = await ctx.newPage();
    p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    p.on('pageerror', (e) => bad.push(String(e)));
    await p.goto(base + s.site, { waitUntil: 'networkidle' });
    for (const f of s.shots) { const r = await p.request.get(base + f); if (!r.ok()) bad.push(`${r.status()} ${f}`); }
    ok(bad.length === 0, `${s.id} snapshot + screenshots load under /deslop-lab/ ${bad.join(' | ')}`);
    await p.close();
  }
  await ctx.close();
} finally {
  await browser.close();
  server.kill();
}
if (fails.length) { console.error(`\n${fails.length} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
