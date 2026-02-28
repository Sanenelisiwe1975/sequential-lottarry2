import mongoose, { Schema, Document } from 'mongoose';

export interface IRound extends Document {
  roundId: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  prizePool: string;
  ticketCount: number;
  winningNumbers?: number[];
  drawnAt?: Date;
  txHash?: string;
  status: 'active' | 'drawn' | 'completed';
  carryOverAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoundSchema: Schema = new Schema(
  {
    roundId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    prizePool: {
      type: String,
      required: true,
      default: '0',
    },
    ticketCount: {
      type: Number,
      default: 0,
    },
    winningNumbers: {
      type: [Number],
      validate: {
        validator: function(v: number[]) {
          return !v || v.length === 7;
        },
        message: 'Winning numbers must contain exactly 7 numbers',
      },
    },
    drawnAt: {
      type: Date,
    },
    txHash: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'drawn', 'completed'],
      default: 'active',
      index: true,
    },
    carryOverAmount: {
      type: String,
      default: '0',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRound>('Round', RoundSchema);
