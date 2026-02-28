import express from 'express';
import roundRoutes from './roundRoutes';
import ticketRoutes from './ticketRoutes';
import userRoutes from './userRoutes';
import statsRoutes from './statsRoutes';

const router = express.Router();

router.use('/rounds', roundRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
