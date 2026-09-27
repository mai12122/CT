import { Router } from 'express';
import { ConcertController } from '../controllers/concert.controller';

const router = Router();

router.get('/', ConcertController.getConcerts);
router.get('/:id', ConcertController.getConcertById);

export default router;
