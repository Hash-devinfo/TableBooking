import type { Booking } from "../api/bookingApi";


export const getBookingCode = (
  booking: Pick<Booking, "_id" | "restaurant">,
  restaurantName?: string,
): string => {
  const ref = booking.restaurant;
  const name =
    restaurantName ??
    (ref && typeof ref === "object" ? ref.name : undefined) ??
    "Restaurant";

  const prefix = name.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  return `${prefix}#${booking._id.slice(-6).toUpperCase()}`;
};