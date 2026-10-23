import type { Types } from "mongoose";
import Notification, { type NotificationType } from "../models/Notification.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";

type Id = string | Types.ObjectId;
type BookingInfo = {
  _id: Id;
  customer: Id;
  restaurant: Id;
  date: Date | string;
  time: string;
  guests: number;
};
const push = async (n: {
  user: Id;
  type: NotificationType;
  title: string;
  message: string;
  booking: Id;
}) => {
  await Notification.create(n);
};
const whenText = (date: Date | string, time: string) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return time;

  const day = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Karachi", // so the day matches what your customers picked
  });
  return `${day} at ${time}`;
};

// The people and restaurant a booking involves
const context = async (booking: BookingInfo) => {
  const [restaurant, customer] = await Promise.all([
    Restaurant.findById(booking.restaurant).select("name owner"),
    User.findById(booking.customer).select("firstName lastName"),
  ]);

  const customerName =
    `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim() ||
    "A customer";

  return {
    restaurantName: restaurant?.name ?? "the restaurant",
    ownerId: restaurant?.owner as Id | undefined,
    customerName,
    when: whenText(booking.date, booking.time),
  };
};
// Customer made a booking
export const notifyBookingCreated = async (booking: BookingInfo) => {
  try {
    const c = await context(booking);

    await push({
      user: booking.customer,
      type: "booking_request",
      title: "Booking Request Received",
      message: `Your booking request for ${c.restaurantName} on ${c.when} has been received and is waiting for confirmation.`,
      booking: booking._id,
    });

    if (c.ownerId) {
      await push({
        user: c.ownerId,
        type: "booking_new",
        title: "New Booking Request",
        message: `${c.customerName} requested a table for ${booking.guests} on ${c.when}.`,
        booking: booking._id,
      });
    }
  } catch (error) {
    console.error("Notification error (created):", error);
  }
};
const DECISIONS = {
  confirmed: {
    type: "booking_confirmed",
    title: "Booking Confirmed",
    text: (restaurant: string, when: string) =>
      `${restaurant} confirmed your table for ${when}.`,
  },
  rejected: {
    type: "booking_rejected",
    title: "Booking Declined",
    text: (restaurant: string, when: string) =>
      `${restaurant} couldn't accept your booking for ${when}.`,
  },
  completed: {
    type: "booking_completed",
    title: "Booking Completed",
    text: (restaurant: string, when: string) =>
      `Thanks for dining at ${restaurant}! Your booking on ${when} is now complete.`,
  },
} as const;

// Owner changed the booking's status
export const notifyBookingDecision = async (
  booking: BookingInfo,
  decision: keyof typeof DECISIONS,
) => {
  try {
    const c = await context(booking);
    const d = DECISIONS[decision];

    await push({
      user: booking.customer,
      type: d.type,
      title: d.title,
      message: d.text(c.restaurantName, c.when),
      booking: booking._id,
    });
  } catch (error) {
    console.error("Notification error (decision):", error);
  }
};

// Customer cancelled
export const notifyBookingCancelled = async (booking: BookingInfo) => {
  try {
    const c = await context(booking);
    if (!c.ownerId) return;

    await push({
      user: c.ownerId,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `${c.customerName} cancelled their booking for ${c.when}.`,
      booking: booking._id,
    });
  } catch (error) {
    console.error("Notification error (cancelled):", error);
  }
};
