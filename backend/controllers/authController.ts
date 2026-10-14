import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAKISTANI_PHONE_REGEX = /^03\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const normalizePhone = (value: unknown) => {
  const phone = String(value ?? "").trim();
  return /^3\d{9}$/.test(phone) ? `0${phone}` : phone;
};

const parseDob = (value: unknown): Date | null => {
  if (typeof value !== "string") return null;

  const input = value.trim();
  let year: number;
  let month: number;
  let day: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    [year, month, day] = input.split("-").map(Number);
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
    [day, month, year] = input.split("-").map(Number);
  } else {
    return null;
  }

  const date = new Date(year, month - 1, day);

  // Reject impossible dates such as 31-02-1999.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const createToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, dob, phone, address, password } =
      req.body;
    const requestedRole = req.body.role ?? "customer";

    if (!firstName || !lastName || !email || !dob || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!PAKISTANI_PHONE_REGEX.test(normalizedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid Pakistani phone number",
      });
    }

    if (typeof password !== "string" || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain a letter, number, and special character",
      });
    }

    if (!["customer", "restaurant"].includes(requestedRole)) {
      return res.status(400).json({ message: "Invalid account role" });
    }

    const parsedDob = parseDob(dob);
    if (!parsedDob) {
      return res.status(400).json({
        message:
          "Date of birth must be a valid date in YYYY-MM-DD or DD-MM-YYYY format",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser?.email === normalizedEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }
    if (existingUser && String(existingUser.phone) === normalizedPhone) {
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      dob: parsedDob,
      phone: normalizedPhone,
      role: requestedRole,
      address: address,
      password: hashedPassword,
    });

    const { password: _password, ...safeUser } = user.toObject();

    return res.status(201).json({
      message: "Account created successfully",
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email or phone number already registered",
      });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id.toString(), user.role);
    const { password: _password, ...safeUser } = user.toObject();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
