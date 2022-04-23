const mongoose = require('mongoose');

var recordSchema = mongoose.Schema({
    username: {
        type: String,
        required: false
    },
    time: {
        type: Number,
        required: false
    },
    isPersonalBest: {
        type: Boolean,
        required: false
    },
    fileData: {
        type: Array,
        required: false
    },
    saveDate: {
        type: Date,
        default: Date.now,
        required: false
    }
}, { _id: false });

const trackShema = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: false
    },

    name: {
        type: String,
        required: false
    },

    nadeoCampaign: {
        type: Boolean,
        required: true
    },

    campaignData: {
        season: {
            type: String,
            required: false
        },

        year: {
            type: Number,
            required: false
        },

        trackNumber: {
            type: Number,
            required: false
        }
    },

    records: [recordSchema]
});

const Track = mongoose.model('Record', trackShema);
module.exports = Track;