import express from 'express';
import {
  getCurrentRound,
  getRoundById,
  getAllRounds,
  getRoundStats,
  getRoundWinners,
} from '../controllers/roundController';

const router = express.Router();

router.get('/current', getCurrentRound);
router.get('/all', getAllRounds);
router.get('/:roundId', getRoundById);
router.get('/:roundId/stats', getRoundStats);
router.get('/:roundId/winners', getRoundWinners);

export default router;
