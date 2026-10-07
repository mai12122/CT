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
  expiresAt: string;
  nonce: string;
  signature: string;
}

export const TICKET_QR_TTL_MS = 5 * 60 * 1000;

const getQrSecret = (): string => {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error('QR_SECRET must be configured before issuing or verifying ticket QR codes');
  }
  return secret;
};

export const generateTicketQRPayload = (ticket: {
  id: string;
  ticketNumber: string;
  bookingRef: string;
  concertId: string;
  concertTitle: string;
  categoryName: string;
  seat: string | null;
  userId: string;
}, now = new Date()): string => {
  const unsignedPayload = {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    bookingRef: ticket.bookingRef,
    concertId: ticket.concertId,
    concertTitle: ticket.concertTitle,
    category: ticket.categoryName,
    seat: ticket.seat,
    holderId: ticket.userId,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TICKET_QR_TTL_MS).toISOString(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const signature = crypto
    .createHmac('sha256', getQrSecret())
    .update(JSON.stringify(unsignedPayload))
    .digest('hex');
  const payload: TicketQRPayload = { ...unsignedPayload, signature };

  return JSON.stringify(payload);
};

export const verifyTicketQRPayload = (
  value: string,
  now = new Date()
): TicketQRPayload | null => {
  let payload: Partial<TicketQRPayload>;
  try {
    payload = JSON.parse(value);
  } catch {
    return null;
  }

  if (
    typeof payload.ticketId !== 'string' ||
    typeof payload.ticketNumber !== 'string' ||
    typeof payload.bookingRef !== 'string' ||
    typeof payload.concertId !== 'string' ||
    typeof payload.concertTitle !== 'string' ||
    typeof payload.category !== 'string' ||
    !(typeof payload.seat === 'string' || payload.seat === null) ||
    typeof payload.holderId !== 'string' ||
    typeof payload.issuedAt !== 'string' ||
    typeof payload.expiresAt !== 'string' ||
    typeof payload.nonce !== 'string' ||
    typeof payload.signature !== 'string'
  ) {
    return null;
  }

  const { signature, ...unsignedPayload } = payload;
  const expectedSignature = crypto
    .createHmac('sha256', getQrSecret())
    .update(JSON.stringify(unsignedPayload))
    .digest();
  const providedSignature = Buffer.from(signature, 'hex');
  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null;
  }

  const issuedAt = Date.parse(payload.issuedAt);
  const expiresAt = Date.parse(payload.expiresAt);
  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    issuedAt > now.getTime() ||
    expiresAt <= now.getTime() ||
    expiresAt - issuedAt !== TICKET_QR_TTL_MS
  ) {
    return null;
  }

  return payload as TicketQRPayload;
};
