const express = require('express')
const app = express()
const PORT = 3000

app.use(express.static('public'))
app.get('/records', (req, res) => {
  const sampleResponse = [
    {player:'bubment', track:'Spring 2022 - 16', time:'58834'},
    {player:'bubment', track:'Spring 2022 - 17', time:'58835'},
    {player:'bubment', track:'Spring 2022 - 18', time:'58836'},
    {player:'bubment', track:'Spring 2022 - 19', time:'58837'},
    {player:'bubment', track:'Spring 2022 - 20', time:'58838'},
    {player:'CTRL_BUTTON', track:'Spring 2022 - 16', time:'58824'},
    {player:'CTRL_BUTTON', track:'Spring 2022 - 17', time:'58825'},
    {player:'CTRL_BUTTON', track:'Spring 2022 - 18', time:'58826'},
    {player:'CTRL_BUTTON', track:'Spring 2022 - 19', time:'58827'},
    {player:'CTRL_BUTTON', track:'Spring 2022 - 20', time:'58828'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 16', time:'58814'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 17', time:'58815'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 18', time:'58816'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 19', time:'58817'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 20', time:'58818'},
    {player:'ESC_BUTTON', track:'Spring 2022 - 21', time:'58818'},
  ]
  res.status(200).send(sampleResponse)
})

app.post('/replay', (req, res) => {
  const sampleResponse = {success:true, message:"Replay saved successfully"}
  res.status(200).send(sampleResponse)
})

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`)
})