import { Router } from 'express';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await fetch('https://healthapi.yehorskudilov.com/api/v2/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding login request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/get/:method', async (req, res) => {
  const { method } = req.params;
  const { accessToken, queries } = req.body;

  try {
    const response = await fetch(`https://healthapi.yehorskudilov.com/api/v2/fetch/${method}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queries })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




export default router;
