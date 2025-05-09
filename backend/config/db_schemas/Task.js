import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskName: String,
  taskDescription: String,
  taskValue: Number,
});

// Export the Task model
const Task = mongoose.model("Task", taskSchema);
export default Task;
