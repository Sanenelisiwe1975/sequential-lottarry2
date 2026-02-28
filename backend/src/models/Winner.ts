import mongoose, { Schema, Document } from 'mongoose';

export interface IWinner extends Document {
  roundId: number;
  ticketId: string;
  player: string;
  tier: number;
  matches: number;
  prizeAmount: string;
  winningNumbers: number[];
  playerNumbers: number[];
  claimed: boolean;
  claimedAt?: Date;
  claimTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WinnerSchema: Schema = new Schema(
  {
    roundId: {
      type: Number,
      required: true,
      index: true,
    },
    ticketId: {
      type: String,
      required: true,
      index: true,
    },
    player: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    tier: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    matches: {
      type: Number,
      required: true,
      min: 2,
      max: 7,
    },
    prizeAmount: {
      type: String,
      required: true,
    },
    winningNumbers: {
      type: [Number],
      required: true,
    },
    playerNumbers: {
      type: [Number],
      required: true,
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

// Compound indexes
WinnerSchema.index({ roundId: 1, tier: 1 });
WinnerSchema.index({ player: 1, claimed: 1 });

export default mongoose.model<IWinner>('Winner', WinnerSchema);
