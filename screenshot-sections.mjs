import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

// Full above-the-fold view
await page.screenshot({ path: 'temporary screenshots/hero-full-atf.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

await browser.close();
console.log('done');
