import express from 'express';
import {
  getGlobalStats,
  getRecentActivity,
  getNumberFrequency,
} from '../controllers/statsController';

const router = express.Router();

router.get('/global', getGlobalStats);
router.get('/activity', getRecentActivity);
router.get('/numbers/frequency', getNumberFrequency);

export default router;
