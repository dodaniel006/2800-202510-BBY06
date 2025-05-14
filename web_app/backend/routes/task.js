import { Router } from "express";
import { connectToMongo } from "../config/db.js";
import Task from "../config/db_schemas/Task.js";
import User from "../config/db_schemas/User.js";

const router = Router();

router.post("/createTaskEntry", async (req, res) => {
  try {
    const { taskName, taskDescription, taskValue } = req.body;

    await connectToMongo();
    const data = await Task.insertOne({
      taskName: taskName,
      taskDescription: taskDescription,
      taskValue: taskValue,
    });

    if (data) {

        await User.updateOne(
            { _id: req.session.userId },
            { $push: { taskList: data._id } }
        )

        return res.status(200).json({
            success: true,
            message: "Task entry added successfully",
            taskEntry: {
                taskName: taskName,
                taskDescription: taskDescription,
                taskValue: taskValue,
            },
        });
    } else {
        return res.status(500).json({ error: "Failed to add task entry" });
    }
  } catch (error) {
    console.error("Error in /test:", error);
    res.status(500).json({ error: "MongoDB query failed" });
  }
});

router.get("/readUserTasks", async (req, res) => {
    try {
        await connectToMongo();

        // Get user document
        const taskArray = await User.find({
            email: req.session.email
        })    

        // Get user tasks
        const taskList = await Task.find({
            _id: { $in: taskArray[0].taskList }
        });

        if (taskList) {
          return res.status(200).json({
            success: true,
            message: taskList,
          });
        } else {
          return res.status(500).json({ error: "Failed to add task entry" });
        }
      } catch (error) {
        console.error("Error in /test:", error);
        res.status(500).json({ error: "MongoDB query failed" });
      }
});

export default router;