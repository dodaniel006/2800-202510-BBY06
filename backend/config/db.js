import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './db_schemas/User.js';

export async function connectToMongo() {
  try {
    // Connects using URI from .env, specifies database
    const db = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'Japples'
    });
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}


export async function createUser(userData) {
  try {
    const newUser = new User({
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      age: userData.age,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      street: userData.street,
      city: userData.city,
      province: userData.province,
      postalCode: userData.postalCode,
      bio: userData.bio
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

export async function updateUserSettings(userId, updatedSettings) {
  try {
    connectToMongo()
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedSettings },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user settings:", error.message);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    await connectToMongo();

    const user = await User.findById(userId, '-password');
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw error;
  }
}