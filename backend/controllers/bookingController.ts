// controllers/bookingController.ts
import { Response } from "express";
import mongoose from "mongoose";
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

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ customer: req.userId }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findOne({ _id: id, customer: req.userId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};