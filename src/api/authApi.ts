const API_URL = "http://10.0.2.2:3000/api";
import * as SecureStore from "expo-secure-store";

// Add this function alongside signupUser and loginUser

export const getMe = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user profile");
  }

  return data;
};
async function postAuth<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `${path} failed`);
  }

  return data as T;
}

export const signupUser = (userData: {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  phone: string;
  role: string;
  password: string;
}) => postAuth("signup", userData);

export const loginUser = (credentials: {
  email: string;
  password: string;
}) => postAuth("login", credentials);

const fetchUserProfile = async () => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) return;

    const userData = await getMe(token);
    console.log("User Profile:", userData);
  } catch (error) {
    console.error("Error loading profile:", error);
  }
};