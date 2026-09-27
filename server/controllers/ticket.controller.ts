import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

export class TicketController {
  static async getMyTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const tickets = await BookingService.getUserTickets(req.user.userId);

      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { id } = req.params;

      const ticket = await BookingService.getTicketById(id, req.user.userId);

      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
}
