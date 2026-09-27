import { Router } from 'express';
import authRoutes from './auth.routes';
import concertRoutes from './concert.routes';
import reservationRoutes from './reservation.routes';
import bookingRoutes from './booking.routes';
import ticketRoutes from './ticket.routes';

const router = Router();

// Version 1 API routes
router.use('/auth', authRoutes);
router.use('/concerts', concertRoutes);
router.use('/reservations', reservationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/tickets', ticketRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

export default router;
