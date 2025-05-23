import { Router } from "express";
import User from "../config/db_schemas/User.js"; // Import User model
import { connectToMongo } from "../config/db.js"; // Import connectToMongo

import crypto from "crypto"; 
import PasswordResetToken from "../config/db_schemas/PasswordResetToken.js"; // Import PasswordResetToken model
import sendEmail from "../notifications/mail.js";

const router = Router();

// Rate Limiting Parameters for Session
const MAX_SESSION_RESET_ATTEMPTS = 1; // Max 5 attempts per session
const SESSION_RESET_WINDOW_MS = 1 * 60 * 1000; // 1 minute in milliseconds

// Basic email validation regex
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

router.post("/", async (req, res) => {
  const { email } = req.body;

    // --- Session-based Rate Limiting ---
  if (!req.session.forgotPasswordAttempts) {
    req.session.forgotPasswordAttempts = [];
  }

  const now = Date.now();

  // Filter out attempts older than the window.
  // req.session.forgotPasswordAttempts will now contain only attempts made within the SESSION_RESET_WINDOW_MS.
  req.session.forgotPasswordAttempts = req.session.forgotPasswordAttempts.filter(
    timestamp => now - timestamp < SESSION_RESET_WINDOW_MS
  );

  if (req.session.forgotPasswordAttempts.length >= MAX_SESSION_RESET_ATTEMPTS) {
    console.log(`Session rate limit exceeded for email: ${email}, Session ID: ${req.sessionID}`);

    // Calculate time remaining until the oldest attempt in the current window expires.
    // The oldest attempt is the first one in the filtered req.session.forgotPasswordAttempts array.
    const oldestAttemptInWindow = req.session.forgotPasswordAttempts[0];
    const timeWhenOldestAttemptExpires = oldestAttemptInWindow + SESSION_RESET_WINDOW_MS;
    const timeRemainingMs = timeWhenOldestAttemptExpires - now;
    const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1000); // Round up to the nearest second

    return res.status(200).json({ message: `You may try again in ${timeRemainingSeconds} seconds. Hint: Do you have multiple japples pages open?` });
  }
  // --- End Session-based Rate Limiting ---

  // Input validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid or missing email address." });
  }

  try {
    await connectToMongo(); // Ensure DB connection

    const user = await User.findOne({ email });

    if (user) {
    console.log("User found:", user);
    
          // Record this attempt for session rate limiting BEFORE processing
      req.session.forgotPasswordAttempts.push(now);
      // Note: session data is typically saved at the end of the request-response cycle by express-session
      // If you need to ensure it's saved before an async operation that might not complete,
      // you might call req.session.save() but it's usually not necessary here.

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

      // 4. Send the email with the reset link
      // temporary test email
      sendEmail(email, user.firstName, "Password Reset Request", `here is ya code ${user.firstName}: ${rawToken}`);

    } else {
      console.log("User not found:", email);
      req.session.forgotPasswordAttempts.push(now);
    };

    res.status(200).json({ message: `If an account with the email "${email}" exists, a password reset link has been sent.` });

  } catch (error) {
    console.error("Error in /forgor route:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;

