import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDatabase from './config/database';
import BlockchainListener from './services/blockchainListener';
import AutoRoundManager from './services/autoRoundManager';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

let blockchainListener: BlockchainListener | null = null;
let autoRoundManager: AutoRoundManager | null = null;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start blockchain event listener if enabled
    if (process.env.ENABLE_EVENT_LISTENER === 'true') {
      blockchainListener = new BlockchainListener();
      await blockchainListener.start();
    } else {
      logger.warn('⚠️  Blockchain event listener is disabled');
    }

    // Start auto round manager if enabled
    if (process.env.ENABLE_AUTO_ROUND_MANAGER === 'true') {
      autoRoundManager = new AutoRoundManager();
      await autoRoundManager.start();
    } else {
      logger.warn('⚠️  Auto Round Manager is disabled');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info('═══════════════════════════════════════════');
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      logger.info('═══════════════════════════════════════════');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (blockchainListener) {
    await blockchainListener.stop();
  }
  if (autoRoundManager) {
    autoRoundManager.stop();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  if (blockchainListener) {
    await blockchainListener.stop();
  }
  if (autoRoundManager) {
    autoRoundManager.stop();
  }
  process.exit(0);
});

startServer();
