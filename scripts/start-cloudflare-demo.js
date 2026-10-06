const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Locate cloudflared binary
const LOCAL_CLOUDFLARED = path.join(__dirname, '..', 'bin', 'cloudflared.exe');
const cloudflaredCmd = fs.existsSync(LOCAL_CLOUDFLARED) ? LOCAL_CLOUDFLARED : 'cloudflared';

// 1. Create Web Server for static public assets
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

function launchTunnel() {
  console.log(`\n======================================================`);
  console.log(`  CONNECTING CLOUDFLARE QUICK TUNNEL (cloudflared)...`);
  console.log(`======================================================`);
  console.log(`  Local Origin: http://127.0.0.1:${PORT}`);
  console.log(`  Using binary: ${cloudflaredCmd}`);
  console.log(`  Status: Requesting secure outbound tunnel from Cloudflare edge...\n`);

  const tunnel = spawn(cloudflaredCmd, ['tunnel', '--url', `http://127.0.0.1:${PORT}`]);

  let bannerPrinted = false;

  const handleOutput = (data) => {
    const text = data.toString();
    const urlMatch = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (urlMatch && !bannerPrinted) {
      bannerPrinted = true;
      const tunnelUrl = urlMatch[0];
      console.log(`\n🎉 ======================================================`);
      console.log(`  ✅ CLOUDFLARE TUNNEL IS LIVE & ACTIVE!`);
      console.log(`======================================================`);
      console.log(`  🌐 Public URL:   ${tunnelUrl}`);
      console.log(`  📱 Open this link on your phone or browser to test!`);
      console.log(`  🔒 Security:     Zero public IP, Outbound-only TLS tunnel`);
      console.log(`======================================================\n`);
    } else if (!bannerPrinted) {
      // Print connection progress
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        if (line.includes('INF') || line.includes('Registered')) {
          console.log(`  [Cloudflare] ${line.trim()}`);
        }
      }
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    console.log(`\nCloudflare tunnel process exited with code ${code}`);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log('\nStopping Cloudflare tunnel and local server...');
    tunnel.kill('SIGINT');
    server.close();
    process.exit(0);
  });
}

// 2. Start server, handling already running instance gracefully
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`  CT LIVE — CLOUDFLARE SELF-HOSTING SERVER BOOTED`);
  console.log(`======================================================`);
  console.log(`  Listening on: http://127.0.0.1:${PORT} (Loopback only)`);
  launchTunnel();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[Notice] Port ${PORT} is already in use by a running demo server.`);
    console.log(`Reusing existing port ${PORT} server and launching tunnel directly...`);
    launchTunnel();
  } else {
    console.error('Server error:', err);
  }
});
