/**
 * Exported functions:
 * - ensureLoggedIn: Middleware to check if the user is logged in
 *   if not, redirects to the login page
 *
 */

import { Router } from "express";
import User from "../config/db_schemas/User.js";
import PasswordResetToken from "../config/db_schemas/PasswordResetToken.js";
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
authRouter.post("/logout", async (req, res) => {
    const isHealthAppLinked = req.body?.isHealthAppLinked;
    const _id = req.body?.userId;

    // Only update user if data is provided
    if (typeof isHealthAppLinked === 'boolean' && _id) {
      const user = await User.findOne({ _id});
      console.log("User found:", user);
      if (user) {
        user.isHealthAppLinked = isHealthAppLinked;
        await user.save(); // ✅ Save changes
        console.log("User updated:", user);
      }
    }

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
      taskList: [],
      roadScore: 0, 
      ws: 0,
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
  const { email, password, isHealthAppLinked } = req.body;

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
      if (isHealthAppLinked) {
            user.isHealthAppLinked = isHealthAppLinked;
      }
      await user.save(); // Save the updated user object

      // TODO hadnle session stuffs
      req.session.authenticated = true;
      req.session.userId = user._id; // Store user ID in session
      req.session.email = user.email; // Store email in session
      req.session.username = user.username; // Store username in session


      res.status(200).json({ message: "Login success", userId: user._id, username: user.username});

    } else {
      return res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (error) {
    console.error("Server login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle password reset
authRouter.post("/reset-password", async (req, res) => {
  const { tokenId, token, newPassword } = req.body;

  if (!tokenId || !token || !newPassword) {
    return res.status(400).json({ message: "Missing required fields (tokenId, token, newPassword)." });
  }

  if (newPassword.length < 8) { // Consistent with client-side validation
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  try {
    // 1. Find the token document by its ID
    const passwordResetTokenDoc = await PasswordResetToken.findById(tokenId);

    if (!passwordResetTokenDoc) {
      return res.status(400).json({ message: "Invalid or expired password reset link. Please request a new one." });
    }

    // 2. Verify the raw token against the hashed token in the database
    // The 'verifyToken' method needs to be implemented in the PasswordResetToken schema
    const isValidToken = await passwordResetTokenDoc.verifyToken(token); 

    if (!isValidToken) {
      return res.status(400).json({ message: "Invalid or expired password reset token. Please request a new one." });
    }

    // 3. Check if the token has expired (based on its createdAt field + expiry time)
    // PasswordResetToken schema has an 'expiresAt' virtual or a pre-save hook to set it.
    // Or, we can check it here directly if 'expiresAt' is a field.
    // For this example, let's assume PasswordResetToken has an 'expiresAt' field.
    if (passwordResetTokenDoc.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: tokenId }); // Clean up expired token
      return res.status(400).json({ message: "Password reset link has expired. Please request a new one." });
    }

    // 4. Find the user associated with the token
    const user = await User.findById(passwordResetTokenDoc.userId);
    if (!user) {
      // This case should ideally not happen if the token was valid and linked to a user
      return res.status(404).json({ message: "User not found for this token." });
    }

    // 5. Update the user's password
    // The User model should have a pre-save hook to hash the password
    user.password = newPassword;
    await user.save();

    // 6. Delete the used password reset token
    await PasswordResetToken.deleteOne({ _id: tokenId });

    // 7. Optionally, log the user out of other sessions if desired (more complex)

    res.status(200).json({ message: "Password has been successfully reset. You can now log in with your new password." });

  } catch (error) {
    console.error("Error in /reset-password route:", error);
    if (error.name === 'CastError' && error.path === '_id') { // Handle invalid ObjectId format for tokenId
        return res.status(400).json({ message: "Invalid token ID format." });
    }
    res.status(500).json({ message: "Internal server error during password reset." });
  }
});

