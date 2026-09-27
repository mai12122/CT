import app from './app';
import { config } from './config';
import { prisma } from './config/prisma';
import { logger } from './utils/logger';
import { ReservationService } from './services/reservation.service';

const startServer = async () => {
  try {
    // 1. Verify Database connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database successfully.');

    // 2. Start HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`Concert Backend API running on http://localhost:${config.port}`);
      logger.info(`API v1 Base: http://localhost:${config.port}/api/v1`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // 3. Background periodic task for 10-minute reservation expiration
    // Runs every 30 seconds to clean up overdue sessions
    const cleanupInterval = setInterval(async () => {
      try {
        await ReservationService.cleanupExpiredSessions();
      } catch (err: any) {
        logger.error(`Error during automated reservation cleanup: ${err.message}`);
      }
    }, 30000);

    // Initial cleanup on boot
    ReservationService.cleanupExpiredSessions().catch(() => {});

    // 4. Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Closing HTTP server and database connections...`);
      clearInterval(cleanupInterval);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server gracefully terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
};

startServer();
