const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 8080;
const host = '127.0.0.1';

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relativePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.join(root, relativePath);

  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/index.html`);
});
