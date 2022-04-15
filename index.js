const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const PORT = 3000

const dbName = 'tm-bois';
const DB_URL = `mongodb+srv://bubment:ABC123abc@cluster0.ph1px.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(DB_URL);
const db = client.db(dbName);
const collection = db.collection('records');

app.use(express.static('public'))
app.get('/records', async (req, res) => {
  const recordsList = await collection.find().toArray();
  res.status(200).send(formatRecords(recordsList))
})

app.post('/replays', async (req, res) => {
  const insertResult = await collection.insertMany([
    {
      player:'bubment',
      track:'Spring 2022 - 17',
      time:31845
    }
  ]);
  const reqBody = [
    {
      authorNickname:"bubment",
      time:74888,
      xml:"<header type=\"replay\" exever=\"3.3.0\" exebuild=\"2022-04-11_15_55\" title=\"TMStadium\"><map uid=\"nPNAxzaFzu5HURpQa3LugeWC9mm\" name=\"Spring 2022 - 24\" author=\"Nadeo\" authorzone=\"\"/><desc envir=\"Stadium\" mood=\"\" maptype=\"TrackMania\\TM_Race\" mapstyle=\"\" displaycost=\"0\" mod=\"\" /><playermodel id=\"CarSport\"/><times best=\"74888\" respawns=\"-1\" stuntscore=\"0\" validable=\"1\"/><checkpoints cur=\"9\" /></header>"
    },
    {
      authorNickname:"bubment",
      time:74889,
      xml:"<header type=\"replay\" exever=\"3.3.0\" exebuild=\"2022-04-11_15_55\" title=\"TMStadium\"><map uid=\"nPNAxzaFzu5HURpQa3LugeWC9mm\" name=\"Spring 2022 - 25\" author=\"Nadeo\" authorzone=\"\"/><desc envir=\"Stadium\" mood=\"\" maptype=\"TrackMania\\TM_Race\" mapstyle=\"\" displaycost=\"0\" mod=\"\" /><playermodel id=\"CarSport\"/><times best=\"74888\" respawns=\"-1\" stuntscore=\"0\" validable=\"1\"/><checkpoints cur=\"9\" /></header>"
    }
  ]
  //1. Get all records
  const recordsList = await collection.find().toArray();
  //1.1 Parse body
  const parsedRecords = reqBody.map(rawRecord => {
    const findingExpression = 'name="'
    const strStartPos = rawRecord.xml.search(new RegExp(`${findingExpression}`)) + findingExpression.length
    const strEndPos = rawRecord.xml.indexOf('"',strStartPos)
    const track = rawRecord.xml.substring(strStartPos,strEndPos)
    return {
      player: rawRecord.authorNickname,
      time:rawRecord.time,
      track
    }
  })
  let insertableRecordsArray = [];
  let updatableRecordsArray = [];
  //2. Create inserable recordsArray
  for (let i = 0; i < parsedRecords.length; i++) {
    const record = parsedRecords[i];
    const matchingRecord = recordsList.find(dbRecord => dbRecord.player == record.player && dbRecord.track == record.track)
    if(!matchingRecord){
      insertableRecordsArray.push(parsedRecords)
    }
  }
  //3. Create updatable records array

  //4. Insert records
  //5. Update records
  //6. Return result to client
  // const sampleResponse = {success:true, message:"Replay saved successfully"}
  res.status(200).send(parsedRecords)
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

