import { Router } from "express";
import User from "../config/db_schemas/User.js"; // Import User model
import { connectToMongo } from "../config/db.js"; // Import connectToMongo

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

