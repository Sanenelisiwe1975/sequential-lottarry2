import { ethers } from 'ethers';
import cron from 'node-cron';
import { LOTTERY_ABI } from '../config/abi';
import { initializeProvider, getContractAddress } from '../config/blockchain';
import logger from '../config/logger';

class AutoRoundManager {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;
  private isRunning: boolean = false;

  constructor() {
    this.provider = initializeProvider();
    const contractAddress = getContractAddress();

    // Private key for automated transactions (use a dedicated wallet with small amount of ETH)
    const privateKey = process.env.AUTO_MANAGER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('AUTO_MANAGER_PRIVATE_KEY not set');
    }

    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, LOTTERY_ABI, this.wallet);

    logger.info('🤖 Auto Round Manager initialized');
    logger.info(`📍 Manager wallet: ${this.wallet.address}`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Auto Round Manager already running');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Starting Auto Round Manager...');

    // Check and manage rounds every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      await this.checkAndManageRound();
    });

    // Initial check
    await this.checkAndManageRound();

    logger.info('✅ Auto Round Manager started successfully');
  }

  private async checkAndManageRound(): Promise<void> {
    try {
      const currentRoundId = await this.contract.currentRoundId();

      if (currentRoundId.toString() === '0') {
        // No round exists, start first one
        logger.info('📍 No round exists, starting first round...');
        await this.startNewRound();
        return;
      }

      // Get current round info
      const roundInfo = await this.contract.getCurrentRoundInfo();
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(roundInfo.endTime);
      const isDrawn = roundInfo.isDrawn;

      logger.debug(`Round #${currentRoundId}: Drawn=${isDrawn}, EndTime=${endTime}, Now=${now}`);

      if (!isDrawn && now >= endTime) {
        // Round ended but not drawn
        logger.info(`🎲 Round #${currentRoundId} ended, drawing lottery...`);
        await this.drawLottery();

        // Wait a bit for draw to process
        await this.sleep(30000); // 30 seconds

        // Start new round
        await this.startNewRound();
      } else if (isDrawn) {
        // Round drawn but new one not started
        logger.info('🎯 Round drawn, starting new round...');
        await this.startNewRound();
      } else {
        const timeLeft = endTime - now;
        logger.debug(`⏰ Round #${currentRoundId} active, ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s remaining`);
      }
    } catch (error: any) {
      // Check if error is expected (like "Round not finished")
      if (error.message && error.message.includes('Round not finished')) {
        logger.debug('Round still active, skipping...');
      } else if (error.message && error.message.includes('Already drawn')) {
        logger.debug('Already drawn, will start new round next cycle');
      } else {
        logger.error('Error in round management:', error);
      }
    }
  }

  private async startNewRound(): Promise<void> {
    try {
      logger.info('🎯 Starting new round...');

      const tx = await this.contract.startNewRound({
        gasLimit: 500000,
      });

      logger.info(`📝 Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      logger.info(`✅ New round started! Block: ${receipt.blockNumber}`);

      const currentRoundId = await this.contract.currentRoundId();
      logger.info(`🎰 Round #${currentRoundId} is now active for 5 minutes`);
    } catch (error: any) {
      if (error.message && error.message.includes('Round not finished')) {
        logger.debug('Previous round not finished yet');
      } else {
        logger.error('Error starting new round:', error.message);
      }
    }
  }

  private async drawLottery(): Promise<void> {
    try {
      logger.info('🎲 Drawing lottery with Chainlink VRF...');

      const tx = await this.contract.drawLottery({
        gasLimit: 1000000,
      });

      logger.info(`📝 Draw transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      logger.info(`✅ Lottery drawn! Block: ${receipt.blockNumber}`);
      logger.info('⏳ Waiting for Chainlink VRF to provide random numbers...');

      // Note: Actual winning numbers will be set by VRF callback
      // This can take 20-60 seconds depending on network
    } catch (error: any) {
      if (error.message && error.message.includes('Not ended')) {
        logger.debug('Round not ended yet');
      } else if (error.message && error.message.includes('Already drawn')) {
        logger.debug('Already drawn');
      } else {
        logger.error('Error drawing lottery:', error.message);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
    logger.info('🛑 Auto Round Manager stopped');
  }
}

export default AutoRoundManager;
