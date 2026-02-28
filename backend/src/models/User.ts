import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  address: string;
  ticketsPurchased: number;
  totalSpent: string;
  totalWon: string;
  roundsParticipated: number[];
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    ticketsPurchased: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: String,
      default: '0',
    },
    totalWon: {
      type: String,
      default: '0',
    },
    roundsParticipated: {
      type: [Number],
      default: [],
    },
    firstSeen: {
      type: Date,
      required: true,
    },
    lastSeen: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
