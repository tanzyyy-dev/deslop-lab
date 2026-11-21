// Accessibility / quality audit of one step snapshot with axe-core (WCAG 2.2 A/AA rules)
// plus a few extra checks (tap target size, images without size, missing meta).
// usage: node tools/audit.mjs step-08 [--json out.json]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const axeSrc = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const report = {};
for (const [name, vp] of Object.entries({ mobile: [390, 844], desktop: [1366, 900] })) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, hasTouch: name === 'mobile' });
  await page.goto(pathToFileURL(path.join(root, 'steps', id, 'index.html')).href, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(' ')) , count: v.nodes.length }));
  });
  const extra = await page.evaluate(() => {
    const small = [...document.querySelectorAll('a, button, input, [role="button"]')].filter((e) => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (!r.width || cs.visibility === 'hidden' || cs.display === 'none') return false;
      const inline = cs.display === 'inline' && e.closest('p, li, dd');
      return !inline && (r.width < 24 || r.height < 24);
    }).map((e) => `${e.tagName.toLowerCase()}${e.className ? '.' + e.className : ''} "${e.textContent.trim().slice(0, 20)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
    const imgsNoSize = [...document.images].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.getAttribute('src'));
    const meta = {
      description: !!document.querySelector('meta[name="description"]'),
      ogTitle: !!document.querySelector('meta[property="og:title"]'),
      ogImage: !!document.querySelector('meta[property="og:image"]'),
      favicon: !!document.querySelector('link[rel~="icon"]'),
      themeColor: !!document.querySelector('meta[name="theme-color"]'),
      skipLink: !!document.querySelector('a[href="#main"], a.skip-link, a[href^="#"][class*="skip"]'),
      lang: document.documentElement.lang,
    };
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName + ' ' + h.textContent.trim().slice(0, 16));
    const deadLinks = [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#').map((a) => a.textContent.trim().slice(0, 20));
    return { smallTargets: small, imgsNoSize, meta, headings, deadLinks };
  });
  report[name] = { axe, ...extra };
  await page.close();
}
await browser.close();
if (process.argv[3] === '--json') fs.writeFileSync(process.argv[4], JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
