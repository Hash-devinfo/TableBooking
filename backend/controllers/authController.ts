// controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Restaurant from "../models/Restaurant.js";
import { AuthRequest } from "../middleware/authMiddleware.js";



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAKISTANI_PHONE_REGEX = /^03\d{9}$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const normalizePhone = (value: unknown) => {
  const digits = String(value ?? "").trim();
  return /^3\d{9}$/.test(digits) ? `0${digits}` : digits;
};




// signup controller
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dob,
      phone,
      role,
      password,
    } = req.body;


    if (
      !firstName ||
      !lastName ||
      !email ||
      !dob ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

  
    const pakistaniPhoneRegex = /^03\d{9}$/;

    if (!pakistaniPhoneRegex.test(String(phone))) {
      return res.status(400).json({
        message: "Please enter a valid Pakistani phone number",
      });
    }

 
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain an alphabet, number, and special character",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = String(phone).trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      if (String(existingUser.phone) === normalizedPhone) {
        return res.status(409).json({
          message: "Phone number already registered",
        });
      }
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      dob: new Date(dob),
      phone: normalizedPhone,
      role: role || "customer",
      password: hashedPassword,
     
    });

    const { password: _omit, ...safeUser } = user.toObject();


    return res.status(201).json({
      message: "Account created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Login controller


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password: _omit, ...safeUser } = user.toObject();

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