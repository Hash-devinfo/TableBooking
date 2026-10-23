import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;