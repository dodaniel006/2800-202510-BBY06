import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

import healthConnect from './routes/healthConnect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT || 8100;

app.use(express.json());

app.use('/api/healthConnect', healthConnect);


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/main.html')
})
app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/public/html/about.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
