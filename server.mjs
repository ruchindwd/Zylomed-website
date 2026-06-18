import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const mime = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.mjs':  'text/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json',
};

http.createServer((req, res) => {
    const rawUrl = req.url === '/' ? '/index.html' : req.url;
    const url = decodeURIComponent(rawUrl);
    const filePath = path.join(__dirname, url.split('?')[0]);
    try {
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        res.end(data);
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
