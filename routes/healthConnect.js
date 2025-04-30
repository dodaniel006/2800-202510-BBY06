import { Router } from 'express';

const router = Router();

// Sample GET route
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from BBY06 router!' });
  });

export default router;
