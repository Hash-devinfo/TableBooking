import { Router } from "express";
import { getUploadSignature } from "../controllers/uploadController.js";
import {  protect } from "../middleware/authMiddleware.js";

const router = Router();

// Only restaurant owners and admins can upload
router.post("/sign", protect, getUploadSignature);

export default router;