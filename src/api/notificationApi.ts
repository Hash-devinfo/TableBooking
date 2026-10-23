import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:3000/api";

export type AppNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  booking?: string;
  isRead: boolean;
  createdAt: string;
};

async function request<T>(
  path: string,
  method: "GET" | "PATCH" = "GET",
): Promise<T> {
  const token = await SecureStore.getItemAsync("authToken");
  if (!token) throw new Error("You must be logged in");

  const response = await fetch(`${API_URL}/notifications${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");

  return data as T;
}

export const getNotifications = () =>
  request<{ notifications: AppNotification[]; unreadCount: number }>("");

export const getUnreadCount = async () =>
  (await request<{ unreadCount: number }>("/unread-count")).unreadCount;

export const markNotificationRead = (id: string) =>
  request(`/${id}/read`, "PATCH");

export const markAllNotificationsRead = () => request("/read-all", "PATCH");