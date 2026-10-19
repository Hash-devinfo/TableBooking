// routes/authRoutes.ts
import { Router } from "express";
import { signup, login, getMe, updateAccount, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateAccount);
router.delete("/me", protect, deleteAccount);

router.get("/me", protect, getMe);

export default router; 