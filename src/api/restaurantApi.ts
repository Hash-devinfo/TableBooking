import axios from "axios";

const API_URL = "http://10.0.2.2:3000/api";

const API = axios.create({
  baseURL: API_URL,
});

export interface Restaurant {
  _id: string;
  name: string;
  cuisines: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  description: string;
  images: string[];
  openingTime: string;
  closingTime: string;
  rating: number;
  reviewCount: number;
  floorNumbers: string[];
  availableSeats: number;
  seatingTypes: string[];
}


export const getRestaurantById = async (restaurantId: string): Promise<Restaurant> => {
  const response = await API.get(`/restaurants/${restaurantId}`);
  return response.data.restaurant;
};


export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  const response = await API.get("/restaurants");
  return response.data.restaurants;
};

export const resolveImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  try {
    
    if (url.includes("google.com/imgres")) {
      const real = new URL(url).searchParams.get("imgurl");
      if (real) url = real;
    }
  } catch {
    // fall through with the original url
  }

  return url.replace(/^http:\/\//i, "https://");
};