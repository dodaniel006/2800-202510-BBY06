import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./db_schemas/User.js";

/**
 * I believe you must use the connectDB method before using createUser..
 * Still figuring this out - Jacob
 * 
 */

const connectDB = await mongoose.connect(process.env.MONGODB_URI);
console.log(`MongoDB Connected: ${connectDB.connection.host}`);

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

export { connectDB, createUser };