import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

import healthConnect from './backend/routes/healthConnect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT || 8100;

app.use(express.json());

//Frontend
app.use("/js", express.static("./frontend/js"));
app.use("/css", express.static("./frontend/css"));
app.use("/images", express.static("./frontend/assets/images"));
app.use("/videos", express.static("./frontend/assets/videos"));
app.use("/fonts", express.static("./frontend/assets/fonts"));
app.use("/views", express.static("./frontend/views"));

//Backend
app.use("/config", express.static("./backend/config"));
app.use('/api/healthConnect', healthConnect);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/views/main.html'))
})
app.get('/about', (req, res) => {
res.sendFile(path.join(__dirname, 'frontend/views/about.html'))
})

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/views/healthConnectTest.html'))
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
