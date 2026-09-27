import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { confirmBookingSchema } from '../validations';

const router = Router();

router.use(authenticate);

router.post('/confirm', validate(confirmBookingSchema), BookingController.confirmBooking);
router.get('/my-bookings', BookingController.getMyBookings);

export default router;
