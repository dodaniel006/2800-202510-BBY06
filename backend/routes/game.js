
import { Router } from 'express';
import fs from 'fs';

const router = Router();

router.post('/write', async (req, res) => {
  const { datapath } = req.body;
  console.log("Wrote");
  fs.writeFileSync(datapath, JSON.stringify([{"roadAdd":50.0, "roadScore":0}]));
  setTimeout(function(){
    fs.writeFileSync(datapath, JSON.stringify([{"roadAdd":0.0, "roadScore":0}]));
  }, 1000);
  res.status(200);
});

export default router;
