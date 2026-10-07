// routes/bookingRoutes.ts
import { Router } from "express";
import { createBooking } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createBooking);

export default router;