const { Router } = require('express')
const replayService = require('../services/ReplayService')
// const validator = require('./movie.validator')
const route = Router();

module.exports = (app) => {
    app.use('/replays', route)
    route.post('/upload', replayService.saveReplays)
}