const express = require('express')
const app = express()
const port = 8100

const session = require('express-session');

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
