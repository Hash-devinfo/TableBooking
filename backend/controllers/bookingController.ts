// controllers/bookingController.ts
import { Response } from "express";
import Booking from "../models/Booking.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { date, time, guests, seatingType, request } = req.body;

    if (!date || !time || !guests || !seatingType) {
      return res.status(400).json({ message: "Date, time, guests, and seating type are required" });
    }

    const booking = new Booking({
      customer: req.userId,
      date,
      time,
      guests,
      seatingType,
      request,
    });

    await booking.save();

    return res.status(201).json({ message: "Booking confirmed", booking });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};