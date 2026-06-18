import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

// Find all spotlight sections
const spots = await page.$$('.spotlight');
console.log('spotlights found:', spots.length);

const boxes = [];
for (const s of spots) {
    const b = await s.boundingBox();
    boxes.push({ y: b.y, h: b.height });
}
console.log(JSON.stringify(boxes));

// Screenshot sections 5 and 6 (Female Healthcare + Nutraceuticals)
const fifth = boxes[4];
const sixth = boxes[5];
const startY = fifth.y - 20;
const endY = sixth.y + sixth.h + 20;

await page.screenshot({
    path: 'temporary screenshots/therapy-new-sections.png',
    clip: { x: 0, y: startY, width: 1440, height: endY - startY }
});

await browser.close();
console.log('done');
