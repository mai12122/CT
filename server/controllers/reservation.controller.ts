import { Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

export class ReservationController {
  static async createReservation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { categoryId, quantity } = req.body;

      const result = await ReservationService.createReservation(
        req.user.userId,
        categoryId,
        parseInt(quantity, 10)
      );

      res.status(201).json({
        success: true,
        message: 'Tickets reserved for 10 minutes. Please complete your checkout before expiration.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { id } = req.params;

      const session = await ReservationService.getSessionById(id, req.user.userId);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { id } = req.params;

      const result = await ReservationService.cancelSession(id, req.user.userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyActiveSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const sessions = await ReservationService.getUserActiveSessions(req.user.userId);

      res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }
}
