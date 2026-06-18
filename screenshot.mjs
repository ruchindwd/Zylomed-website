import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const outDir = path.join(process.cwd(), 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Find next available N so we never overwrite
let n = 1;
while (true) {
    const candidate = label
        ? path.join(outDir, `screenshot-${n}-${label}.png`)
        : path.join(outDir, `screenshot-${n}.png`);
    if (!fs.existsSync(candidate)) { n = candidate; break; }
    n++;
}

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.screenshot({ path: n, fullPage: true });
await browser.close();

console.log('Screenshot saved:', n);
