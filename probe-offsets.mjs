import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
const data = await page.evaluate(() => {
    const ids = ['home','about','therapeutic','products','pillars','quality','expanding','contact'];
    const result = {};
    for (const id of ids) {
        const el = document.getElementById(id);
        result[id] = el ? Math.round(el.offsetTop) : 'NOT FOUND';
    }
    result._totalHeight = document.body.scrollHeight;
    return result;
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
