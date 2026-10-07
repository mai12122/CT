import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { scanTicketQrSchema } from '../validations';

const router = Router();

router.use(authenticate);

router.post('/scan', authorize('ADMIN'), validate(scanTicketQrSchema), TicketController.scanTicketQr);
router.get('/my-tickets', TicketController.getMyTickets);
router.get('/:id/qr', TicketController.getTicketQr);
router.get('/:id', TicketController.getTicketById);

export default router;
