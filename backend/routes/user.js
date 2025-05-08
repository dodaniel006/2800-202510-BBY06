import { Router } from 'express';
import { connectToMongo } from '../config/db.js';
import mongoose from 'mongoose';
import User from '../config/db_schemas/User.js'; // ✅ required

const router = Router();
const presetUserId = new mongoose.Types.ObjectId('6812be6afd11a4f1efb4bdfa');

// Functions
export async function updateUserSettings(userId, updatedSettings) {
  try {
    await connectToMongo(); // ✅
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedSettings },
      { new: true, runValidators: true }
    );

    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  } catch (error) {
    console.error("Error updating user settings:", error.message);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    await connectToMongo(); // ✅
    const user = await User.findById(userId, '-password');
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw error;
  }
}

// Endpoints
router.put('/account', async (req, res) => {
  try {
    const updatedUser = await updateUserSettings(presetUserId, req.body);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Account settings update failed:', err);
    res.status(500).json({ error: 'Settings update failed' });
  }
});

router.get('/account', async (req, res) => {
  try {
    const user = await getUserById(presetUserId);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
