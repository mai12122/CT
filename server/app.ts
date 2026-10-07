import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import v1Routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { logger } from './utils/logger';

import path from 'path';
import rateLimit from 'express-rate-limit';

const app = express();

// Virtual Waiting Room Middleware (Max 1500 concurrent active sessions)
let activeSessions = 0;
app.use((req: Request, res: Response, next: NextFunction) => {
  if (activeSessions >= 1500) {
    if (req.accepts('html')) {
      return res.status(503).send(`
        <html>
          <head><title>Waiting Room</title></head>
          <body>
            <div style="text-align: center; margin-top: 50px;">
              <h1>Virtual Waiting Room</h1>
              <p>The site is currently experiencing high traffic. Please wait, you are in the queue.</p>
            </div>
          </body>
        </html>
      `);
    } else {
      return res.status(503).json({
        error: 'queue_full',
        message: 'Virtual Waiting Room: High traffic detected. Please try again in a few moments.'
      });
    }
  }

  activeSessions++;
  res.on('finish', () => {
    activeSessions--;
  });

  next();
});

// Serve static assets with Cache-Control for 304 / CF-Cache-Status: HIT
app.use('/public', express.static(path.join(__dirname, '../public'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

app.use('/assets', express.static(path.join(__dirname, '../assets'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

// Enable CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Rate limiting for ticket purchase endpoints
const purchaseLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // Limit each IP to 10 requests per `window` (here, per second)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after a second'
  }
});

// Apply rate limiter to purchase endpoints (both new and v1 aliases)
app.use(['/api/reserve', '/api/checkout', '/api/v1/reservations', '/api/v1/bookings'], purchaseLimiter);

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Concert Event Management API',
    version: 'v1',
    docs: '/api/v1/health',
  });
});

// Mount v1 API
app.use('/api/v1', v1Routes);

// Catch 404 for undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Global error handler middleware
app.use(errorHandler);

export default app;
