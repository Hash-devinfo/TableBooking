import { Router } from "express";
import {
  getFavorites,
  toggleFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getFavorites);
router.post("/:restaurantId/toggle", protect, toggleFavorite);

export default router;