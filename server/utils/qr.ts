import crypto from 'crypto';

export interface TicketQRPayload {
  ticketId: string;
  ticketNumber: string;
  bookingRef: string;
  concertId: string;
  concertTitle: string;
  category: string;
  seat: string | null;
  holderId: string;
  issuedAt: string;
  signature: string;
}

const QR_SECRET = process.env.QR_SECRET || 'concert_qr_signing_secret_key_2026';

export const generateTicketQRPayload = (ticket: {
  id: string;
  ticketNumber: string;
  bookingRef: string;
  concertId: string;
  concertTitle: string;
  categoryName: string;
  seat: string | null;
  userId: string;
}): string => {
  const issuedAt = new Date().toISOString();
  const rawData = `${ticket.id}:${ticket.ticketNumber}:${ticket.bookingRef}:${ticket.userId}:${issuedAt}`;
  const signature = crypto.createHmac('sha256', QR_SECRET).update(rawData).digest('hex').substring(0, 16);

  const payload: TicketQRPayload = {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    bookingRef: ticket.bookingRef,
    concertId: ticket.concertId,
    concertTitle: ticket.concertTitle,
    category: ticket.categoryName,
    seat: ticket.seat,
    holderId: ticket.userId,
    issuedAt,
    signature,
  };

  return JSON.stringify(payload);
};
