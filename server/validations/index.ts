import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const reservationSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(6, 'Maximum 6 tickets per reservation'),
  }),
});

export const confirmBookingSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid('Invalid reservation session ID'),
    paymentMethod: z.string().optional(),
  }),
});
