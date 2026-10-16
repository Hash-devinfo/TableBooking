// routes/bookingRoutes.ts
import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  deleteBookingByOwner,
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
  authorize("restaurant","admin"),
  getRestaurantBookings,
);
router.patch("/:id/status", protect, authorize("restaurant","admin"), updateBookingStatus);
router.patch("/:id/cancel", protect, cancelBooking);
router.delete("/:id", protect, authorize("restaurant","admin"), deleteBookingByOwner);
export default router;
