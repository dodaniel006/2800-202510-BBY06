import { Router } from "express";
import User from "../config/db_schemas/User.js"; // Import User model
import { connectToMongo } from "../config/db.js"; // Import connectToMongo

import crypto from "crypto"; 
import User from "../config/db_schemas/User.js"; // Import User model
import PasswordResetToken from "../config/db_schemas/PasswordResetToken.js"; // Import PasswordResetToken model
import { connectToMongo } from "../config/db.js"; // Import connectToMongo
// TODO: import mailgun

const router = Router();

// Basic email validation regex
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

router.post("/", async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid or missing email address." });
  }

  try {
    await connectToMongo(); // Ensure DB connection

    const user = await User.findOne({ email });

    if (user) {
    console.log("User found:", user);
    
    // 1. Generate a cryptographically secure random token (this will be sent to the user)
      const rawToken = crypto.randomBytes(32).toString('hex');

      // 2. Create a new PasswordResetToken document
      // The 'token' field will be hashed by the pre('save') hook in PasswordResetToken.js
      const newPasswordResetToken = new PasswordResetToken({
        userId: user._id,
        token: rawToken, // Store the raw token here; it gets hashed before saving
      });

      // 3. Save the new token document
      await newPasswordResetToken.save();

      // TODO: Mail stuff



    } else {
      console.log("User not found:", email);
    };
    // For security reasons (to prevent email enumeration), always return a generic success message.
    // The actual email sending logic with a unique token would go here if the user exists.
    // For now, we just simulate the first part of the process.

    // if (user) {
    //   // TODO: Generate a password reset token, save it to the user record with an expiry,
    //   // and send an email with a reset link.
    //   console.log(`Password reset requested for existing user: ${email}`);
    // } else {
    //   console.log(`Password reset requested for non-existing user: ${email}`);
    // }

    res.status(200).json({ message: `If an account with the email "${email}" exists, a password reset link has been sent.` });

  } catch (error) {
    console.error("Error in /forgor route:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;

