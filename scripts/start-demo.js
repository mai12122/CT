const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const prisma = new PrismaClient();

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Add CORS & origin headers for traceability
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Served-By-Origin', `origin-port-${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = parsedUrl.pathname;

  // 1. Health check endpoint for Load Balancer / Tunnel Probes
  if (pathname === '/health' || pathname === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      port: PORT,
      origin: `http://127.0.0.1:${PORT}`,
      pid: process.pid,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Reserve / Checkout Ticket Endpoint (Simulating real ticket sales with Prisma SQLite)
  if ((pathname === '/api/v1/tickets/reserve' || pathname === '/api/reserve') && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const buyerName = data.buyerName || data.name || 'Anonymous Fan';
      const quantity = parseInt(data.quantity || 1, 10);

      // Find any category with remaining capacity
      const allCategories = await prisma.ticketCategory.findMany({
        include: { concert: true },
        orderBy: { totalCapacity: 'desc' }
      });
      const category = allCategories.find(c => c.soldCount + quantity <= c.totalCapacity);

      if (!category) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'All categories completely sold out' }));
        return;
      }

      // Check capacity
      if (category.soldCount + quantity > category.totalCapacity) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Sold out or insufficient capacity' }));
        return;
      }

      // Find or create demo user
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: buyerName,
            email: `buyer_${Date.now()}@example.com`,
            role: 'USER'
          }
        });
      }

      // Atomic purchase transaction
      const orderRef = `BK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      
      const result = await prisma.$transaction(async (tx) => {
        // Increment sold count
        const updatedCat = await tx.ticketCategory.update({
          where: { id: category.id },
          data: { soldCount: { increment: quantity } }
        });

        // Create booking
        const booking = await tx.booking.create({
          data: {
            bookingRef: orderRef,
            userId: user.id,
            concertId: category.concertId,
            totalAmount: category.price * quantity,
            status: 'CONFIRMED',
            paymentMethod: 'CREDIT_CARD',
            paymentStatus: 'PAID'
          }
        });

        // Create ticket
        const ticketNumber = `TKT-${category.name.toUpperCase().substring(0, 4)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            bookingId: booking.id,
            userId: user.id,
            categoryId: category.id,
            price: category.price,
            status: 'VALID',
            qrPayload: JSON.stringify({ orderRef, ticketNumber, buyer: buyerName })
          }
        });

        return { booking, ticket, remainingCapacity: updatedCat.totalCapacity - updatedCat.soldCount };
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        orderId: result.booking.bookingRef,
        ticketNumber: result.ticket.ticketNumber,
        buyer: buyerName,
        originPort: PORT,
        originPid: process.pid,
        remainingCapacity: result.remainingCapacity,
        timestamp: new Date().toISOString()
      }));
      return;
    } catch (err) {
      console.error(`[Origin ${PORT}] Order error:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }
  }

  // 3. Static Assets serving
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
  console.log(`  CT LIVE — CLOUDFLARE MULTI-ORIGIN DEMO SERVER`);
  console.log(`======================================================`);
  console.log(`  Origin:     Origin-${PORT === 8000 ? 'A' : 'B'}`);
  console.log(`  Local URL:  http://127.0.0.1:${PORT}`);
  console.log(`  Process ID: ${process.pid}`);
  console.log(`  Binding:    127.0.0.1 (Strictly Loopback — Zero Public Ingress)`);
  console.log(`  Endpoints:  GET /health | POST /api/reserve\n`);
});
