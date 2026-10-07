const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading asset');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`  CT LIVE — CLOUDFLARE SELF-HOSTING DEMO SERVER`);
  console.log(`======================================================`);
  console.log(`  Local URL:  http://localhost:${PORT}`);
  console.log(`  Binding:    127.0.0.1 (Strictly Loopback — Zero Public Ingress)`);
  console.log(`\n  Run in a separate terminal:`);
  console.log(`  cloudflared tunnel --url http://localhost:${PORT}\n`);
});
