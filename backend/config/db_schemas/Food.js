import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  foodName: String,
  foodAmount: Number,
  foodCalorie: Number,
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Food model
const Food = mongoose.model("Food", foodSchema);
export default Food;
