import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { reservationSchema } from '../validations';

const router = Router();

router.use(authenticate);

router.post('/', validate(reservationSchema), ReservationController.createReservation);
router.get('/active', ReservationController.getMyActiveSessions);
router.get('/:id', ReservationController.getSession);
router.delete('/:id', ReservationController.cancelSession);

export default router;
