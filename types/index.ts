export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  role: 'USER' | 'ADMIN';
  authProvider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'PHONE';
  avatar?: string;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  description?: string;
  perks: string[];
  totalCapacity: number;
  soldCount: number;
  activeReserved: number;
  available: number;
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  description: string;
  venue: string;
  city: string;
  date: string;
  imageUrl: string;
  featured: boolean;
  status: string;
  startingPrice: number;
  totalAvailable: number;
  categories: TicketCategory[];
}

export interface ReservationSession {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  concertId: string;
  concertTitle: string;
  artist: string;
  venue: string;
  date: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  remainingSeconds: number;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  seat?: string;
  price: number;
  status: 'VALID' | 'USED' | 'CANCELLED';
  usedAt?: string;
  createdAt: string;
  bookingRef: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
    description?: string;
  };
  concert?: {
    id: string;
    title: string;
    artist: string;
    venue: string;
    city: string;
    date: string;
    imageUrl: string;
  };
}

export interface Booking {
  id: string;
  bookingRef: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  concert: Concert;
  tickets: Ticket[];
}
