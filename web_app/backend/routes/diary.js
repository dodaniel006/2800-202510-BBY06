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

// DeepSeek API endpoint
router.post("/generate-recipe", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { ingredient } = req.body;
    console.log("Generating recipe for:", ingredient);

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a professional chef. Format all responses in GitHub Flavored Markdown (GFM) compatible with marked.js parser. Follow these rules:
                1. Always add spaces after # headers (e.g., "## Title")
                2. Use **bold** for emphasis, not __underscores__
                3. Use - for unordered lists, not *
                4. Leave blank lines between paragraphs and list items
                5. Escape special characters like () with backslashes when needed
                6. Use --- for horizontal rules
                7. Do not say you are using a requested formated response,
                8. Do not ask for variations or alternatives or more information after provided the recipe`,
            },
            {
              role: "user",
              content: `Generate a detailed recipe for ${ingredient} using this exact format:
      
                ### **Recipe Name** 
                [Brief description]

                #### **Difficulty Level:** [Level]
                #### **Prep Time:** [Time] 
                #### **Cook Time:** [Time]
                #### **Total Time:** [Time]
                #### **Servings:** [Number]

                ---

                ### **Ingredients**
                #### **For [Component]:**
                - [Quantity] [Ingredient] ([Notes])
                - [Quantity] [Ingredient]

                ---

                ### **Instructions**
                1. [Step 1]
                2. [Step 2]

                ---

                ### **Tips**
                - [Tip 1]
                - [Tip 2]`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.json({ recipe: data.choices[0].message.content });
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

export default router;
