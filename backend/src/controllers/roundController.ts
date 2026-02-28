import { Request, Response, NextFunction } from 'express';
import Round from '../models/Round';
import Ticket from '../models/Ticket';
import Winner from '../models/Winner';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const getCurrentRound = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentRound = await Round.findOne({ isActive: true }).sort({ roundId: -1 });

    if (!currentRound) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active round found',
      });
    }

    res.status(200).json({
      success: true,
      data: currentRound,
    });
  } catch (error) {
    logger.error('Error fetching current round:', error);
    next(error);
  }
};

export const getRoundById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roundId } = req.params;
    const round = await Round.findOne({ roundId: parseInt(roundId) });

    if (!round) {
      throw new AppError('Round not found', 404);
    }

    res.status(200).json({
      success: true,
      data: round,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRounds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const rounds = await Round.find()
      .sort({ roundId: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Round.countDocuments();

    res.status(200).json({
      success: true,
      data: rounds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching rounds:', error);
    next(error);
  }
};

export const getRoundStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roundId } = req.params;

    const round = await Round.findOne({ roundId: parseInt(roundId) });
    if (!round) {
      throw new AppError('Round not found', 404);
    }

    const tickets = await Ticket.countDocuments({ roundId: parseInt(roundId) });
    const winners = await Winner.find({ roundId: parseInt(roundId) });

    const winnersByTier = winners.reduce((acc, winner) => {
      acc[winner.tier] = (acc[winner.tier] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const totalPrizesPaid = winners.reduce((sum, winner) => {
      return sum + BigInt(winner.prizeAmount);
    }, BigInt(0));

    res.status(200).json({
      success: true,
      data: {
        round,
        statistics: {
          totalTickets: tickets,
          totalWinners: winners.length,
          winnersByTier,
          totalPrizesPaid: totalPrizesPaid.toString(),
          claimed: winners.filter(w => w.claimed).length,
          unclaimed: winners.filter(w => !w.claimed).length,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching round stats:', error);
    next(error);
  }
};

export const getRoundWinners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roundId } = req.params;

    const winners = await Winner.find({ roundId: parseInt(roundId) }).sort({ tier: 1 });

    res.status(200).json({
      success: true,
      data: winners,
    });
  } catch (error) {
    logger.error('Error fetching round winners:', error);
    next(error);
  }
};
