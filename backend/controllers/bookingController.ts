// controllers/bookingController.ts
import { Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Restaurant from "../models/Restaurant.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, date, time, guests, seatingType, request, floor } =
      req.body;

    if (!date || !time || !guests || !seatingType || !floor) {
      return res.status(400).json({
        message: "Date, time, guests,floor, and seating type are required",
      });
    }
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res
        .status(400)
        .json({ message: "Guests must be a whole number of at least 1" });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }
    if (!restaurantId || !mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (restaurant.isActive === false) {
    return res.status(400).json({ message: "This restaurant is not accepting bookings" });
  }
    if (restaurant.availableSeats && guestCount > restaurant.availableSeats) {
      return res
        .status(400)
        .json({ message: `Only ${restaurant.availableSeats} seats available` });
    }

    const booking = await Booking.create({
      customer: req.userId,
      restaurant: restaurant._id,
      date: bookingDate,
      time,
      guests: guestCount,
      seatingType,
      floor,
      request,
    });
    const populated = await booking.populate(
      "restaurant",
      "name city province images address phone",
    );

    return res
      .status(201)
      .json({ message: "Booking created", booking: populated });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ customer: req.userId })
      .populate("restaurant", "name city province images address phone")
      .sort({ date: -1, createdAt: -1 });

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

    if (booking.status !== "pending" && booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// All bookings for restaurants owned by the logged-in user
export const getRestaurantBookings = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const owned = await Restaurant.find({ owner: req.userId }).select("_id");
    const restaurantIds = owned.map((r) => r._id);

    const filter: Record<string, unknown> = {
      restaurant: { $in: restaurantIds },
    };

    const allowed = ["pending", "confirmed", "rejected", "cancelled"];
    if (
      typeof req.query.status === "string" &&
      allowed.includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("customer", "firstName lastName phone") // adjust to your User fields
      .populate("restaurant", "name")
      .sort({ date: 1, createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Restaurant bookings error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    if (!["confirmed", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be confirmed or rejected" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the restaurant's owner may respond
    const restaurant = await Restaurant.findOne({
      _id: booking.restaurant,
      owner: req.userId,
    });
    if (!restaurant) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cancelled bookings can't be changed" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Owner deletes a booking made at  restaurants
export const deleteBookingByOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the restaurant's owner may delete it
    const restaurant = await Restaurant.findOne({
      _id: booking.restaurant,
      owner: req.userId,
    });
    if (!restaurant) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (booking.status !== "rejected" && booking.status !== "cancelled") {
      return res.status(400).json({
        message: "Only rejected or cancelled bookings can be deleted",
      });
    }

    await booking.deleteOne();

    return res.status(200).json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
