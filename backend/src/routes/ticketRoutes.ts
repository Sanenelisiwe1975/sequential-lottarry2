import express from 'express';
import {
  getTicketById,
  getTicketsByPlayer,
  getTicketsByRound,
  getPlayerTicketsForRound,
} from '../controllers/ticketController';

const router = express.Router();

router.get('/:ticketId', getTicketById);
router.get('/player/:address', getTicketsByPlayer);
router.get('/round/:roundId', getTicketsByRound);
router.get('/player/:address/round/:roundId', getPlayerTicketsForRound);

export default router;
