const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 5000;
const LOCAL_CLOUDFLARED = path.join(__dirname, '..', 'bin', 'cloudflared.exe');
const cloudflaredCmd = fs.existsSync(LOCAL_CLOUDFLARED) ? LOCAL_CLOUDFLARED : 'cloudflared';

console.log(`\n======================================================`);
console.log(`  TUNNELING BACKEND API (PORT ${PORT}) VIA CLOUDFLARE`);
console.log(`======================================================`);
console.log(`  Target: http://127.0.0.1:${PORT}`);
console.log(`  Connecting to Cloudflare edge...\n`);

const tunnel = spawn(cloudflaredCmd, ['tunnel', '--url', `http://127.0.0.1:${PORT}`]);

let bannerPrinted = false;

tunnel.stderr.on('data', (data) => {
  const text = data.toString();
  const urlMatch = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (urlMatch && !bannerPrinted) {
    bannerPrinted = true;
    const tunnelUrl = urlMatch[0];
    console.log(`\n🎉 ======================================================`);
    console.log(`  ✅ API TUNNEL ONLINE!`);
    console.log(`======================================================`);
    console.log(`  🌐 Public API URL:  ${tunnelUrl}/api/v1`);
    console.log(`  Set in .env:        EXPO_PUBLIC_API_URL=${tunnelUrl}/api/v1`);
    console.log(`======================================================\n`);
  }
});

tunnel.on('close', (code) => {
  console.log(`Tunnel closed with exit code ${code}`);
  process.exit(code || 0);
});
