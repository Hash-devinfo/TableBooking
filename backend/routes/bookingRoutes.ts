// routes/bookingRoutes.ts
import { Router } from "express";
import { cancelBooking, createBooking, getMyBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;