const express = require('express')
const app = express()
const PORT = 3000

app.use(express.static('public'))
app.get('/test', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`)
})