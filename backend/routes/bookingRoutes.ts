// routes/bookingRoutes.ts
import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get(
  "/restaurant",
  protect,
  authorize("restaurant"),
  getRestaurantBookings,
);
router.patch("/:id/status", protect, updateBookingStatus);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
