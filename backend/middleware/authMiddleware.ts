// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Single, unified interface extending Express Request
export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    

    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    // Call next() to move to the next middleware/controller
    next();
  };
};