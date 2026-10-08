import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:3000/api";

export type Booking = {
  _id: string;
  date: string;
  time: string;
  guests: number;
  floor?: string;
  seatingType: string;
  request?: string;
  status: "pending" | "confirmed" | "cancelled";
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
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

export const createBooking = async (bookingData: {
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