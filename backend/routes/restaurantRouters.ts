import { Router } from "express";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// Owner-specific protected route (Must come before /:id in Express execution)
router.get("/me/profile", protect, authorize("restaurant"), getMyRestaurant);

// Admin / Owner protected routes
router.post("/", protect, authorize("restaurant"), createRestaurant);
router.put("/:id", protect, authorize("restaurant", "admin"), updateRestaurant);
router.delete(
  "/:id",
  protect,
  authorize("restaurant", "admin"),
  deleteRestaurant,
);

export default router;
