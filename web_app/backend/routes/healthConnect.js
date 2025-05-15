import { Router } from 'express';

const router = Router();
const methods = [
  "activeCaloriesBurned",
  "basalBodyTemperature",
  "basalMetabolicRate",
  "bloodGlucose",
  "bloodPressure",
  "bodyFat",
  "bodyTemperature",
  "boneMass",
  "cervicalMucus",
  "distance",
  "exerciseSession",
  "elevationGained",
  "floorsClimbed",
  "heartRate",
  "height",
  "hydration",
  "leanBodyMass",
  "menstruationFlow",
  "menstruationPeriod",
  "nutrition",
  "ovulationTest",
  "oxygenSaturation",
  "power",
  "respiratoryRate",
  "restingHeartRate",
  "sleepSession",
  "speed",
  "steps",
  "stepsCadence",
  "totalCaloriesBurned",
  "vo2Max",
  "weight",
  "wheelchairPushes"
];

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

export async function fetchHealthData({ method, accessToken, queries = {}, lastSyncedAt }) {
  if (lastSyncedAt) {
    queries.start = { ...(queries.start || {}), $gt: lastSyncedAt };
  }

  const response = await fetch(`https://healthapi.yehorskudilov.com/api/v2/fetch/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ queries })
  });

  const data = await response.json();
  return { data, status: response.status };
}

export async function fetchAllHealthData({ accessToken, queries = {}, lastSyncedAt }) {
  const results = {};

  for (const method of methods) {
    try {
      const { data, status } = await fetchHealthData({ method, accessToken, queries, lastSyncedAt });
      results[method] = { status, data };
    } catch (error) {
      console.error(`Error fetching ${method}:`, error);
      results[method] = { status: 500, error: error.message || 'Internal error' };
    }
  }

  return results;
}


router.post('/get/:method', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { method } = req.params;
  const { accessToken, queries, lastSyncedAt } = req.body;

  try {
    const { data, status } = await fetchHealthData({ method, accessToken, queries, lastSyncedAt });

    // ⬇️ Attach userId to each entry (if it's an array)
    const taggedData = Array.isArray(data)
      ? data.map(entry => ({ ...entry, userId }))
      : { ...data, userId };

    res.status(status).json(taggedData);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/getAll', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { accessToken, queries, lastSyncedAt } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Missing accessToken" });
  }

  try {
    const allResults = await fetchAllHealthData({ accessToken, queries, lastSyncedAt });

    // ⬇️ Attach userId to each result set
    for (const key of Object.keys(allResults)) {
      const item = allResults[key];
      if (Array.isArray(item.data)) {
        allResults[key].data = item.data.map(entry => ({ ...entry, userId }));
      }
    }

    res.json(allResults);
  } catch (error) {
    console.error('Error in fetchAllHealthData:', error);
    res.status(500).json({ error: 'Failed to fetch all health data' });
  }
});


export default router;
