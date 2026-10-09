import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  cuisines: string[];
  city: string;
  province: string;
  address?: string;
  phone?: string;
  description?: string;
  images: string[];
  openingTime?: string;
  closingTime?: string;
  rating: number;
  reviewCount: number;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    cuisines: { type: [String], default: [] },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    description: { type: String },
    images: { type: [String], default: [] },
    openingTime: { type: String },
    closingTime: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

const Restaurant: Model<IRestaurant> = mongoose.model<IRestaurant>(
  "Restaurant",
  restaurantSchema,
);

export default Restaurant;