import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { logger } from '../utils/logger';

export class ReservationService {
  /**
   * Cleans up expired sessions across the database
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await prisma.reservationSession.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (result.count > 0) {
      logger.info(`Auto-released ${result.count} expired reservation session(s)`);
    }

    return result.count;
  }

  /**
   * Creates a 10-minute temporary ticket reservation session
   * Uses PostgreSQL transaction + row-level locking to prevent overselling under high concurrency
   */
  static async createReservation(userId: string, categoryId: string, quantity: number) {
    if (quantity < 1 || quantity > 6) {
      throw new AppError('Quantity must be between 1 and 6 tickets per reservation', 400);
    }

    const now = new Date();
    const expiryMinutes = config.reservationExpiryMinutes;
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

    return await prisma.$transaction(async (tx) => {
      // 1. Mark any expired sessions for this category as EXPIRED
      await tx.reservationSession.updateMany({
        where: {
          categoryId,
          status: 'ACTIVE',
          expiresAt: { lte: now },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // 2. Check if user already has an ACTIVE session for this category
      const existingUserSession = await tx.reservationSession.findFirst({
        where: {
          userId,
          categoryId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        include: {
          category: {
            include: { concert: true },
          },
        },
      });

      if (existingUserSession) {
        const remainingSeconds = Math.max(
          0,
          Math.floor((existingUserSession.expiresAt.getTime() - now.getTime()) / 1000)
        );
        throw new AppError(
          `You already have an active reservation session for ${existingUserSession.category.name} (${remainingSeconds}s remaining). Please complete checkout or release it first.`,
          409
        );
      }

      // 3. Row-level lock on the TicketCategory to handle high-demand race conditions & overselling
      const lockedCategories = await tx.$queryRaw<
        Array<{
          id: string;
          name: string;
          price: number;
          totalCapacity: number;
          soldCount: number;
        }>
      >`SELECT id, name, price, "totalCapacity", "soldCount" FROM "ticket_categories" WHERE id = ${categoryId} FOR UPDATE`;

      if (!lockedCategories || lockedCategories.length === 0) {
        throw new AppError('Ticket category not found', 404);
      }

      const category = lockedCategories[0];

      // 4. Calculate current active reserved tickets
      const activeReservations = await tx.reservationSession.findMany({
        where: {
          categoryId,
          status: 'ACTIVE',
          expiresAt: { gt: now },
        },
        select: { quantity: true },
      });

      const totalActiveReserved = activeReservations.reduce((acc, curr) => acc + curr.quantity, 0);
      const availableTickets = category.totalCapacity - category.soldCount - totalActiveReserved;

      if (availableTickets < quantity) {
        throw new AppError(
          availableTickets <= 0
            ? `Sorry, ${category.name} is currently sold out or temporarily held by other buyers.`
            : `Only ${availableTickets} ticket(s) remaining in ${category.name}. Cannot reserve ${quantity}.`,
          400
        );
      }

      // 5. Create reservation session
      const totalPrice = category.price * quantity;

      const session = await tx.reservationSession.create({
        data: {
          userId,
          categoryId,
          quantity,
          totalPrice,
          status: 'ACTIVE',
          expiresAt,
        },
        include: {
          category: {
            include: {
              concert: true,
            },
          },
        },
      });

      logger.info(
        `Reservation created: User ${userId} reserved ${quantity}x ${category.name} for 10 mins (expires ${expiresAt.toISOString()})`
      );

      const remainingSeconds = Math.max(
        0,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
      );

      return {
        session: {
          id: session.id,
          categoryId: session.categoryId,
          categoryName: session.category.name,
          categoryColor: session.category.color,
          concertId: session.category.concert.id,
          concertTitle: session.category.concert.title,
          artist: session.category.concert.artist,
          venue: session.category.concert.venue,
          date: session.category.concert.date,
          imageUrl: session.category.concert.imageUrl,
          unitPrice: session.category.price,
          quantity: session.quantity,
          totalPrice: session.totalPrice,
          status: session.status,
          expiresAt: session.expiresAt,
          remainingSeconds,
        },
      };
    });
  }

  /**
   * Retrieves active reservation session by ID with remaining seconds countdown
   */
  static async getSessionById(sessionId: string, userId: string) {
    const now = new Date();

    const session = await prisma.reservationSession.findUnique({
      where: { id: sessionId },
      include: {
        category: {
          include: {
            concert: true,
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Reservation session not found', 404);
    }

    if (session.status === 'ACTIVE' && session.expiresAt <= now) {
      await prisma.reservationSession.update({
        where: { id: session.id },
        data: { status: 'EXPIRED' },
      });
      session.status = 'EXPIRED';
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000)
    );

    return {
      id: session.id,
      categoryId: session.categoryId,
      categoryName: session.category.name,
      categoryColor: session.category.color,
      concertId: session.category.concert.id,
      concertTitle: session.category.concert.title,
      artist: session.category.concert.artist,
      venue: session.category.concert.venue,
      date: session.category.concert.date,
      imageUrl: session.category.concert.imageUrl,
      unitPrice: session.category.price,
      quantity: session.quantity,
      totalPrice: session.totalPrice,
      status: session.status,
      expiresAt: session.expiresAt,
      remainingSeconds: session.status === 'ACTIVE' ? remainingSeconds : 0,
    };
  }

  /**
   * Releases/cancels an active reservation session early
   */
  static async cancelSession(sessionId: string, userId: string) {
    const session = await prisma.reservationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Reservation session not found', 404);
    }

    if (session.status !== 'ACTIVE') {
      throw new AppError(`Cannot cancel session with status '${session.status}'`, 400);
    }

    await prisma.reservationSession.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    });

    logger.info(`Reservation ${sessionId} cancelled by user ${userId}. Released back to pool.`);

    return { message: 'Reservation session released successfully' };
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserActiveSessions(userId: string) {
    const now = new Date();

    // Expire overdue first
    await prisma.reservationSession.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });

    const sessions = await prisma.reservationSession.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      include: {
        category: {
          include: { concert: true },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      categoryName: s.category.name,
      categoryColor: s.category.color,
      concertId: s.category.concert.id,
      concertTitle: s.category.concert.title,
      artist: s.category.concert.artist,
      venue: s.category.concert.venue,
      date: s.category.concert.date,
      imageUrl: s.category.concert.imageUrl,
      unitPrice: s.category.price,
      quantity: s.quantity,
      totalPrice: s.totalPrice,
      status: s.status,
      expiresAt: s.expiresAt,
      remainingSeconds: Math.max(0, Math.floor((s.expiresAt.getTime() - Date.now()) / 1000)),
    }));
  }
}
