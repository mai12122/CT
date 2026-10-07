import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { generateTicketQRPayload, TICKET_QR_TTL_MS, verifyTicketQRPayload } from '../utils/qr';
import { logger } from '../utils/logger';

interface ConfirmBookingInput {
  sessionId: string;
  paymentMethod?: string;
}

export class BookingService {
  /**
   * Confirms a booking from an active reservation session using a PostgreSQL transaction
   */
  static async confirmBooking(userId: string, input: ConfirmBookingInput) {
    const { sessionId, paymentMethod = 'CREDIT_CARD' } = input;
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      // 1. Lock and verify reservation session
      const session = await tx.reservationSession.findUnique({
        where: { id: sessionId },
        include: {
          category: {
            include: {
              concert: true,
            },
          },
          user: true,
        },
      });

      if (!session || session.userId !== userId) {
        throw new AppError('Reservation session not found or unauthorized', 404);
      }

      if (session.status !== 'ACTIVE') {
        throw new AppError(`Reservation session is ${session.status.toLowerCase()} and cannot be confirmed.`, 400);
      }

      if (session.expiresAt <= now) {
        await tx.reservationSession.update({
          where: { id: session.id },
          data: { status: 'EXPIRED' },
        });
        throw new AppError('Reservation session has expired (10-minute window exceeded). Please select your tickets again.', 410);
      }

      const { category } = session;
      const concert = category.concert;

      // 2. Lock category row and increment sold count
      const updatedCategory = await tx.ticketCategory.update({
        where: { id: category.id },
        data: {
          soldCount: {
            increment: session.quantity,
          },
        },
      });

      // 3. Generate unique booking reference
      const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // 4. Create Booking record
      const booking = await tx.booking.create({
        data: {
          bookingRef,
          userId,
          concertId: concert.id,
          totalAmount: session.totalPrice,
          status: 'CONFIRMED',
          paymentMethod,
          paymentStatus: 'PAID',
        },
      });

      // 5. Update reservation session to COMPLETED
      await tx.reservationSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          bookingId: booking.id,
        },
      });

      // 6. Generate individual Tickets with seat assignments and QR payload
      const ticketRecords = [];
      const startSeatIndex = updatedCategory.soldCount - session.quantity + 1;

      for (let i = 0; i < session.quantity; i++) {
        const seatNum = startSeatIndex + i;
        const seat =
          category.name.toLowerCase() === 'fanpit'
            ? `Fanpit Standing #${seatNum.toString().padStart(3, '0')}`
            : `Section ${category.name[0]} • Row ${Math.ceil(seatNum / 20)} • Seat ${seatNum}`;

        const ticketNumber = `TKT-${category.name.toUpperCase().substring(0, 4)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const tempId = crypto.randomUUID();

        ticketRecords.push({
          id: tempId,
          ticketNumber,
          bookingId: booking.id,
          userId,
          categoryId: category.id,
          seat,
          price: category.price,
          qrPayload: '',
          status: 'VALID' as const,
        });
      }

      await tx.ticket.createMany({
        data: ticketRecords,
      });

      logger.info(
        `Booking Confirmed: Ref=${bookingRef}, User=${userId}, Concert="${concert.title}", Category=${category.name}, Qty=${session.quantity}, Total=$${session.totalPrice}`
      );

      const createdTickets = await tx.ticket.findMany({
        where: { bookingId: booking.id },
      });

      return {
        booking: {
          id: booking.id,
          bookingRef: booking.bookingRef,
          totalAmount: booking.totalAmount,
          status: booking.status,
          paymentMethod: booking.paymentMethod,
          createdAt: booking.createdAt,
          concert: {
            id: concert.id,
            title: concert.title,
            artist: concert.artist,
            venue: concert.venue,
            city: concert.city,
            date: concert.date,
            imageUrl: concert.imageUrl,
          },
          category: {
            id: category.id,
            name: category.name,
            color: category.color,
            price: category.price,
          },
          tickets: createdTickets,
        },
      };
    });
  }

  /**
   * Get all bookings for the authenticated user
   */
  static async getUserBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        concert: true,
        tickets: {
          include: {
            category: true,
          },
        },
      },
    });

    return bookings;
  }

  /**
   * Get all tickets belonging to the user
   */
  static async getUserTickets(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        booking: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Populate concert information for each ticket
    const concertIds = [...new Set(tickets.map((t) => t.booking.concertId))];
    const concerts = await prisma.concert.findMany({
      where: { id: { in: concertIds } },
    });
    const concertMap = new Map(concerts.map((c) => [c.id, c]));

    return tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      seat: t.seat,
      price: t.price,
      status: t.status,
      bookingRef: t.booking.bookingRef,
      createdAt: t.createdAt,
      user: t.user,
      category: {
        id: t.category.id,
        name: t.category.name,
        color: t.category.color,
      },
      concert: concertMap.get(t.booking.concertId),
    }));
  }

  /**
   * Get single ticket details by ID
   */
  static async getTicketById(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        booking: {
          include: {
            concert: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    if (ticket.userId !== userId) {
      throw new AppError('Unauthorized access to ticket', 403);
    }

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      seat: ticket.seat,
      price: ticket.price,
      status: ticket.status,
      usedAt: ticket.usedAt,
      createdAt: ticket.createdAt,
      bookingRef: ticket.booking.bookingRef,
      user: ticket.user,
      category: {
        id: ticket.category.id,
        name: ticket.category.name,
        color: ticket.category.color,
        description: ticket.category.description,
      },
      concert: ticket.booking.concert,
    };
  }

  /**
   * Issue a short-lived QR payload only when the authenticated owner requests it.
   */
  static async getTicketQrPayload(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        booking: {
          include: {
            concert: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    if (ticket.userId !== userId) {
      throw new AppError('Unauthorized access to ticket', 403);
    }

    if (ticket.status !== 'VALID' || ticket.booking.status !== 'CONFIRMED' || ticket.booking.paymentStatus !== 'PAID') {
      throw new AppError('This ticket is not eligible for entry', 409);
    }

    const now = new Date();
    return {
      payload: generateTicketQRPayload({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        bookingRef: ticket.booking.bookingRef,
        concertId: ticket.booking.concertId,
        concertTitle: ticket.booking.concert.title,
        categoryName: ticket.category.name,
        seat: ticket.seat,
        userId: ticket.userId,
      }, now),
      expiresAt: new Date(now.getTime() + TICKET_QR_TTL_MS).toISOString(),
    };
  }

  /**
   * Verify and atomically redeem a live QR code so it cannot be reused.
   */
  static async redeemTicketQrPayload(value: string) {
    const payload = verifyTicketQRPayload(value);
    if (!payload) {
      throw new AppError('QR code is invalid or expired', 400);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: payload.ticketId },
      include: {
        category: true,
        booking: { include: { concert: true } },
        user: { select: { name: true } },
      },
    });

    if (
      !ticket ||
      ticket.userId !== payload.holderId ||
      ticket.ticketNumber !== payload.ticketNumber ||
      ticket.booking.bookingRef !== payload.bookingRef ||
      ticket.booking.concertId !== payload.concertId ||
      ticket.category.name !== payload.category ||
      ticket.seat !== payload.seat ||
      ticket.status !== 'VALID' ||
      ticket.booking.status !== 'CONFIRMED' ||
      ticket.booking.paymentStatus !== 'PAID'
    ) {
      throw new AppError('Ticket is invalid or not eligible for entry', 409);
    }

    const usedAt = new Date();
    const redeemed = await prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        userId: payload.holderId,
        status: 'VALID',
        usedAt: null,
      },
      data: {
        status: 'USED',
        usedAt,
      },
    });

    if (redeemed.count !== 1) {
      throw new AppError('Ticket has already been used or cancelled', 409);
    }

    return {
      ticketNumber: ticket.ticketNumber,
      bookingRef: ticket.booking.bookingRef,
      ticketHolder: ticket.user.name,
      concertTitle: ticket.booking.concert.title,
      seat: ticket.seat,
      usedAt: usedAt.toISOString(),
    };
  }
}
