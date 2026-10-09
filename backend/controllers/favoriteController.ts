import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantIdParam = req.params.restaurantId;
    const restaurantId = Array.isArray(restaurantIdParam)
      ? restaurantIdParam[0]
      : restaurantIdParam;

    if (!restaurantId || !mongoose.isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    const id = new mongoose.Types.ObjectId(restaurantId);

    const removed = await User.updateOne(
      { _id: req.userId, favorites: id },
      { $pull: { favorites: id } },
    );

    if (removed.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Removed from favourites", isFavorite: false });
    }

    const restaurantExists = await Restaurant.exists({ _id: id });

    if (!restaurantExists) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await User.updateOne({ _id: req.userId }, { $addToSet: { favorites: id } });

    return res
      .status(200)
      .json({ message: "Added to favourites", isFavorite: true });
  } catch (error) {
    console.error("Toggle favourite error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
      .select("favorites")
      .populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Get favourites error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
