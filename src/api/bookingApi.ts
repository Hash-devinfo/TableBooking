
import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:3000/api";

export const createBooking = async (bookingData: {
  date: string;
  time: string;
  guests: number;
  floor:string;
  seatingType: string;
  request?: string;
}) => {
  const token = await SecureStore.getItemAsync("authToken");

  if (!token) {
    throw new Error("You must be logged in to book a table");
  }

  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Booking failed");
  }

  return data;
};