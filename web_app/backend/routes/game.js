import { get_ws, add_user, send_data } from "../config/game_interface.js";
import { Router } from 'express';

const router = Router();

router.post('/points', (req, res) => {
  const { data } = req.body;
  console.log("Sending data", data, "to", req.session.email);
  send_data(data, req.session.email);
});

router.post('/send', (req, res) => {
  const { data } = req.body;
  console.log("Sending user", req.session.email);
  console.log("test")
  console.log(get_ws());
  add_user(req.session.email);
});


export default router;
