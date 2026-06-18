import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const mime = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml' };

// Start server
const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, url.split('?')[0]);
    try {
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        res.end(data);
    } catch { res.writeHead(404); res.end('Not found'); }
});

await new Promise(r => server.listen(PORT, r));
console.log(`Server up on ${PORT}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle2' });

// Scroll through entire page to trigger IntersectionObserver on all elements
await page.evaluate(async () => {
    const total = document.body.scrollHeight;
    let y = 0;
    while (y < total) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 50));
        y += 400;
    }
    window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 1400));

// Force all fade-up elements visible so no card is caught mid-animation
await page.evaluate(() => {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 700));

const sections = [
    { name: 'hero',         y: 0    },
    { name: 'about',        y: 986  },
    { name: 'therapeutic',  y: 1848 },
    { name: 'products-top', y: 2659 },
    { name: 'products-mid', y: 3500 },
    { name: 'pillars',      y: 4650 },
    { name: 'quality',      y: 5192 },
    { name: 'expanding',    y: 5950 },
    { name: 'contact',      y: 6470 },
    { name: 'footer',       y: 7350 },
];

for (const s of sections) {
    await page.evaluate((y) => window.scrollTo(0, y), s.y);
    await new Promise(r => setTimeout(r, 500));

    // Find next available filename
    let n = 1;
    let outPath;
    while (true) {
        outPath = path.join(outDir, `screenshot-${n}-${s.name}.png`);
        if (!fs.existsSync(outPath)) break;
        n++;
    }
    await page.screenshot({ path: outPath, fullPage: false });
    console.log('Saved:', outPath);
}

await browser.close();
server.close();
console.log('Done.');
