import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import v1Routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { logger } from './utils/logger';

const app = express();

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
