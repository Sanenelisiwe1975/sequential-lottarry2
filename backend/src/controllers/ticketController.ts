import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketsByPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ player: address.toLowerCase() })
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments({ player: address.toLowerCase() });

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching tickets by player:', error);
    next(error);
  }
};

export const getTicketsByRound = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roundId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ roundId: parseInt(roundId) })
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments({ roundId: parseInt(roundId) });

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching tickets by round:', error);
    next(error);
  }
};

export const getPlayerTicketsForRound = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, roundId } = req.params;

    const tickets = await Ticket.find({
      player: address.toLowerCase(),
      roundId: parseInt(roundId),
    }).sort({ purchasedAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    logger.error('Error fetching player tickets for round:', error);
    next(error);
  }
};
