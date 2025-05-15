import mongoose from "mongoose";

const gymLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  region: String,
  gymName: String,
  gymAddress: String,
  gymCoordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
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

// Export the Gym model
const Gym = mongoose.model("Gym", gymLogSchema);
export default Gym;
