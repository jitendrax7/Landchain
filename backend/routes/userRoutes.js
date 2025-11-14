import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;

    
    if (!name || !phone || !email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "All fields (name, phone, email, password, role) are required.",
      });
    }

    const allowedRoles = ["farmer", "gramsabha"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role. Allowed: farmer, gramsabha",
      });
    }
    const exist = await User.findOne({ $or: [{ email }, { phone }] });
    if (exist) {
      return res.status(409).json({
        status: "error",
        message: "User already exists with this email or phone.",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    user.save();

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
