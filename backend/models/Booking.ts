// models/Booking.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  guests: number;
  seatingType: string;
  request?: string;
  floor: string;
  status: "pending" | "confirmed" | "cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    seatingType: { type: String, required: true },
    request: { type: String },
    floor: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Booking: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  bookingSchema,
);

export default Booking;
