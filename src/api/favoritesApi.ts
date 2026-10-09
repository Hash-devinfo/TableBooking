const API_URL = "http://10.0.2.2:3000/api";

export type FavoriteRestaurant = {
  _id: string;
  name: string;
  cuisine?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  image?: string;
  [key: string]: unknown;
};

type FavoritesResponse = {
  favorites: FavoriteRestaurant[];
};

type ToggleFavoriteResponse = {
  message: string;
  isFavorite: boolean;
};

const getApiUrl = () => {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
  }

  return API_URL.replace(/\/$/, "");
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Favorites request failed");
  }

  return data as T;
};

export const getFavorites = async (token: string) => {
  const response = await fetch(`${getApiUrl()}/favorites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse<FavoritesResponse>(response);
  return data.favorites;
};

export const toggleFavorite = async (
  token: string,
  restaurantId: string,
) => {
  const response = await fetch(
    `${getApiUrl()}/favorites/${encodeURIComponent(restaurantId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return parseResponse<ToggleFavoriteResponse>(response);
};