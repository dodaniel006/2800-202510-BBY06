
import { Router } from 'express';
import connectToMongo from '../config/db.js';
import { fetchAllHealthData } from './healthConnect.js';

const router = Router();


router.get('/test', async (req, res) => {
    try {
      const db = await connectToMongo();
      const data = await db.collection('users').findOne();
  
      console.log('Data fetched:', data);
  
      res.status(200).json(data ?? { message: 'No data found in users collection' });
    } catch (error) {
      console.error('Error in /test:', error);
      res.status(500).json({ error: 'MongoDB query failed' });
    }
  });

  router.post('/syncAll', async (req, res) => {
    const { accessToken, queries, lastSyncedAt } = req.body;
  
    if (!accessToken) {
      return res.status(400).json({ error: 'Missing accessToken' });
    }
  
    try {
      const db = await connectToMongo();
      const fetchedResults = await fetchAllHealthData({ accessToken, queries, lastSyncedAt });
  
      const insertResults = {};
  
      for (const method in fetchedResults) {
        const { status, data } = fetchedResults[method];
  
        if (status === 200 && Array.isArray(data) && data.length > 0) {
          try {
            const result = await db.collection(method).insertMany(data);
            insertResults[method] = { inserted: result.insertedCount };
          } catch (insertErr) {
            console.error(`Insert error for ${method}:`, insertErr);
            insertResults[method] = { error: insertErr.message };
          }
        } else {
          insertResults[method] = { inserted: 0, note: 'No data or bad response' };
        }
      }
  
      res.json(insertResults);
    } catch (err) {
      console.error('Error in /syncAll:', err);
      res.status(500).json({ error: 'Health data sync failed' });
    }
  });

  export default router;
