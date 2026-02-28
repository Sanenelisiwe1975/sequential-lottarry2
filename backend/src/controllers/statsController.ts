import { Request, Response, NextFunction } from 'express';
import Round from '../models/Round';
import Ticket from '../models/Ticket';
import User from '../models/User';
import Winner from '../models/Winner';
import logger from '../config/logger';

export const getGlobalStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalRounds = await Round.countDocuments();
    const activeRounds = await Round.countDocuments({ isActive: true });
    const totalTickets = await Ticket.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalWinners = await Winner.countDocuments();

    const allRounds = await Round.find();
    const totalPrizePool = allRounds.reduce((sum, round) => {
      return sum + BigInt(round.prizePool);
    }, BigInt(0));

    const allWinners = await Winner.find();
    const totalPrizesPaid = allWinners.reduce((sum, winner) => {
      return sum + BigInt(winner.prizeAmount);
    }, BigInt(0));

    const largestJackpot = await Winner.findOne({ tier: 6 })
      .sort({ prizeAmount: -1 })
      .select('prizeAmount roundId player');

    res.status(200).json({
      success: true,
      data: {
        totalRounds,
        activeRounds,
        completedRounds: totalRounds - activeRounds,
        totalTickets,
        totalUsers,
        totalWinners,
        totalPrizePool: totalPrizePool.toString(),
        totalPrizesPaid: totalPrizesPaid.toString(),
        largestJackpot,
        averageTicketsPerRound: totalRounds > 0 ? Math.floor(totalTickets / totalRounds) : 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching global stats:', error);
    next(error);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const recentTickets = await Ticket.find()
      .sort({ purchasedAt: -1 })
      .limit(limit)
      .select('ticketId roundId player numbers purchasePrice purchasedAt');

    const recentWinners = await Winner.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('roundId player tier prizeAmount matches claimed');

    res.status(200).json({
      success: true,
      data: {
        recentTickets,
        recentWinners,
      },
    });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    next(error);
  }
};

export const getNumberFrequency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rounds = await Round.find({ winningNumbers: { $exists: true, $ne: null } });

    const frequency: Record<number, number> = {};

    rounds.forEach(round => {
      if (round.winningNumbers) {
        round.winningNumbers.forEach(num => {
          frequency[num] = (frequency[num] || 0) + 1;
        });
      }
    });

    const sortedFrequency = Object.entries(frequency)
      .map(([number, count]) => ({ number: parseInt(number), count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        frequency: sortedFrequency,
        totalDraws: rounds.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching number frequency:', error);
    next(error);
  }
};
