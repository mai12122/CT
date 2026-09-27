import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

export class BookingController {
  static async confirmBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { sessionId, paymentMethod } = req.body;

      const result = await BookingService.confirmBooking(req.user.userId, {
        sessionId,
        paymentMethod,
      });

      res.status(201).json({
        success: true,
        message: 'Booking confirmed and tickets generated successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const bookings = await BookingService.getUserBookings(req.user.userId);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}
