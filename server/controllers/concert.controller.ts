import { Request, Response, NextFunction } from 'express';
import { ConcertService } from '../services/concert.service';

export class ConcertController {
  static async getConcerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, city, featured } = req.query;
      const concerts = await ConcertService.getAllConcerts({
        search: search as string,
        city: city as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      });

      res.status(200).json({
        success: true,
        count: concerts.length,
        data: concerts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConcertById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const concert = await ConcertService.getConcertById(id);

      res.status(200).json({
        success: true,
        data: concert,
      });
    } catch (error) {
      next(error);
    }
  }
}
