import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret_123',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_123',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  reservationExpiryMinutes: parseInt(process.env.RESERVATION_EXPIRY_MINUTES || '10', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
