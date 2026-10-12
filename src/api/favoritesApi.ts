import axios from "axios";
import type { Restaurant } from "./restaurantApi"; // update to your restaurant API file name

const API_URL = "http://10.0.2.2:3000/api"; // same as your restaurant API

const API = axios.create({
  baseURL: API_URL,
});

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Shape the favourites screen uses
export type FavoriteRestaurant = {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  location: string;
  image: string | null;
};

const mapToFavorite = (r: Restaurant): FavoriteRestaurant => ({
  _id: r._id,
  name: r.name,
  cuisine: r.cuisines,
  rating: r.rating ?? 0,
  reviewCount: r.reviewCount ?? 0,
  location: [r.city, r.province].filter(Boolean).join(", "),
  image: r.images?.length ? r.images[0] : null,
});

export const getFavorites = async (token: string): Promise<FavoriteRestaurant[]> => {
  const response = await API.get("/favorites", authHeader(token));
  const list: Restaurant[] = response.data.favorites ?? [];
  return list.filter(Boolean).map(mapToFavorite);
};

export const toggleFavorite = async (token: string, restaurantId: string) => {
  const response = await API.post(
    `/favorites/${restaurantId}/toggle`,
    {},
    authHeader(token)
  );
  return response.data as { message: string; isFavorite: boolean };
};