// controllers/bookingController.ts
import { Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Restaurant from "../models/Restaurant.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { notifyAdminsOfNewBooking } from "../utils/bookingEmails.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );

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
      return res
        .status(400)
        .json({ message: "This restaurant is not accepting bookings" });
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

    void notifyAdminsOfNewBooking({
      booking,
      restaurantName: restaurant.name,
      customerId: req.userId,
    });

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
    const customer = await User.findById(booking.customer).select(
      "email firstName",
    );

    if (customer?.email) {
      const messages = {
        confirmed: {
          subject: "🎉 Your Table Booking is Confirmed!",
          text: `Hi ${customer.firstName}, great news! ${restaurant.name} has confirmed your table reservation.\n\nBooking Details:\n- Date: ${booking.date}\n- Time: ${booking.time}\n- Guests: ${booking.guests}\n- Seating Type: ${booking.seatingType}\n- Floor: ${booking.floor || "Standard Floor"}\n- Reference ID: ${booking._id}\n\nLocation: ${restaurant.address || "N/A"}\nContact: ${restaurant.phone || "N/A"}\n\nWe look forward to hosting you!`,
          html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 5px;">Booking Confirmed! 🎉</h2>
      <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0;">Your table is locked in and ready for you.</p>
      
      <p>Hi <b>${escapeHtml(customer.firstName)}</b>,</p>
      <p>Great news! <b>${escapeHtml(restaurant.name)}</b> has successfully accepted and confirmed your table reservation.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 6px 0;"><b>📅 Date:</b> ${escapeHtml(booking.date)}</p>
        <p style="margin: 6px 0;"><b>⏰ Time:</b> ${escapeHtml(booking.time)}</p>
        <p style="margin: 6px 0;"><b>👥 Guests:</b> ${booking.guests} People</p>
        <p style="margin: 6px 0;"><b>🪑 Seating Type:</b> ${escapeHtml(booking.seatingType)}</p>
        <p style="margin: 6px 0;"><b>🏢 Floor:</b> ${escapeHtml(booking.floor || "Standard Floor")}</p>
        <p style="margin: 6px 0;"><b>🆔 Reference ID:</b> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(booking._id)}</span></p>
      </div>

      ${restaurant.address ? `<p style="margin: 6px 0;"><b>📍 Location:</b> ${escapeHtml(restaurant.address)}</p>` : ""}
      ${restaurant.phone ? `<p style="margin: 6px 0;"><b>📞 Restaurant Contact:</b> ${escapeHtml(restaurant.phone)}</p>` : ""}

      <p style="margin-top: 20px; color: #475569; font-size: 14px;">If you need to review your booking or make modifications, you can manage it directly through your account dashboard.</p>
      
      <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
        <a href="myapp://home" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Booking in App</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Thank you for using our Table Booking App. See you soon!</p>
    </div>
  `,
        },
        rejected: {
          subject: "❌ Update Regarding Your Table Booking Request",
          text: `Hi ${customer.firstName}, unfortunately, ${restaurant.name} was unable to accept your table reservation for ${booking.date} at ${booking.time}.\n\nWe apologize for any inconvenience. You can explore other available restaurants or try booking for a different time slot in the app.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
              <h2 style="color: #dc2626; text-align: center; margin-bottom: 5px;">Booking Request Declined</h2>
              <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0;">Unfortunately, the restaurant could not accommodate your request.</p>
              
              <p>Hi <b>${escapeHtml(customer.firstName)}</b>,</p>
              <p>We regret to inform you that <b>${escapeHtml(restaurant.name)}</b> was unable to accept your table reservation request for this time slot.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 6px 0;"><b>📅 Requested Date:</b> ${escapeHtml(booking.date)}</p>
                <p style="margin: 6px 0;"><b>⏰ Requested Time:</b> ${escapeHtml(booking.time)}</p>
                <p style="margin: 6px 0;"><b>👥 Guests:</b> ${booking.guests} People</p>
                <p style="margin: 6px 0;"><b>🆔 Reference ID:</b> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(booking._id)}</span></p>
              </div>

              <p style="margin-top: 20px; color: #475569; font-size: 14px;">Don't worry! There are plenty of other amazing dining options available. You can browse nearby restaurants and try booking a different time or location.</p>
              
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                <a href="myapp://home" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Browse Other Restaurants</a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Thank you for using our Table Booking App.</p>
            </div>
          `,
        },
        cancelled: {
          subject: "⚠️ Notice: Your Table Booking Was Cancelled",
          text: `Hi ${customer.firstName}, your table reservation at ${restaurant.name} (Ref: ${booking._id}) has been successfully cancelled.\n\nIf you did not request this cancellation, please contact support or check your app dashboard.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
              <h2 style="color: #475569; text-align: center; margin-bottom: 5px;">Booking Cancelled</h2>
              <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0;">This reservation has been cancelled.</p>
              
              <p>Hi <b>${escapeHtml(customer.firstName)}</b>,</p>
              <p>Your table reservation at <b>${escapeHtml(restaurant.name)}</b> has been cancelled as requested.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #64748b;">
                <p style="margin: 6px 0;"><b>📅 Date was:</b> ${escapeHtml(booking.date)}</p>
                <p style="margin: 6px 0;"><b>⏰ Time was:</b> ${escapeHtml(booking.time)}</p>
                <p style="margin: 6px 0;"><b>🆔 Reference ID:</b> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(booking._id)}</span></p>
              </div>

              <p style="margin-top: 20px; color: #475569; font-size: 14px;">If you'd like to book a new table or choose another spot, feel free to open the app anytime.</p>
              
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                <a href="myapp://home" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open App</a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Thank you for using our Table Booking App.</p>
            </div>
          `,
        },
      } as const;

      const message = messages[status as keyof typeof messages];

      if (message) {
        void sendEmail({
          to: customer.email,
          ...message,
        });
      }
    }

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
