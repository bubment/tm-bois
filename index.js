const EXPRESS_PORT = 8081;
const express = require('express');
const app = express();
const path = require('path');
const convert = require('xml-js');

const mongoose = require('mongoose');
const Track = require('./models/track');

mongoose.connect('mongodb://localhost:27017/trackmania')
    .then(() => {
        console.log('MONGOOSE connection is open!');
    })
    .catch((error) => {
        console.log('MONGOOSE connection have failed!');
        console.log(error);
    });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.listen(EXPRESS_PORT, () => {
    console.log(`Trackmania app is listening on PORT ${EXPRESS_PORT}!`);
});

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/official-campaigns/:year/:season', async (req, res) => {
    const players = req.query.player;
    const { year, season } = req.params;
    let response = await collectSeasonRecords(year, season, players);
    console.log(response)
    res.render('campaign', { response });
});

app.post('/upload', async (req, res) => {
    console.log(req.body)
    let response = await saveReplays(req.body);
    res.send(response);
});

async function saveReplays(uploadedReplays) {
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
            parsedTrackUid = parseXML(replay.xml).header.map._attributes.uid;
            parsedTrackName = parseXML(replay.xml).header.map._attributes.name;
            parsedTrackAuthor = parseXML(replay.xml).header.map._attributes.author;
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

    return response;
};

async function collectSeasonRecords(year, season, players) {
    const MAX_SIZE = 3;
    let response;
    let trackRecords = [];
    let playerList = [];

    try {
        const seasonTracks = await Track.find({ $and: [{ 'campaignData.season': season }, { 'campaignData.year': year }] });
        for (let track of seasonTracks) {
            let records = track.records.filter(record => {
                isPlayerInQuery = players.includes(record.username);
                return (record.isPersonalBest && isPlayerInQuery)
            });

            let minTime = records.reduce((a, b) => (a.time < b.time) ? a : b).time
            records.forEach(function (record) {
                record.delta = record.time - minTime;
            });

            trackRecords.push({
                trackName: track.campaignData.trackNumber,
                trackRecords: records
            });

            trackRecords.sort((a, b) => (a.trackName < b.trackName) ? -1 : 1)
        }

        if (Array.isArray(players)) {
            playerList = players.slice(0, MAX_SIZE);
        } else {
            playerList.push(players);
        }

        response = {
            success: true,
            message: 'Successful query to the database!',
            campaign: [season.toUpperCase(), year],
            columns: playerList,
            data: trackRecords
        };
    } catch (error) {
        console.log(error);
        response = {
            success: false,
            message: 'An error occurred on a query to the database!',
            error: [error]
        };
    }

    return response;
}

function parseXML(xml) {
    return convert.xml2js(xml, { compact: true, spaces: 4 });
};

function exists(array, object, ...keys) {
    return array.some(element => keys.every(key => element[key] && object[key] && element[key] === object[key]));
}