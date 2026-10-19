import User from "../models/User.js";
import { sendEmail } from "./mailer.js";

// Customer-supplied text goes into the HTML, so escape it
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

type BookingForEmail = {
  _id: unknown;
  date: Date;
  time: string;
  guests: number;
  seatingType: string;
  floor?: string;
  request?: string;
};

export const notifyAdminsOfNewBooking = async (params: {
  booking: BookingForEmail;
  restaurantName: string;
  customerId?: string;
}) => {
  try {
    const { booking, restaurantName, customerId } = params;

    // Every admin account, plus ADMIN_EMAIL from .env if you set one
    const admins = await User.find({ role: "admin" }).select("email");
    const recipients = [
      ...new Set(
        [...admins.map((a) => a.email), process.env.ADMIN_EMAIL].filter(
          (e): e is string => !!e,
        ),
      ),
    ];
    if (recipients.length === 0) return;

    const customer = customerId
      ? await User.findById(customerId).select(
          "firstName lastName phone email",
        )
      : null;

    const customerName =
      `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim() ||
      "A customer";

    // Same code the customer and the restaurant owner see
    const code = `${restaurantName
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 3)
      .toUpperCase()}#${String(booking._id).slice(-6).toUpperCase()}`;

    const dateText = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const rows: [string, string][] = [
      ["Booking ID", code],
      ["Restaurant", restaurantName],
      ["Customer", customerName],
      ["Phone", customer?.phone ?? "-"],
      ["Email", customer?.email ?? "-"],
      ["Date", dateText],
      ["Time", booking.time],
      ["Guests", String(booking.guests)],
      ["Seating", booking.seatingType],
      ["Floor", booking.floor ?? "-"],
      ["Special request", booking.request?.trim() || "None"],
    ];

    const html =
      `<h2>New booking request</h2>` +
      `<table cellpadding="6" style="border-collapse:collapse">` +
      rows
        .map(
          ([label, value]) =>
            `<tr><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join("") +
      `</table>`;

    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

    await sendEmail({
      to: recipients.join(", "),
      subject: `New booking ${code} at ${restaurantName}`,
      html,
      text,
    });
  } catch (error) {
    // An email problem must never affect the booking itself
    console.error("Admin booking notification failed:", error);
  }
};