import { ethers } from 'ethers';
import { LOTTERY_ABI } from '../config/abi';
import { initializeProvider, getContractAddress } from '../config/blockchain';
import Round from '../models/Round';
import Ticket from '../models/Ticket';
import Winner from '../models/Winner';
import User from '../models/User';
import logger from '../config/logger';

class BlockchainListener {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;
  private isListening: boolean = false;

  constructor() {
    this.provider = initializeProvider();
    this.contractAddress = getContractAddress();
    this.contract = new ethers.Contract(
      this.contractAddress,
      LOTTERY_ABI,
      this.provider
    );
  }

  async start(): Promise<void> {
    if (this.isListening) {
      logger.warn('Blockchain listener is already running');
      return;
    }

    try {
      logger.info('🎧 Starting blockchain event listener...');

      // Sync historical data first
      await this.syncHistoricalData();

      // Listen to new events
      this.setupEventListeners();

      this.isListening = true;
      logger.info('✅ Blockchain listener started successfully');
    } catch (error) {
      logger.error('❌ Failed to start blockchain listener:', error);
      throw error;
    }
  }

  private async syncHistoricalData(): Promise<void> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = parseInt(process.env.SYNC_FROM_BLOCK || '0') || currentBlock - 10000;

      logger.info(`📊 Syncing historical data from block ${fromBlock} to ${currentBlock}`);

      // Sync all events
      await this.syncTicketPurchases(fromBlock, currentBlock);
      await this.syncLotteryDraws(fromBlock, currentBlock);
      await this.syncWinners(fromBlock, currentBlock);
      await this.syncWinningsClaimed(fromBlock, currentBlock);
      await this.syncNewRounds(fromBlock, currentBlock);

      logger.info('✅ Historical data sync completed');
    } catch (error) {
      logger.error('❌ Error syncing historical data:', error);
      throw error;
    }
  }

  private async syncTicketPurchases(fromBlock: number, toBlock: number): Promise<void> {
    const filter = this.contract.filters.TicketPurchased();
    const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

    logger.info(`Found ${events.length} ticket purchase events`);

    for (const event of events) {
      await this.handleTicketPurchase(event);
    }
  }

  private async syncLotteryDraws(fromBlock: number, toBlock: number): Promise<void> {
    const filter = this.contract.filters.LotteryDrawn();
    const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

    logger.info(`Found ${events.length} lottery draw events`);

    for (const event of events) {
      await this.handleLotteryDrawn(event);
    }
  }

  private async syncWinners(fromBlock: number, toBlock: number): Promise<void> {
    const filter = this.contract.filters.WinnerDetermined();
    const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

    logger.info(`Found ${events.length} winner events`);

    for (const event of events) {
      await this.handleWinnerDetermined(event);
    }
  }

  private async syncWinningsClaimed(fromBlock: number, toBlock: number): Promise<void> {
    const filter = this.contract.filters.WinningsClaimed();
    const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

    logger.info(`Found ${events.length} winnings claimed events`);

    for (const event of events) {
      await this.handleWinningsClaimed(event);
    }
  }

  private async syncNewRounds(fromBlock: number, toBlock: number): Promise<void> {
    const filter = this.contract.filters.NewRoundStarted();
    const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

    logger.info(`Found ${events.length} new round events`);

    for (const event of events) {
      await this.handleNewRound(event);
    }
  }

  private setupEventListeners(): void {
    this.contract.on('TicketPurchased', async (...args) => {
      const event = args[args.length - 1];
      await this.handleTicketPurchase(event);
    });

    this.contract.on('LotteryDrawn', async (...args) => {
      const event = args[args.length - 1];
      await this.handleLotteryDrawn(event);
    });

    this.contract.on('WinnerDetermined', async (...args) => {
      const event = args[args.length - 1];
      await this.handleWinnerDetermined(event);
    });

    this.contract.on('WinningsClaimed', async (...args) => {
      const event = args[args.length - 1];
      await this.handleWinningsClaimed(event);
    });

    this.contract.on('NewRoundStarted', async (...args) => {
      const event = args[args.length - 1];
      await this.handleNewRound(event);
    });

    logger.info('✅ Event listeners registered');
  }

  private async handleTicketPurchase(event: any): Promise<void> {
    try {
      const { player, roundId, numbers } = event.args;
      const block = await event.getBlock();
      const tx = await event.getTransaction();

      const ticketId = `${roundId.toString()}-${tx.hash}`;

      const existingTicket = await Ticket.findOne({ ticketId });
      if (existingTicket) {
        return; // Skip if already processed
      }

      const ticket = new Ticket({
        ticketId,
        roundId: Number(roundId),
        player: player.toLowerCase(),
        numbers: numbers.map((n: bigint) => Number(n)),
        purchasePrice: tx.value.toString(),
        purchasedAt: new Date(block.timestamp * 1000),
        txHash: tx.hash,
        blockNumber: block.number,
      });

      await ticket.save();

      // Update or create user
      await this.updateUser(player.toLowerCase(), {
        ticketsPurchased: 1,
        totalSpent: tx.value.toString(),
        roundId: Number(roundId),
      });

      // Update round ticket count
      await Round.findOneAndUpdate(
        { roundId: Number(roundId) },
        { $inc: { ticketCount: 1 } }
      );

      logger.info(`✅ Ticket purchased: ${ticketId} by ${player}`);
    } catch (error) {
      logger.error('Error handling ticket purchase:', error);
    }
  }

  private async handleLotteryDrawn(event: any): Promise<void> {
    try {
      const { roundId, winningNumbers } = event.args;
      const block = await event.getBlock();

      await Round.findOneAndUpdate(
        { roundId: Number(roundId) },
        {
          winningNumbers: winningNumbers.map((n: bigint) => Number(n)),
          drawnAt: new Date(block.timestamp * 1000),
          txHash: event.transactionHash,
          status: 'drawn',
          isActive: false,
        }
      );

      logger.info(`🎲 Lottery drawn for round ${roundId}: ${winningNumbers}`);
    } catch (error) {
      logger.error('Error handling lottery drawn:', error);
    }
  }

  private async handleWinnerDetermined(event: any): Promise<void> {
    try {
      const { roundId, player, matchCount, prize } = event.args;

      const round = await Round.findOne({ roundId: Number(roundId) });
      if (!round || !round.winningNumbers) {
        logger.warn(`Round ${roundId} not found or has no winning numbers`);
        return;
      }

      // Find the ticket
      const ticket = await Ticket.findOne({
        roundId: Number(roundId),
        player: player.toLowerCase(),
      });

      if (!ticket) {
        logger.warn(`Ticket not found for player ${player} in round ${roundId}`);
        return;
      }

      const tier = Number(matchCount) - 1; // Convert matches to tier

      const winner = new Winner({
        roundId: Number(roundId),
        ticketId: ticket.ticketId,
        player: player.toLowerCase(),
        tier,
        matches: Number(matchCount),
        prizeAmount: prize.toString(),
        winningNumbers: round.winningNumbers,
        playerNumbers: ticket.numbers,
        claimed: false,
      });

      await winner.save();

      // Update ticket
      await Ticket.findByIdAndUpdate(ticket._id, {
        matches: Number(matchCount),
        prizeAmount: prize.toString(),
      });

      logger.info(`🏆 Winner determined: ${player} won ${ethers.formatEther(prize)} ETH`);
    } catch (error) {
      logger.error('Error handling winner determined:', error);
    }
  }

  private async handleWinningsClaimed(event: any): Promise<void> {
    try {
      const { player, amount } = event.args;
      const block = await event.getBlock();

      await Winner.updateMany(
        { player: player.toLowerCase(), claimed: false },
        {
          claimed: true,
          claimedAt: new Date(block.timestamp * 1000),
          claimTxHash: event.transactionHash,
        }
      );

      // Update user stats
      await this.updateUser(player.toLowerCase(), {
        totalWon: amount.toString(),
      });

      logger.info(`💰 Winnings claimed: ${player} claimed ${ethers.formatEther(amount)} ETH`);
    } catch (error) {
      logger.error('Error handling winnings claimed:', error);
    }
  }

  private async handleNewRound(event: any): Promise<void> {
    try {
      const { roundId, endTime } = event.args;
      const block = await event.getBlock();

      const existingRound = await Round.findOne({ roundId: Number(roundId) });
      if (existingRound) {
        return; // Skip if already exists
      }

      const round = new Round({
        roundId: Number(roundId),
        startTime: new Date(block.timestamp * 1000),
        endTime: new Date(Number(endTime) * 1000),
        isActive: true,
        prizePool: '0',
        ticketCount: 0,
        status: 'active',
        carryOverAmount: '0',
      });

      await round.save();

      logger.info(`🎰 New round started: Round ${roundId}`);
    } catch (error) {
      logger.error('Error handling new round:', error);
    }
  }

  private async updateUser(address: string, updates: any): Promise<void> {
    try {
      const user = await User.findOne({ address });

      if (user) {
        if (updates.ticketsPurchased) {
          user.ticketsPurchased += updates.ticketsPurchased;
        }
        if (updates.totalSpent) {
          user.totalSpent = (BigInt(user.totalSpent) + BigInt(updates.totalSpent)).toString();
        }
        if (updates.totalWon) {
          user.totalWon = (BigInt(user.totalWon) + BigInt(updates.totalWon)).toString();
        }
        if (updates.roundId && !user.roundsParticipated.includes(updates.roundId)) {
          user.roundsParticipated.push(updates.roundId);
        }
        user.lastSeen = new Date();
        await user.save();
      } else {
        const newUser = new User({
          address,
          ticketsPurchased: updates.ticketsPurchased || 0,
          totalSpent: updates.totalSpent || '0',
          totalWon: updates.totalWon || '0',
          roundsParticipated: updates.roundId ? [updates.roundId] : [],
          firstSeen: new Date(),
          lastSeen: new Date(),
        });
        await newUser.save();
      }
    } catch (error) {
      logger.error('Error updating user:', error);
    }
  }

  async stop(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    this.contract.removeAllListeners();
    this.isListening = false;
    logger.info('🛑 Blockchain listener stopped');
  }
}

export default BlockchainListener;
