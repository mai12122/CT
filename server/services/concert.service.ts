import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export interface ConcertFilterQuery {
  search?: string;
  city?: string;
  featured?: boolean;
}

export class ConcertService {
  static async getAllConcerts(filters: ConcertFilterQuery = {}) {
    const { search, city, featured } = filters;
    const now = new Date();

    const where: any = {
      ...(featured !== undefined ? { featured } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { artist: { contains: search, mode: 'insensitive' } },
              { venue: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const concerts = await prisma.concert.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            price: true,
            color: true,
            totalCapacity: true,
            soldCount: true,
            perks: true,
            description: true,
            reservationSessions: {
              where: {
                status: 'ACTIVE',
                expiresAt: { gt: now },
              },
              select: { quantity: true },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    return concerts.map((concert) => {
      let lowestPrice = Infinity;
      let totalAvailable = 0;

      const categories = concert.categories.map((cat) => {
        const activeReserved = cat.reservationSessions.reduce((sum, s) => sum + s.quantity, 0);
        const available = Math.max(0, cat.totalCapacity - cat.soldCount - activeReserved);

        if (cat.price < lowestPrice) lowestPrice = cat.price;
        totalAvailable += available;

        let parsedPerks: string[] = [];
        try {
          parsedPerks = JSON.parse(cat.perks);
        } catch {
          parsedPerks = cat.perks ? cat.perks.split(',').map((p) => p.trim()) : [];
        }

        return {
          id: cat.id,
          name: cat.name,
          price: cat.price,
          color: cat.color,
          description: cat.description,
          perks: parsedPerks,
          totalCapacity: cat.totalCapacity,
          soldCount: cat.soldCount,
          activeReserved,
          available,
        };
      });

      return {
        id: concert.id,
        title: concert.title,
        artist: concert.artist,
        description: concert.description,
        venue: concert.venue,
        city: concert.city,
        date: concert.date,
        imageUrl: concert.imageUrl,
        featured: concert.featured,
        status: concert.status,
        startingPrice: lowestPrice === Infinity ? 0 : lowestPrice,
        totalAvailable,
        categories,
      };
    });
  }

  static async getConcertById(id: string) {
    const now = new Date();

    const concert = await prisma.concert.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            reservationSessions: {
              where: {
                status: 'ACTIVE',
                expiresAt: { gt: now },
              },
              select: { quantity: true },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!concert) {
      throw new AppError('Concert not found', 404);
    }

    let lowestPrice = Infinity;
    let totalAvailable = 0;

    const categories = concert.categories.map((cat) => {
      const activeReserved = cat.reservationSessions.reduce((sum, s) => sum + s.quantity, 0);
      const available = Math.max(0, cat.totalCapacity - cat.soldCount - activeReserved);

      if (cat.price < lowestPrice) lowestPrice = cat.price;
      totalAvailable += available;

      let parsedPerks: string[] = [];
      try {
        parsedPerks = JSON.parse(cat.perks);
      } catch {
        parsedPerks = cat.perks ? cat.perks.split(',').map((p) => p.trim()) : [];
      }

      return {
        id: cat.id,
        name: cat.name,
        price: cat.price,
        color: cat.color,
        description: cat.description,
        perks: parsedPerks,
        totalCapacity: cat.totalCapacity,
        soldCount: cat.soldCount,
        activeReserved,
        available,
      };
    });

    return {
      id: concert.id,
      title: concert.title,
      artist: concert.artist,
      description: concert.description,
      venue: concert.venue,
      city: concert.city,
      date: concert.date,
      imageUrl: concert.imageUrl,
      featured: concert.featured,
      status: concert.status,
      startingPrice: lowestPrice === Infinity ? 0 : lowestPrice,
      totalAvailable,
      categories,
    };
  }
}
