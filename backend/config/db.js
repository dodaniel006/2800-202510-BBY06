import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./db_schemas/User.js";

async function connectToMongo() {
  try {
    // Connects using URI from .env, specifies database
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "Japples",
    });
    // Removing the console log to avoid cluttering the console
    // console.log('✅ Connected to MongoDB');
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

export default connectToMongo;

export async function createUser(userData) {
  try {
    const newUser = new User({
      username: userData.username,
      password: userData.password, // Gets hashed in the User model
      firstName: userData.firstName,
      lastName: userData.lastName,
      age: userData.age,
      email: userData.email,
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    // Log the detailed validation error
    console.error("Error creating user in createUser function:", error.message);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
  }
}
