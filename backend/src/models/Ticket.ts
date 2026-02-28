import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  roundId: number;
  player: string;
  numbers: number[];
  purchasePrice: string;
  purchasedAt: Date;
  txHash: string;
  blockNumber: number;
  matches?: number;
  prizeAmount?: string;
  claimed: boolean;
  claimedAt?: Date;
  claimTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roundId: {
      type: Number,
      required: true,
      index: true,
    },
    player: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 7 && v.every(n => n >= 1 && n <= 49);
        },
        message: 'Ticket must contain exactly 7 numbers between 1 and 49',
      },
    },
    purchasePrice: {
      type: String,
      required: true,
    },
    purchasedAt: {
      type: Date,
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    blockNumber: {
      type: Number,
      required: true,
    },
    matches: {
      type: Number,
      min: 0,
      max: 7,
    },
    prizeAmount: {
      type: String,
      default: '0',
    },
    claimed: {
      type: Boolean,
      default: false,
      index: true,
    },
    claimedAt: {
      type: Date,
    },
    claimTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TicketSchema.index({ roundId: 1, player: 1 });
TicketSchema.index({ player: 1, purchasedAt: -1 });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
