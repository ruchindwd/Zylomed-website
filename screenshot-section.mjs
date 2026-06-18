import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url    = process.argv[2] || 'http://localhost:3000';
const scrollY = parseInt(process.argv[3] || '0');
const label  = process.argv[4] || `scroll${scrollY}`;

const outDir = path.join(process.cwd(), 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let n = 1;
while (true) {
    const candidate = path.join(outDir, `screenshot-${n}-${label}.png`);
    if (!fs.existsSync(candidate)) { n = candidate; break; }
    n++;
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll to trigger IntersectionObserver on all elements, then snap to target
await page.evaluate(async () => {
    await new Promise(resolve => {
        let y = 0;
        const step = () => {
            window.scrollTo(0, y);
            y += 600;
            if (y < document.body.scrollHeight) requestAnimationFrame(step);
            else { window.scrollTo(0, 0); resolve(); }
        };
        requestAnimationFrame(step);
    });
    await new Promise(r => setTimeout(r, 900));
});

await page.evaluate((sy) => window.scrollTo(0, sy), scrollY);
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: n, fullPage: false });
await browser.close();
console.log('Screenshot saved:', n);
