// controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

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

    // =========================
    // 9. Response
    // =========================
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