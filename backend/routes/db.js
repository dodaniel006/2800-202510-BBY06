
import { Router } from 'express';
import connectToMongo from '../config/db.js';
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

  export default router;
