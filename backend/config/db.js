import { mongoose } from 'mongoose';
import { dotenv } from 'dotenv';
dotenv.config();

import User from "./db_schemas/User.js";

async function connectToMongo() {
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

export default connectToMongo;


async function createUser(firstName, lastName, age, email, password) {
    try {
    const user = new User({firstName: firstName, lastName: lastName,
         age: age, email: email, password: password});
    await user.save();
    console.log(user);
    } catch (error) {
        console.error("Error creating user:", error.message);
    }
}

export { createUser };