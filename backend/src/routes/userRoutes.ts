import express from 'express';
import {
  getUserProfile,
  getUserStats,
  getUserWinnings,
  getTopPlayers,
} from '../controllers/userController';

const router = express.Router();

router.get('/top', getTopPlayers);
router.get('/:address/profile', getUserProfile);
router.get('/:address/stats', getUserStats);
router.get('/:address/winnings', getUserWinnings);

export default router;
