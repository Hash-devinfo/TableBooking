import type { Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: req.userId, isRead: false }),
    ]);

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Small and cheap: the bell badge calls this
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      isRead: false,
    });
    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    // Matching on user means nobody can mark someone else's notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.userId },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true },
    );
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};