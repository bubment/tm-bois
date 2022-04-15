const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const PORT = 8081

const dbName = 'tm-bois';
const DB_URL = `mongodb+srv://bubment:ABC123abc@cluster0.ph1px.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(DB_URL);
const db = client.db(dbName);
const collection = db.collection('records');
app.use(express.static('public'))
app.use(express.json());
app.get('/records', async (req, res) => {
  const recordsList = await collection.find().toArray();
  res.status(200).send(formatRecords(recordsList))
})

app.post('/replays', async (req, res) => {
  //define the real request body
  const reqBody = req.body;
  let response, recordsList;
  try {
    recordsList = await collection.find().toArray();
  } catch (error) {
    console.log(error)
    response = {success:false, message:"An error occurred while fetching the records from db", data:null}
    return res.status(400).send(response)
  }
  
  let parsedRecords,findingExpression,strStartPos,strEndPos,track;
  try {
    parsedRecords = reqBody.map(rawRecord => {
      findingExpression = 'name="'
      strStartPos = rawRecord.xml.search(new RegExp(`${findingExpression}`)) + findingExpression.length
      strEndPos = rawRecord.xml.indexOf('"',strStartPos)
      track = rawRecord.xml.substring(strStartPos,strEndPos)
      return {
        player: rawRecord.driverNickname,
        time:rawRecord.time,
        track
      }
    })
  } catch (error) {
    console.log(error)
    response = {success:false, message:"Error while parsing records", data:null}
    return res.status(400).send(response)
  }

  let insertableRecordsArray = [];
  let updatableRecordsArray = [];
  for (let i = 0; i < parsedRecords.length; i++) {
    const record = parsedRecords[i];
    const matchingRecord = recordsList.find(dbRecord => dbRecord.player == record.player && dbRecord.track == record.track)
    if(!matchingRecord){
      insertableRecordsArray.push(record)
      continue;
    }
    if(record.time < matchingRecord.time){
      updatableRecordsArray.push(record)
      continue;
    }
  }
  if (insertableRecordsArray.length) {
    try {
      await collection.insertMany(insertableRecordsArray);
    } catch (error) {
      console.log(error)
      response = {success:false, message:"Error while inserting new records", data:null}
      return res.status(400).send(response)
    }
    
  }
  for (let i = 0; i < updatableRecordsArray.length; i++) {
    const updateElement = updatableRecordsArray[i];
    try {
      await collection.updateOne({ player: updateElement.player, track:updateElement.track }, { $set: { time: updateElement.time } });
    } catch (error) {
      console.log(error)
      response = {success:false, message:"Error while updating records", data:null}
      return res.status(400).send(response)
    }
  }
  recordsList = await collection.find().toArray();
  response = {success:true, message:"Replay saved successfully", data:formatRecords(recordsList)}
  res.status(200).send(response)
})


app.listen(PORT, async () => {
  await client.connect();
  console.log(`Example app listening on PORT ${PORT}`)
})

function formatRecords(records) {
  return records.map(record => {
    record.track = record.track.replace("- ","")
    const [season,year,map] = record.track.split(" ")
    return {
      player:record.player,
      track:{season,year,map},
      time:record.time
    }
  })
}

