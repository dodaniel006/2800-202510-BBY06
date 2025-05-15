import "../config/game_interface.js";
import { Router } from 'express';
import fs from 'fs';
import User from "../config/db_schemas/User.js";

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

router.post('/points', (req, res) => {
  const { data } = req.body;
  console.log("Sending data", data, "to", req.session.email);
  // send_data(data, req.session.email);
});

router.post('/send', (req, res) => {
  const { data } = req.body;
  console.log("Sending user", req.session.email);
  // add_user(req.session.email);
});


export default router;
