import type { Response } from "express";
import cloudinary from "../config/cloudinary.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const getUploadSignature = (_req: AuthRequest, res: Response) => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: "Image uploads are not configured" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "tablebooking/restaurants";

  // Cloudinary only accepts an upload whose parameters match this signature
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    CLOUDINARY_API_SECRET,
  );

  return res.status(200).json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
};