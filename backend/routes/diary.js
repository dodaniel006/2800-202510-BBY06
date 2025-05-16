import { Router, urlencoded } from "express";
import { connectToMongo } from "../config/db.js";
import Food from "../config/db_schemas/Food.js";

const router = Router();
router.use(urlencoded({ extended: true }));

router.post("/addFoodToDiary", async (req, res) => {
  try {
    const { foodItem, foodCalories, foodAmount } = req.body;

    console.log("foodItem: ", foodItem);
    console.log("foodCalories: ", foodCalories);
    console.log("foodAmount: ", foodAmount);

    await connectToMongo();
    const data = await Food.insertOne({
      userId: req.session.userId,
      foodName: foodItem,
      foodAmount: foodAmount,
      foodCalorie: foodCalories,
    });

    console.log("data: ", data);

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

router.put("/editFood", async (req, res) => {
  try {
    const { name, amount, calorie, foodItemId } = req.body;

    await connectToMongo();
    const data = await Food.updateOne(
      { _id: foodItemId, userId: req.session.userId },
      {
        $set: {
          foodName: name,
          foodAmount: amount,
          foodCalorie: calorie,
        },
      }
    );

    if (data) {
      return res.status(200).json({
        success: true,
        message: "Food item updated successfully",
        foodItem: {
          foodName: name,
          foodAmount: amount,
          foodCalorie: calorie,
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
      userId: req.session.userId,
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

router.get("/calorieChart{/:from}{/:to}", async (req, res) => {
  try {
    await connectToMongo();
    const { from, to } = req.params;

    // Find food entries for the current user created today
    const foodList = await Food.find(
      {
        userId: req.session.userId,
        createdAt: { $gte: from, $lt: to },
      },
      {
        foodCalorie: 1,
        foodAmount: 1,
        createdAt: 1,
        _id: 0,
      }
    );

    const chartData = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(from);
      day.setDate(day.getDate() + i);
      chartData[day.toISOString().split("T")[0]] = 0;
    }

    foodList.forEach((food) => {
      food.foodCalorie = parseFloat(food.foodCalorie);
      food.foodAmount = parseFloat(food.foodAmount);
      chartData[food.createdAt.toISOString().split("T")[0]] +=
        food.foodCalorie * food.foodAmount;
    });

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error in /test:", error);
    res.status(500).json({ error: "MongoDB query failed" });
  }
});

export default router;
