/**
 * Exported functions:
 * - ensureLoggedIn: Middleware to check if the user is logged in
 *   if not, redirects to the login page
 *
 */

import { Router } from "express";
import User from "../config/db_schemas/User.js";
import "dotenv/config"; // Load environment variables from .env file

const authRouter = Router();

export default authRouter;

// authentication middleware
function ensureLoggedIn(req, res, next) {
  if (req.session.authenticated) {
    return next(); // authenticated, go to next middleware
  } else {
    res.redirect("/login");
  }
}

export { ensureLoggedIn };

// GET /api/auth/logout
authRouter.get("/logout", (req, res) => {
  if (!req.session) {
    return res.status(400).json({ message: "No active session" });
  }

  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // remove session cookie
    return res.status(200).json({ message: "Logged out successfully" });
  });
});


// TODO: Joi validation for login data

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!username || !fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    // Check if username already exists
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res
        .status(409)
        .json({ message: "Username already taken." });
    }

    // Create new user
    const newUser = new User({
      username,
      fullName,
      email,
      password, // Password will be hashed by the pre-save hook in User.js schema
    });

    await newUser.save();

    // Session stuff
    req.session.authenticated = true;
    req.session.userId = newUser._id; // Store user ID in session
    req.session.email = newUser.email; // Store email in session
    req.session.username = newUser.username; // Store username in session

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error("Server registration error:", error);
    if (error.code === 11000) {
      // Duplicate key error (e.g. username might be unique too)
      return res.status(409).json({ message: "Username or email already taken." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPassMatch = await user.comparePassword(password);
    if (isPassMatch) {
      // Login success
      // TODO hadnle session stuffs
      req.session.authenticated = true;
      req.session.userId = user._id; // Store user ID in session
      req.session.email = user.email; // Store email in session
      req.session.username = user.username; // Store username in session

      res.status(200).json({ message: "Login success", userId: user._id });
    } else {
      return res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (error) {
    console.error("Server login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

