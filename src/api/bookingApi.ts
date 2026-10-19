import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:3000/api";

type PopulatedRestaurant = {
  _id: string;
  name?: string;
  city?: string;
  province?: string;
  images?: string[];
  address?: string;
  phone?: string;
};

type PopulatedCustomer = {
  _id: string;
  firstName?: string;
  lastName?: string;
  
};

export type Booking = {
  _id: string;
  restaurant?: string | PopulatedRestaurant;
  customer?: string | PopulatedCustomer;
  date: string;
  time: string;
  guests: number;
  floor?: string;
  seatingType: string;
  request?: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  createdAt: string;
};

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync("authToken");

  if (!token) {
    throw new Error("You must be logged in");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async (response: Response, fallbackMessage: string) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

/* ------------------------------ Customer ------------------------------ */

export const createBooking = async (bookingData: {
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  floor: string;
  seatingType: string;
  request?: string;
}) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(bookingData),
  });

  return parseResponse(response, "Booking failed");
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/bookings`, { headers });

  const data = await parseResponse(response, "Could not load bookings");
  return data.bookings;
};

export const cancelBooking = async (bookingId: string) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers,
  });

  return parseResponse(response, "Could not cancel booking");
};

// Bookings made at the logged-in owner's restaurants
export const getRestaurantBookings = async (
  status?: Booking["status"],
): Promise<Booking[]> => {
  const headers = await getAuthHeaders();
  const query = status ? `?status=${status}` : "";

  const response = await fetch(`${API_URL}/bookings/restaurant${query}`, {
    headers,
  });

  const data = await parseResponse(response, "Could not load bookings");
  return data.bookings;
};

// Owner confirms or rejects a pending booking
export const updateBookingStatus = async (
  bookingId: string,
  status: "confirmed" | "rejected",
): Promise<Booking> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });

  const data = await parseResponse(response, "Could not update booking");
  return data.booking;
};

export const deleteBooking = async (bookingId: string) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: "DELETE",
    headers,
  });

  return parseResponse(response, "Could not delete booking");
};