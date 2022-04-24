const Track = require('../models/track')

function indexPage(req,res) {
    return res.render('index');
}

async function officialCampaignPage(req,res) {
    const players = req.query.player;
    const { year, season } = req.params;
    let response = await collectSeasonRecords(year, season, players);
    console.log(response)
    return res.render('campaign', { response });
}

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

module.exports = { indexPage, officialCampaignPage }