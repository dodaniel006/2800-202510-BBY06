import { Router } from 'express';
import { connectToMongo } from '../config/db.js';
import { fetchAllHealthData } from './healthConnect.js';
import mongoose from 'mongoose';

const router = Router();

// Allow any schema, and let MongoDB handle _id (if UUIDs, leave them as-is)
const getDynamicModel = (name) =>
  mongoose.models[name] ||
  mongoose.model(
    name,
    new mongoose.Schema(
      {
        _id: { type: String, required: true }, // allow UUID strings
        userId: { type: mongoose.Types.ObjectId, ref: 'users' } // link to user
      },
      { strict: false }
    )
  );


router.get("/test", async (req, res) => {
  try {
    await connectToMongo();
    const User = getDynamicModel("users");
    const data = await User.findOne();
    console.log("Data fetched:", data);
    res.status(200).json(data ?? { message: "No data found in users collection" });
  } catch (error) {
    console.error("Error in /test:", error);
    res.status(500).json({ error: "MongoDB query failed" });
  }
});

router.post("/syncAll", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: No session" });

  const { accessToken, queries, lastSyncedAt } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "Missing accessToken" });
  }

  try {
    await connectToMongo();
    const fetchedResults = await fetchAllHealthData({ accessToken, queries, lastSyncedAt });
    const insertResults = {};

    for (const method in fetchedResults) {
      const { status, data } = fetchedResults[method];

      if (status === 200 && Array.isArray(data) && data.length > 0) {
        try {
          const GenericModel = getDynamicModel(method);
          const taggedData = data.map((item) => ({
            ...item,
            userId: userId.toString(), // ensure it's stored as ObjectId or string
          }));

          const result = await GenericModel.insertMany(taggedData, { ordered: false });
          insertResults[method] = { inserted: result.length };
        } catch (insertErr) {
          console.error(`Insert error for ${method}:`, insertErr);
          insertResults[method] = { error: insertErr.message };
        }
      } else {
        insertResults[method] = {
          inserted: 0,
          note: "No data or bad response",
        };
      }
    }

    res.json(insertResults);
  } catch (err) {
    console.error("Error in /syncAll:", err);
    res.status(500).json({ error: "Health data sync failed" });
  }
});

router.get('/data/:method', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { method } = req.params;

  try {
    const Model = getDynamicModel(method);
    const data = await Model.find({ userId: userId.toString() }).lean();

    res.status(200).json(data);
  } catch (err) {
    console.error(`Error fetching ${method} for user ${userId}:`, err);
    res.status(500).json({ error: 'Failed to fetch user-specific data' });
  }
});


export default router;
