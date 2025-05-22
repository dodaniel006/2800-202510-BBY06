import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to your User model
  },
  token: {
    type: String,
    required: true,
    unique: true, // Tokens should be unique
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m', // Automatically delete this document after 10 minutes (e.g., 600 seconds)
    // You can adjust the '10m' (10 minutes) to your desired TTL, e.g., '1h' for 1 hour.
  },
});

// Method to hash the token before saving (optional, but good practice)
// This is different from the user schema method; here we hash the token itself for storage.
// The token sent to the user will be unhashed. When verifying, hash the user-provided token and compare.
passwordResetTokenSchema.pre('save', async function(next) {
    if (this.isModified('token')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.token = await bcrypt.hash(this.token, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;