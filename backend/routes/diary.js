import { Router, urlencoded } from "express";
import connectToMongo from "../config/db.js";
import Food from "../config/db_schemas/Food.js";

const router = Router();
router.use(urlencoded({ extended: true }));

router.post("/addFoodToDiary", async (req, res) => {
  try {
    const { foodItem, foodCalories, foodAmount } = req.body;

    await connectToMongo();
    const data = await Food.insertOne({
      foodName: foodItem,
      foodAmount: foodAmount,
      foodCalorie: foodCalories,
    });

    if (data) {
      return res.status(200).json({
        success: true,
        message: "Food item added successfully",
        foodItem: {
          foodName: foodItem,
          foodAmount: foodAmount,
          foodCalorie: foodCalories,
        },
      });
    } else {
      return res.status(500).json({ error: "Failed to add food item" });
    }
  } catch (error) {
    console.error("Error in /test:", error);
    res.status(500).json({ error: "MongoDB query failed" });
  }
});

router.post("/deleteFoodFromDiary", async (req, res) => {
  try {
    const { foodItemId } = req.body;

    await connectToMongo();
    const data = await Food.deleteOne({
      _id: foodItemId,
    });

    if (data) {
      return res.status(200).json({
        success: true,
        message: "Food item deleted successfully",
      });
    } else {
      return res.status(500).json({ error: "Failed to add food item" });
    }
  } catch (error) {
    console.error("Error in /test:", error);
    res.status(500).json({ error: "MongoDB query failed" });
  }
});

export default router;
