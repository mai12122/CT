import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/my-tickets', TicketController.getMyTickets);
router.get('/:id', TicketController.getTicketById);

export default router;
