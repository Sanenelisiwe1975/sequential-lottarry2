import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Ticket from '../models/Ticket';
import Winner from '../models/Winner';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const user = await User.findOne({ address: address.toLowerCase() });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();

    const user = await User.findOne({ address: normalizedAddress });
    const totalTickets = await Ticket.countDocuments({ player: normalizedAddress });
    const winners = await Winner.find({ player: normalizedAddress });
    const unclaimedWinnings = await Winner.find({
      player: normalizedAddress,
      claimed: false,
    });

    const totalWinnings = winners.reduce((sum, winner) => {
      return sum + BigInt(winner.prizeAmount);
    }, BigInt(0));

    const unclaimedAmount = unclaimedWinnings.reduce((sum, winner) => {
      return sum + BigInt(winner.prizeAmount);
    }, BigInt(0));

    const winsByTier = winners.reduce((acc, winner) => {
      acc[winner.tier] = (acc[winner.tier] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    res.status(200).json({
      success: true,
      data: {
        user,
        statistics: {
          totalTickets,
          totalWins: winners.length,
          totalWinnings: totalWinnings.toString(),
          unclaimedWinnings: unclaimedAmount.toString(),
          winsByTier,
          roundsParticipated: user?.roundsParticipated.length || 0,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    next(error);
  }
};

export const getUserWinnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const claimed = req.query.claimed === 'true' ? true : req.query.claimed === 'false' ? false : undefined;

    const query: any = { player: address.toLowerCase() };
    if (claimed !== undefined) {
      query.claimed = claimed;
    }

    const winnings = await Winner.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: winnings,
    });
  } catch (error) {
    logger.error('Error fetching user winnings:', error);
    next(error);
  }
};

export const getTopPlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topPlayers = await User.find()
      .sort({ totalWon: -1 })
      .limit(limit)
      .select('address ticketsPurchased totalSpent totalWon roundsParticipated');

    res.status(200).json({
      success: true,
      data: topPlayers,
    });
  } catch (error) {
    logger.error('Error fetching top players:', error);
    next(error);
  }
};
