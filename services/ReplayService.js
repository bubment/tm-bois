const xmlHandler = require('../helpers/xmlHandler')
const Track = require('../models/track')

async function saveReplays(req,res) {
    let uploadedReplays = req.body;
    let response = {
        success: true,
        message: 'Successful query to the database!',
        data: []
    };

    for (let replay of uploadedReplays) {
        let temporaryResponse;
        let parsedTrackUid, parsedTrackName, parsedTrackAuthor;
        let isCampaign = false;

        try {
            parsedTrackUid = xmlHandler.parseXML(replay.xml).header.map._attributes.uid;
            parsedTrackName = xmlHandler.parseXML(replay.xml).header.map._attributes.name;
            parsedTrackAuthor = xmlHandler.parseXML(replay.xml).header.map._attributes.author;
            if (parsedTrackAuthor == 'Nadeo') {
                isCampaign = true;
            }
        } catch (error) {
            temporaryResponse = `${replay.name} - ${replay.time} - An error occured while parsing the replay XML!`;
            continue;
        }

        try {
            let track = await Track.findOne({ uid: parsedTrackUid });
            if (track) {
                let newReplay = {
                    username: replay.name,
                    time: replay.time
                };

                let userRecords = track.records.filter(record => {
                    if (record.username == newReplay.username) {
                        return true
                    }
                });

                if (userRecords.length == 0) {
                    newReplay.isPersonalBest = true;
                    track.records.push(newReplay);
                    temporaryResponse = `${replay.name} - ${replay.time} - First record on track saved!`
                } else {
                    let isCopyInDatabase = exists(track.records, newReplay, 'username', 'time')

                    if (!isCopyInDatabase) {
                        let bestTime = userRecords.filter(record => record.isPersonalBest == true);
                        if (newReplay.time < bestTime[0].time) {
                            newReplay.isPersonalBest = true;
                            let index = track.records.indexOf(bestTime[0]);
                            track.records[index].isPersonalBest = false;

                            track.records.push(newReplay);
                            temporaryResponse = `${replay.name} - ${replay.time} - New record on track saved!`
                        } else {
                            newReplay.isPersonalBest = false;
                            track.records.push(newReplay);
                            temporaryResponse = `${replay.name} - ${replay.time} - Slower time on track saved!`
                        }
                    } else {
                        temporaryResponse = `${replay.name} - ${replay.time} - Time not saved, there is a copy in the database!`
                    }
                }

                try {
                    let saveResult = await track.save();
                    console.log(saveResult)
                } catch (error) {
                    temporaryResponse = `${replay.name} - ${replay.time} - An error occurred on a query to the database!`;
                    console.log(error);
                }

            } else {
                newTrack = new Track({
                    uid: parsedTrackUid,
                    author: parsedTrackAuthor,
                    name: parsedTrackName,
                    nadeoCampaign: isCampaign,
                    campaignData: {},
                    records: {
                        username: replay.name,
                        time: replay.time,
                        isPersonalBest: true,
                    }
                });

                if (isCampaign) {
                    temp = newTrack.name.replace('- ', '')
                    const [season, year, map] = temp.split(' ')
                    newTrack.campaignData.season = season;
                    newTrack.campaignData.year = year;
                    newTrack.campaignData.trackNumber = map;
                }

                try {
                    let saveResult = await newTrack.save();
                    temporaryResponse = `${replay.name} - ${replay.time} - First record on a new track saved!`;
                    console.log(saveResult)
                } catch (error) {
                    temporaryResponse = `${replay.name} - ${replay.time} - An error occurred on a query to the database!`;
                    console.log(error);
                }
            }
        } catch (error) {
            temporaryResponse = `${replay.name} - ${replay.time} - An error occurred on a query to the database!`;
            console.log(error);
        }
        response.data.push(temporaryResponse);
    }

    return res.status(200).send(response)
};

function exists(array, object, ...keys) {
    return array.some(element => keys.every(key => element[key] && object[key] && element[key] === object[key]));
}

module.exports = { saveReplays }